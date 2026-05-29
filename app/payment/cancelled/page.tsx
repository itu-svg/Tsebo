'use client'
import Link from 'next/link'

export default function PaymentCancelledPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D0A07', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
      <Link href="/" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 700, color: '#E8B86D', marginBottom: '40px', display: 'block' }}>
        TSEBO
      </Link>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>↩️</div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '28px', color: '#EDE0C8', marginBottom: '12px' }}>Payment Cancelled</h1>
      <p style={{ color: '#8A7560', marginBottom: '28px' }}>No payment was taken. You can return to the store whenever you are ready.</p>
      <Link href="/" style={{ background: '#E8B86D', color: '#16120D', padding: '12px 32px', borderRadius: '3px', fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
        Back to Store
      </Link>
    </div>
  )
}
