'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Book, Language, Category } from '@/types'
import { LANGUAGES, CATEGORIES, formatPrice } from '@/lib/constants'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  title: '', author: '', language: 'sesotho' as Language,
  category: 'Fiction' as Category, year: new Date().getFullYear(),
  price: 0, cover_color: '#8B1A1A', description: '',
  pages: 0, isbn: '', publisher: '',
}

export default function AdminPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      if (!data?.is_admin) { toast.error('Not authorised'); router.push('/'); return }
      loadBooks()
    }
    check()
  }, [])

  const loadBooks = async () => {
    setLoading(true)
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false })
    setBooks(data ?? [])
    setLoading(false)
  }

  const save = async () => {
    if (!form.title || !form.author) return toast.error('Title and author are required')
    setSaving(true)
    const payload = { ...form, price: Math.round(form.price * 100) } // convert to cents
    try {
      if (editId) {
        const { error } = await supabase.from('books').update(payload).eq('id', editId)
        if (error) throw error
        toast.success('Book updated')
      } else {
        const { error } = await supabase.from('books').insert(payload)
        if (error) throw error
        toast.success('Book added')
      }
      setShowForm(false)
      setForm(EMPTY_FORM)
      setEditId(null)
      loadBooks()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (book: Book) => {
    setForm({ ...book, price: book.price / 100 } as any)
    setEditId(book.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const togglePublish = async (book: Book) => {
    await supabase.from('books').update({ is_published: !book.is_published }).eq('id', book.id)
    loadBooks()
  }

  const deleteBook = async (id: string) => {
    if (!confirm('Delete this book? This cannot be undone.')) return
    await supabase.from('books').delete().eq('id', id)
    toast.success('Deleted')
    loadBooks()
  }

  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div style={{ minHeight: '100vh', background: '#0D0A07', padding: '0 0 60px' }}>
      {/* Header */}
      <header style={{ background: '#16120D', borderBottom: '1px solid #2A221A', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '18px', fontWeight: 700, color: '#E8B86D' }}>
          TSEBO
          <span style={{ fontSize: '13px', color: '#5A4A38', marginLeft: '12px' }}>Admin</span>
        </Link>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }} style={btnStyle('#E8B86D')}>
          + Add Book
        </button>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Form */}
        {showForm && (
          <div style={{ background: '#16120D', border: '1px solid #2A221A', borderRadius: '6px', padding: '28px', marginBottom: '32px' }} className="animate-fade-up">
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', color: '#EDE0C8', marginBottom: '24px' }}>
              {editId ? 'Edit Book' : 'Add New Book'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              <FormField label="Title" value={form.title} onChange={v => f('title', v)} />
              <FormField label="Author" value={form.author} onChange={v => f('author', v)} />
              <div>
                <Label>Language</Label>
                <select value={form.language} onChange={e => f('language', e.target.value)} style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}>
                  {LANGUAGES.filter(l => l.code !== 'all').map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Category</Label>
                <select value={form.category} onChange={e => f('category', e.target.value)} style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <FormField label="Year Published" value={String(form.year)} onChange={v => f('year', parseInt(v))} type="number" />
              <FormField label="Price (R)" value={String(form.price)} onChange={v => f('price', parseFloat(v))} type="number" />
              <FormField label="Pages" value={String(form.pages)} onChange={v => f('pages', parseInt(v))} type="number" />
              <FormField label="ISBN" value={form.isbn ?? ''} onChange={v => f('isbn', v)} />
              <FormField label="Publisher" value={form.publisher ?? ''} onChange={v => f('publisher', v)} />
              <div>
                <Label>Cover Color</Label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" value={form.cover_color} onChange={e => f('cover_color', e.target.value)} style={{ width: '48px', height: '38px', padding: '2px', border: '1px solid #2A221A', borderRadius: '3px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '12px', color: '#8A7560' }}>{form.cover_color}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Label>Description</Label>
              <textarea
                value={form.description ?? ''}
                onChange={e => f('description', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', fontSize: '13px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={save} disabled={saving} style={btnStyle('#E8B86D')}>
                {saving ? 'Saving…' : editId ? 'Update Book' : 'Add Book'}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null) }} style={btnStyle('#2A221A', '#8A7560')}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Books table */}
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', color: '#EDE0C8', marginBottom: '16px' }}>
          All Books ({books.length})
        </h2>
        {loading ? (
          <div style={{ color: '#8A7560' }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2A221A', color: '#8A7560', textAlign: 'left', fontFamily: 'var(--font-cormorant)', letterSpacing: '1px', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Title</th>
                  <th style={{ padding: '10px 12px' }}>Author</th>
                  <th style={{ padding: '10px 12px' }}>Language</th>
                  <th style={{ padding: '10px 12px' }}>Price</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.id} style={{ borderBottom: '1px solid #1A1510', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1A1510')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px', color: '#EDE0C8', fontFamily: 'var(--font-cormorant)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: book.cover_color, flexShrink: 0 }} />
                        {book.title}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#B5A48A' }}>{book.author}</td>
                    <td style={{ padding: '12px', color: '#8A7560', textTransform: 'capitalize' }}>{book.language}</td>
                    <td style={{ padding: '12px', color: '#E8B86D' }}>{formatPrice(book.price)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                        background: book.is_published ? '#27AE6022' : '#C0392B22',
                        color: book.is_published ? '#27AE60' : '#C0392B',
                        border: `1px solid ${book.is_published ? '#27AE6044' : '#C0392B44'}`,
                      }}>
                        {book.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <SmallBtn onClick={() => startEdit(book)}>Edit</SmallBtn>
                        <SmallBtn onClick={() => togglePublish(book)}>{book.is_published ? 'Hide' : 'Publish'}</SmallBtn>
                        <SmallBtn onClick={() => deleteBook(book.id)} danger>Delete</SmallBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

const btnStyle = (bg: string, color = '#16120D'): React.CSSProperties => ({
  background: bg, color, border: 'none', borderRadius: '3px',
  padding: '10px 20px', fontSize: '12px', fontWeight: 700,
  letterSpacing: '1px', textTransform: 'uppercase',
  fontFamily: 'var(--font-cormorant)', cursor: 'pointer',
})

function SmallBtn({ children, onClick, danger }: { children: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', color: danger ? '#C0392B' : '#8A7560',
      border: `1px solid ${danger ? '#C0392B44' : '#2A221A'}`,
      borderRadius: '2px', padding: '3px 8px', fontSize: '11px',
      cursor: 'pointer', fontFamily: 'var(--font-cormorant)',
    }}>
      {children}
    </button>
  )
}

function Label({ children }: { children: string }) {
  return <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: '#8A7560', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-cormorant)' }}>{children}</label>
}

function FormField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
    </div>
  )
}
