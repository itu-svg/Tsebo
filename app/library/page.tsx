'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Book } from '@/types'
import { getLang, formatPrice } from '@/lib/constants'
import { StarRating } from '@/components/books/BookCard'
import toast from 'react-hot-toast'

export default function LibraryPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('purchases')
        .select('book_id, books(*)')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (error) toast.error('Failed to load library')
      else setBooks((data ?? []).map((p: any) => p.books).filter(Boolean))
      setLoading(false)
    }
    load()
  }, [])

  const handleDownload = async (book: Book) => {
    if (!book.file_url) return toast.error('No file available for this book yet.')
    const { data, error } = await supabase.storage
      .from('ebooks')
      .createSignedUrl(book.file_url, 3600)
    if (error || !data) return toast.error('Could not get download link')
    window.open(data.signedUrl, '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0A07' }}>
      {/* Simple header */}
      <header style={{ background: '#16120D', borderBottom: '1px solid #2A221A', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '18px', fontWeight: 700, color: '#E8B86D' }}>
        TSEBO
        </Link>
        <span style={{ color: '#3A2E22' }}>|</span>
        <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '16px', color: '#8A7560' }}>My Library</span>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '28px', color: '#EDE0C8', marginBottom: '8px' }}>
          Your Library
        </h1>
        <p style={{ color: '#8A7560', fontSize: '14px', marginBottom: '32px' }}>
          {books.length} purchased book{books.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div style={{ color: '#8A7560', fontFamily: 'var(--font-cormorant)', fontSize: '18px' }}>Loading your books…</div>
        ) : books.length === 0 ? (
          <EmptyLibrary />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {books.map((book, i) => (
              <LibraryBookCard key={book.id} book={book} onDownload={handleDownload} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function LibraryBookCard({ book, onDownload, index }: { book: Book; onDownload: (b: Book) => void; index: number }) {
  const lang = getLang(book.language)
  return (
    <div className="animate-fade-up" style={{
      animationDelay: `${index * 40}ms`,
      background: '#16120D', border: '1px solid #2A221A', borderRadius: '6px',
      overflow: 'hidden', display: 'flex',
    }}>
      {/* Colour spine */}
      <div style={{ width: '6px', background: book.cover_color, flexShrink: 0 }} />

      {/* Cover thumbnail */}
      <div style={{
        width: '80px', flexShrink: 0,
        background: `linear-gradient(135deg, ${book.cover_color}cc, ${book.cover_color}66)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
      }}>
        {book.cover_image_url
          ? <img src={book.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '📖'
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '15px', fontWeight: 700, color: '#EDE0C8', lineHeight: 1.3 }}>
          {book.title}
        </div>
        <div style={{ fontSize: '12px', color: '#8A7560', fontStyle: 'italic' }}>
          {book.author} · {book.year}
        </div>
        <div style={{ fontSize: '10px', color: lang.color, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>
          {lang.label}
        </div>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => onDownload(book)}
            style={{
              background: book.file_url ? '#2A221A' : '#1A1510',
              color: book.file_url ? '#E8B86D' : '#5A4A38',
              border: `1px solid ${book.file_url ? '#E8B86D44' : '#2A221A'}`,
              borderRadius: '2px', padding: '5px 12px',
              fontSize: '11px', letterSpacing: '1px',
              fontFamily: 'var(--font-cormorant)',
              textTransform: 'uppercase',
            }}
          >
            {book.file_url ? '⬇ Download' : 'Coming soon'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyLibrary() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#5A4A38' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.4 }}>📚</div>
      <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', marginBottom: '12px', color: '#8A7560' }}>
        Your library is empty
      </p>
      <p style={{ fontSize: '14px', marginBottom: '24px' }}>
        Purchase books from the store to begin your collection.
      </p>
      <Link href="/" style={{
        background: '#E8B86D', color: '#16120D', borderRadius: '3px',
        padding: '10px 24px', fontSize: '13px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '1px',
        fontFamily: 'var(--font-cormorant)',
        display: 'inline-block',
      }}>
        Browse Store
      </Link>
    </div>
  )
}
