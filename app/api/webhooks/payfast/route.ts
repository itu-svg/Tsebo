import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

function pfSign(data: Record<string, string>, passphrase: string): string {
  const str = Object.entries(data)
    .filter(([k]) => k !== 'signature')
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
    .join('&')
  const withPass = passphrase ? `${str}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : str
  return crypto.createHash('md5').update(withPass).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = Object.fromEntries(new URLSearchParams(body))

    // Verify signature
    const passphrase = process.env.PAYFAST_PASSPHRASE ?? ''
    const expectedSig = pfSign(params, passphrase)
    if (params.signature !== expectedSig) {
      console.error('PayFast signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Verify payment status
    if (params.payment_status === 'COMPLETE') {
      const reference = params.m_payment_id
      const supabase = createAdminClient()
      await supabase
        .from('purchases')
        .update({ status: 'completed' })
        .eq('paystack_reference', reference)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('PayFast webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
