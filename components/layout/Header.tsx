'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { LANGUAGES } from '@/lib/constants'
import toast from 'react-hot-toast'

interface Props {
  searchQuery: string
  setSearchQuery: (v: string) => void
  selectedLang: string
  setSelectedLang: (v: string) => void
  libraryCount: number
}

export default function Header({ searchQuery, setSearchQuery, selectedLang, setSelectedLang, libraryCount }: Props) {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.refresh()
  }

  return (
    <header style={{
      background: 'linear-gradient(180deg, #0D0A07 0%, #16120D 100%)',
      borderBottom: '1px solid #2A221A',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', flexWrap: 'wrap' }}>
          {/* Logo */}
          <Link href="/" style={{ flex: '0 0 auto', textDecoration: 'none' }}>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-cormorant)', fontWeight: 700, color: '#E8B86D', letterSpacing: '1px' }}>
            TSEBO
            </div>
            <div style={{ fontSize: '8px', letterSpacing: '3px', color: '#5A4A38', textTransform: 'uppercase' }}>
              Southern African Languages Library
            </div>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#5A4A38', fontSize: '13px' }}>🔍</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title or author…"
              style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: '13px' }}
            />
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Link href="/library" style={navBtnStyle}>
              📚 Library {libraryCount > 0 && <span style={{ color: '#E8B86D' }}>({libraryCount})</span>}
            </Link>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(o => !o)} style={{ ...navBtnStyle, background: '#2A221A', border: '1px solid #3A2E22' }}>
                  {user.email?.split('@')[0]} ▾
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                    background: '#16120D', border: '1px solid #2A221A',
                    borderRadius: '4px', padding: '4px', minWidth: '160px', zIndex: 200,
                  }}>
                    <DropItem href="/library">My Library</DropItem>
                    <DropItem href="/account">Account</DropItem>
                    <hr style={{ border: 'none', borderTop: '1px solid #2A221A', margin: '4px 0' }} />
                    <button onClick={signOut} style={{ ...dropItemBase, color: '#C0392B', width: '100%', textAlign: 'left' }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" style={{ ...navBtnStyle, background: '#E8B86D', color: '#16120D', border: 'none', fontWeight: 700 }}>
                Sign in
              </Link>
            )}
          </nav>
        </div>

        {/* Language filter */}
        <div style={{ paddingBottom: '12px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '6px', minWidth: 'max-content' }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                style={{
                  background: selectedLang === lang.code ? lang.color : 'transparent',
                  color: selectedLang === lang.code ? '#fff' : '#8A7560',
                  border: `1px solid ${selectedLang === lang.code ? lang.color : '#2A221A'}`,
                  borderRadius: '2px', padding: '4px 12px',
                  fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

const navBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#8A7560',
  border: '1px solid #2A221A',
  borderRadius: '3px',
  padding: '6px 14px',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontFamily: 'var(--font-cormorant)',
  whiteSpace: 'nowrap',
  display: 'inline-block',
}

const dropItemBase: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '8px 12px',
  fontSize: '13px',
  color: '#B5A48A',
  borderRadius: '2px',
  cursor: 'pointer',
  display: 'block',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--font-cormorant)',
}

function DropItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ ...dropItemBase, textDecoration: 'none' } as React.CSSProperties}>
      {children}
    </Link>
  )
}
