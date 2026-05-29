'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ purchases: 0, spent: 0 })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      setFullName(prof?.full_name ?? '')
      setCountry(prof?.country ?? '')

      const { data: purchases } = await supabase
        .from('purchases')
        .select('amount_paid')
        .eq('user_id', user.id)
        .eq('status', 'completed')

      setStats({
        purchases: purchases?.length ?? 0,
        spent: (purchases ?? []).reduce((sum: number, p: any) => sum + p.amount_paid, 0),
      })
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ full_name: fullName, country }).eq('id', user.id)
    if (error) toast.error(error.message)
    else toast.success('Profile updated')
    setSaving(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0A07' }}>
      <header style={{ background: '#16120D', borderBottom: '1px solid #2A221A', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '18px', fontWeight: 700, color: '#E8B86D' }}>
        TSEBO
        </Link>
        <span style={{ color: '#3A2E22' }}>|</span>
        <span style={{ color: '#8A7560', fontFamily: 'var(--font-cormorant)' }}>Account</span>
      </header>

      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '28px', color: '#EDE0C8', marginBottom: '8px' }}>
          Your Account
        </h1>
        <p style={{ color: '#8A7560', fontSize: '14px', marginBottom: '32px' }}>{profile?.email}</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {[
            ['Books Purchased', stats.purchases],
            ['Total Spent', `R${(stats.spent / 100).toFixed(2)}`],
          ].map(([label, val]) => (
            <div key={String(label)} style={{ background: '#16120D', border: '1px solid #2A221A', borderRadius: '6px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '28px', color: '#E8B86D', fontWeight: 700 }}>{val}</div>
              <div style={{ fontSize: '11px', color: '#8A7560', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Profile form */}
        <div style={{ background: '#16120D', border: '1px solid #2A221A', borderRadius: '6px', padding: '28px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '18px', color: '#EDE0C8', marginBottom: '20px' }}>Edit Profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Full Name" value={fullName} onChange={setFullName} />
            <Field label="Country" value={country} onChange={setCountry} placeholder="e.g. South Africa" />
            <button onClick={save} disabled={saving} style={{
              background: '#E8B86D', color: '#16120D', border: 'none', borderRadius: '3px',
              padding: '11px', fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)',
            }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <button onClick={signOut} style={{
          background: 'transparent', color: '#C0392B', border: '1px solid #C0392B44',
          borderRadius: '3px', padding: '10px 20px', fontSize: '12px',
          letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)',
        }}>
          Sign Out
        </button>
      </main>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: '#8A7560', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-cormorant)' }}>
        {label}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '10px 12px', fontSize: '14px' }} />
    </div>
  )
}
