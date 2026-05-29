interface Props { bookCount: number }

export default function HeroBanner({ bookCount }: Props) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1A0A00 0%, #2D1505 50%, #1A1005 100%)',
      borderRadius: '8px', padding: '40px 32px', marginBottom: '32px',
      position: 'relative', overflow: 'hidden', border: '1px solid #3A2510',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, #C0392B11 0%, transparent 50%), radial-gradient(circle at 80% 50%, #8E44AD11 0%, transparent 50%)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: '#8A7560', textTransform: 'uppercase', marginBottom: '12px' }}>
          Preserving the Voice of a Region
        </div>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(26px, 5vw, 46px)',
          marginBottom: '16px', lineHeight: 1.2, color: '#EDE0C8', fontWeight: 700,
        }}>
          The Complete Library of<br />
          <span style={{ color: '#E8B86D' }}>Southern African Indigenous Literature</span>
        </h1>
        <p style={{ color: '#8A7560', fontSize: '15px', maxWidth: '600px', lineHeight: 1.7, marginBottom: '24px' }}>
          Every published work in Sesotho, Setswana, Sepedi, isiZulu, Siswati, isiNdebele, isiXhosa, and Tshivenda —
          serving readers across South Africa, Lesotho, Eswatini, Botswana, and the wider region.
        </p>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            ['📚', `${bookCount}+ Books`],
            ['🌍', '8 Languages'],
            ['✍️', '4 Countries'],
          ].map(([icon, label]) => (
            <div key={String(label)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <span style={{ fontSize: '13px', color: '#B5A48A', letterSpacing: '1px' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
