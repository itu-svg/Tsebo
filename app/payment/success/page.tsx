import { Suspense } from 'react'
import PaymentSuccessContent from './PaymentSuccessContent'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0D0A07', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 700, color: '#E8B86D', marginBottom: '24px' }}>TSEBO</div>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#8A7560', fontFamily: 'var(--font-cormorant)', fontSize: '18px' }}>Loading…</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
