import type { Metadata } from 'next'
import { Cormorant_Garamond, EB_Garamond } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-eb',
})

export const metadata: Metadata = {
  title: 'Tsebo — Southern African Indigenous Literature',
  description:
    'The complete digital library of books published in Sesotho, Setswana, Sepedi, isiZulu, Siswati, isiNdebele, isiXhosa, and Tshivenda.',
  keywords: ['Sesotho', 'Setswana', 'Sepedi', 'Zulu', 'Xhosa', 'Venda', 'African literature', 'ebooks'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${ebGaramond.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#2A221A',
              color: '#E8B86D',
              border: '1px solid #E8B86D44',
              borderRadius: '3px',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '14px',
              letterSpacing: '0.5px',
            },
          }}
        />
      </body>
    </html>
  )
}
