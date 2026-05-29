'use client'
import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { LANGUAGES, CATEGORIES, getLang, formatPrice } from '@/lib/constants'
import { Book } from '@/types'
import Header from '@/components/layout/Header'
import BookCard from '@/components/books/BookCard'
import BookModal from '@/components/books/BookModal'
import HeroBanner from '@/components/layout/HeroBanner'
import toast from 'react-hot-toast'

export default function StorePage() {
  const supabase = createBrowserClient()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLang, setSelectedLang] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [library, setLibrary] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)

  // Load session and library
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      if (user) {
        const { data } = await supabase
          .from('purchases')
          .select('book_id')
          .eq('user_id', user.id)
          .eq('status', 'completed')
        if (data) setLibrary(new Set(data.map((p: any) => p.book_id)))
      }
    }
    init()
  }, [])

  // Load books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      let query = supabase.from('books').select('*').eq('is_published', true).order('year', { ascending: false })
      if (selectedLang !== 'all') query = query.eq('language', selectedLang)
      if (selectedCategory !== 'All') query = query.eq('category', selectedCategory)
      if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
      const { data, error } = await query
      if (error) toast.error('Failed to load books')
      else setBooks(data ?? [])
      setLoading(false)
    }
    const timer = setTimeout(fetchBooks, 200)
    return () => clearTimeout(timer)
  }, [selectedLang, selectedCategory, searchQuery])

  return (
    <>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        libraryCount={library.size}
      />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Hero — show when no filters active */}
        {selectedLang === 'all' && selectedCategory === 'All' && !searchQuery && (
          <HeroBanner bookCount={books.length} />
        )}

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#2A221A' : 'transparent',
                color: selectedCategory === cat ? '#E8B86D' : '#5A4A38',
                border: `1px solid ${selectedCategory === cat ? '#E8B86D44' : '#2A221A'}`,
                borderRadius: '2px', padding: '5px 14px',
                fontSize: '11px', letterSpacing: '1px', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-cormorant)',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ marginBottom: '20px', color: '#8A7560', fontSize: '14px', fontFamily: 'var(--font-cormorant)' }}>
          {loading ? 'Loading…' : `${books.length} title${books.length !== 1 ? 's' : ''} found`}
        </div>

        {/* Grid */}
        {loading ? (
          <BookGridSkeleton />
        ) : books.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '20px',
          }}>
            {books.map((book, i) => (
              <div key={book.id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <BookCard
                  book={book}
                  onSelect={setSelectedBook}
                  inLibrary={library.has(book.id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid #2A221A', marginTop: '60px', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '18px', color: '#E8B86D', marginBottom: '8px' }}>
          TSEBO
        </div>
        <p style={{ color: '#5A4A38', fontSize: '12px', letterSpacing: '1px' }}>
          Preserving the literary heritage of Southern Africa's indigenous languages
        </p>
        <p style={{ color: '#3A2A1A', fontSize: '11px', marginTop: '8px' }}>
          Sesotho · Setswana · Sepedi · isiZulu · Siswati · isiNdebele · isiXhosa · Tshivenda
        </p>
      </footer>

      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          inLibrary={library.has(selectedBook.id)}
          userId={userId}
        />
      )}
    </>
  )
}

function BookGridSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ borderRadius: '4px', overflow: 'hidden', background: '#1A1510', border: '1px solid #2A221A' }}>
          <div style={{ height: '200px', background: '#2A221A', animation: 'pulse 1.5s ease infinite' }} />
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '14px', background: '#2A221A', borderRadius: '2px', width: '80%' }} />
            <div style={{ height: '11px', background: '#2A221A', borderRadius: '2px', width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#5A4A38' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
      <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '20px' }}>No books found for your search.</p>
      <p style={{ fontSize: '13px', marginTop: '8px' }}>Try a different language, category, or search term.</p>
    </div>
  )
}
