import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

function pfSign(data: Record<string, string>, passphrase: string): string {
  const str = Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
    .join('&')
  const withPass = passphrase ? `${str}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : str
  return crypto.createHash('md5').update(withPass).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { book_id, user_id, email } = await req.json()
    if (!book_id || !user_id || !email) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: book, error: bookErr } = await supabase
      .from('books')
      .select('id, title, price')
      .eq('id', book_id)
      .single()
    if (bookErr || !book) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 })
    }

    const reference = `tsebo_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const amountRand = (book.price / 100).toFixed(2)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tsebo.vercel.app'

    // Create pending purchase record
    await supabase.from('purchases').insert({
      user_id,
      book_id,
      amount_paid: book.price,
      currency: 'ZAR',
      paystack_reference: reference,
      status: 'pending',
    })

    // Build PayFast params
    const pfData: Record<string, string> = {
      merchant_id:      process.env.PAYFAST_MERCHANT_ID!,
      merchant_key:     process.env.PAYFAST_MERCHANT_KEY!,
      return_url:       `${appUrl}/payment/success?ref=${reference}`,
      cancel_url:       `${appUrl}/payment/cancelled`,
      notify_url:       `${appUrl}/api/webhooks/payfast`,
      email_address:    email,
      m_payment_id:     reference,
      amount:           amountRand,
      item_name:        book.title.substring(0, 100),
      item_description: `Tsebo ebook: ${book.title}`,
      custom_str1:      book_id,
      custom_str2:      user_id,
    }

    const passphrase = process.env.PAYFAST_PASSPHRASE ?? ''
    pfData.signature = pfSign(pfData, passphrase)

    const isSandbox = process.env.PAYFAST_SANDBOX === 'true'
    const pfHost = isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process'

    const queryString = Object.entries(pfData)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    return NextResponse.json({
      success: true,
      redirect_url: `${pfHost}?${queryString}`,
    })
  } catch (err: any) {
    console.error('Create payment error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
