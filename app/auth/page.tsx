'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
        router.push('/')
        router.refresh()
      } else {
        if (!fullName) return toast.error('Please enter your name')
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        toast.success('Account created! Check your email to confirm.')
        setMode('signin')
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0A07', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '28px', fontWeight: 700, color: '#E8B86D' }}>
          TSEBO
        </div>
        <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#5A4A38', textTransform: 'uppercase', marginTop: '4px' }}>
          Southern African Languages Library
        </div>
      </Link>

      {/* Card */}
      <div style={{
        background: '#16120D', border: '1px solid #2A221A', borderRadius: '8px',
        padding: '36px', width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }} className="animate-fade-up">
        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2A221A', marginBottom: '28px' }}>
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '10px', background: 'none', border: 'none',
                color: mode === m ? '#E8B86D' : '#5A4A38',
                borderBottom: mode === m ? '2px solid #E8B86D' : '2px solid transparent',
                fontFamily: 'var(--font-cormorant)', fontSize: '15px', letterSpacing: '1px',
                textTransform: 'uppercase', marginBottom: '-1px',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
          )}
          <Field label="Email Address" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: '8px',
              background: loading ? '#5A4A38' : '#E8B86D',
              color: '#16120D', border: 'none', borderRadius: '3px',
              padding: '13px', fontSize: '13px', fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase',
              fontFamily: 'var(--font-cormorant)',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>

      <Link href="/" style={{ marginTop: '20px', color: '#5A4A38', fontSize: '13px' }}>
        ← Back to store
      </Link>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#8A7560', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-cormorant)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => e.key === 'Enter' && onChange(value)}
        style={{ width: '100%', padding: '10px 12px', fontSize: '14px' }}
      />
    </div>
  )
}
