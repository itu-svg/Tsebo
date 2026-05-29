import { Language } from '@/types'

export const LANGUAGES: { code: Language | 'all'; label: string; color: string; countries: string }[] = [
  { code: 'all',      label: 'All Languages', color: '#E8B86D', countries: '' },
  { code: 'sesotho',  label: 'Sesotho',       color: '#C0392B', countries: 'South Africa · Lesotho' },
  { code: 'setswana', label: 'Setswana',      color: '#8E44AD', countries: 'South Africa · Botswana' },
  { code: 'sepedi',   label: 'Sepedi',        color: '#2980B9', countries: 'South Africa' },
  { code: 'zulu',     label: 'isiZulu',       color: '#27AE60', countries: 'South Africa' },
  { code: 'siswati',  label: 'Siswati',       color: '#E67E22', countries: 'South Africa · Eswatini' },
  { code: 'ndebele',  label: 'isiNdebele',    color: '#16A085', countries: 'South Africa · Zimbabwe' },
  { code: 'xhosa',    label: 'isiXhosa',      color: '#D35400', countries: 'South Africa' },
  { code: 'venda',    label: 'Tshivenda',     color: '#2C3E50', countries: 'South Africa · Zimbabwe' },
]

export const CATEGORIES = [
  'All', 'Fiction', 'Poetry', 'History', 'Folklore',
  'Children', 'Drama', 'Education', 'Non-Fiction',
]

export const getLang = (code: string) =>
  LANGUAGES.find(l => l.code === code) ?? LANGUAGES[0]

export const formatPrice = (cents: number) =>
  `R${(cents / 100).toFixed(2)}`
