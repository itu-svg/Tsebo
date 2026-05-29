'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createBrowserClient()
  const [status, setStatus] = useState<'checking' | 'success' | 'pending'>('checking')
  const ref = searchParams.get('ref')

  useEffect(() => {
    if (!ref) { router.push('/'); return }
    let attempts = 0
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('purchases')
        .select('status')
        .eq('paystack_reference', ref)
        .single()
      attempts++
      if (data?.status === 'completed') {
        setStatus('success')
        clearInterval(interval)
      } else if (attempts >= 5) {
        setStatus('pending')
        clearInterval(interval)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [ref])

  return (
    <div style={{ minHeight: '100vh', background: '#0D0A07', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
      <Link href="/" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 700, color: '#E8B86D', marginBottom: '40px', display: 'block' }}>
        TSEBO
      </Link>
      {status === 'checking' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '28px', color: '#EDE0C8', marginBottom: '12px' }}>Confirming your payment…</h1>
          <p style={{ color: '#8A7560' }}>Please wait a moment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '32px', color: '#E8B86D', marginBottom: '12px' }}>Payment Successful!</h1>
          <p style={{ color: '#B5A48A', marginBottom: '28px', fontSize: '16px' }}>Your book has been added to your library.</p>
          <Link href="/library" style={{ background: '#E8B86D', color: '#16120D', padding: '12px 32px', borderRadius: '3px', fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Go to My Library
          </Link>
        </>
      )}
      {status === 'pending' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '28px', color: '#EDE0C8', marginBottom: '12px' }}>Payment Received</h1>
          <p style={{ color: '#B5A48A', marginBottom: '8px' }}>Your payment is being processed. Your book will appear in your library shortly.</p>
          <p style={{ color: '#8A7560', fontSize: '13px', marginBottom: '28px' }}>If it does not appear within 5 minutes, please contact support.</p>
          <Link href="/library" style={{ background: '#E8B86D', color: '#16120D', padding: '12px 32px', borderRadius: '3px', fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Go to My Library
          </Link>
        </>
      )}
    </div>
  )
}
