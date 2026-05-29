'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Book } from '@/types'
import { getLang, formatPrice } from '@/lib/constants'
import { StarRating } from './BookCard'
import { createBrowserClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Props {
  book: Book
  onClose: () => void
  inLibrary: boolean
  userId: string | null
}

export default function BookModal({ book, onClose, inLibrary, userId }: Props) {
  const supabase = createBrowserClient()
  const router = useRouter()
  const lang = getLang(book.language)
  const [buying, setBuying] = useState(false)

  const handleBuy = async () => {
    if (!userId) {
      toast.error('Please sign in to purchase books')
      router.push('/auth')
      onClose()
      return
    }
    if (inLibrary) {
      router.push('/library')
      onClose()
      return
    }

    setBuying(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return toast.error('Could not get your email')

      // Ask our server to create a PayFast payment
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: book.id,
          user_id: userId,
          email: user.email,
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error ?? 'Could not create payment')

      // Redirect to PayFast payment page
      window.location.href = result.redirect_url
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong')
    } finally {
      setBuying(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
      className="animate-fade-in"
    >
      <div
        style={{
          background: '#16120D', border: '1px solid #2A221A', borderRadius: '8px',
          maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
      >
        {/* Cover */}
        <div style={{
          height: '180px',
          background: `linear-gradient(135deg, ${book.cover_color}ff, ${book.cover_color}88)`,
          position: 'relative', borderRadius: '8px 8px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {book.cover_image_url ? (
            <img src={book.cover_image_url} alt={book.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
          ) : (
            <>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)', borderRadius: '8px 8px 0 0' }} />
              <div style={{ fontSize: '48px', position: 'relative', zIndex: 1 }}>📖</div>
            </>
          )}
          <button onClick={onClose} style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(0,0,0,0.5)', border: 'none', color: '#E8D5B0',
            width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px',
            zIndex: 2,
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: '28px' }}>
          <div style={{ marginBottom: '4px', fontSize: '10px', letterSpacing: '3px', color: lang.color, textTransform: 'uppercase' }}>
            {lang.label}
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '26px', color: '#EDE0C8', marginBottom: '6px' }}>
            {book.title}
          </h2>
          <p style={{ color: '#8A7560', fontSize: '13px', fontStyle: 'italic', marginBottom: '12px' }}>
            by {book.author} · {book.year} · {book.pages} pages
          </p>
          <StarRating rating={book.rating} />
          <p style={{ color: '#B5A48A', fontSize: '15px', lineHeight: 1.7, margin: '16px 0 20px', fontFamily: 'var(--font-cormorant)' }}>
            {book.description}
          </p>
          {book.isbn && (
            <p style={{ fontSize: '11px', color: '#5A4A38', marginBottom: '16px' }}>ISBN: {book.isbn}</p>
          )}

          {/* Buy / Read */}
          <div style={{ borderTop: '1px solid #2A221A', paddingTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            {!inLibrary && (
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#E8B86D', fontFamily: 'var(--font-cormorant)' }}>
                {formatPrice(book.price)}
              </span>
            )}
            <button
              onClick={handleBuy}
              disabled={buying}
              style={{
                flex: 1,
                background: inLibrary ? '#27AE60' : buying ? '#5A4A38' : '#E8B86D',
                color: '#16120D',
                border: 'none', borderRadius: '3px', padding: '12px 20px',
                fontSize: '13px', fontWeight: 700, letterSpacing: '1px',
                textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)',
                transition: 'opacity 0.2s',
              }}
            >
              {inLibrary ? '📚 Read in Library' : buying ? 'Redirecting to PayFast…' : '🛒 Buy Now'}
            </button>
          </div>
          {!inLibrary && (
            <p style={{ fontSize: '11px', color: '#5A4A38', marginTop: '10px', textAlign: 'center' }}>
              Secure payment via PayFast · South African payments
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
