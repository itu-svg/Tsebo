'use client'
import { useState } from 'react'
import { Book } from '@/types'
import { getLang, formatPrice } from '@/lib/constants'

interface Props {
  book: Book
  onSelect: (b: Book) => void
  inLibrary: boolean
}

export default function BookCard({ book, onSelect, inLibrary }: Props) {
  const lang = getLang(book.language)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onSelect(book)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.3)',
        borderRadius: '4px', overflow: 'hidden',
        background: '#1A1510', border: '1px solid #2A221A',
        display: 'flex', flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Cover */}
      <div style={{
        height: '200px',
        background: `linear-gradient(135deg, ${book.cover_color}ee, ${book.cover_color}88)`,
        position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '12px',
      }}>
        {book.cover_image_url ? (
          <img src={book.cover_image_url} alt={book.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 8px)',
          }} />
        )}
        {/* Spine */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: 'rgba(0,0,0,0.3)' }} />
        {/* Language badge */}
        <div style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(0,0,0,0.55)', borderRadius: '2px',
          padding: '2px 8px', fontSize: '10px',
          fontFamily: 'var(--font-cormorant)', color: '#E8D5B0',
          letterSpacing: '2px', textTransform: 'uppercase',
        }}>
          {lang.label}
        </div>
        {/* Library badge */}
        {inLibrary && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: '#E8B86D', borderRadius: '50%',
            width: '22px', height: '22px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '11px',
          }} title="In your library">
            ✓
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ fontSize: '14px', fontFamily: 'var(--font-cormorant)', fontWeight: 700, color: '#EDE0C8', lineHeight: 1.3 }}>
          {book.title}
        </div>
        <div style={{ fontSize: '11px', color: '#8A7560', fontStyle: 'italic' }}>
          {book.author} · {book.year}
        </div>
        <StarRating rating={book.rating} />
        <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '10px', padding: '2px 7px', borderRadius: '2px',
            background: `${lang.color}22`, color: lang.color,
            border: `1px solid ${lang.color}44`,
          }}>
            {book.category}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#E8B86D', fontFamily: 'var(--font-cormorant)' }}>
            {formatPrice(book.price)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  return (
    <span style={{ color: '#E8B86D', fontSize: '11px', letterSpacing: '1px' }}>
      {'★'.repeat(full)}{hasHalf ? '½' : ''}{'☆'.repeat(5 - full - (hasHalf ? 1 : 0))}
      <span style={{ color: '#8A7560', marginLeft: '4px', fontSize: '10px' }}>{rating}</span>
    </span>
  )
}
