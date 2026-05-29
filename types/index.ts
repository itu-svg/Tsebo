export type Language =
  | 'sesotho'
  | 'setswana'
  | 'sepedi'
  | 'zulu'
  | 'siswati'
  | 'ndebele'
  | 'xhosa'
  | 'venda'

export type Category =
  | 'Fiction'
  | 'Poetry'
  | 'History'
  | 'Folklore'
  | 'Children'
  | 'Drama'
  | 'Education'
  | 'Non-Fiction'

export interface Book {
  id: string
  title: string
  author: string
  language: Language
  category: Category
  year: number
  price: number          // in cents (e.g. 8900 = R89.00)
  cover_color: string
  description: string
  pages: number
  rating: number
  isbn?: string
  publisher?: string
  cover_image_url?: string
  file_url?: string      // signed URL for purchased ebook
  is_published: boolean
  created_at: string
}

export interface Profile {
  id: string             // matches auth.users.id
  email: string
  full_name?: string
  country?: string
  created_at: string
}

export interface Purchase {
  id: string
  user_id: string
  book_id: string
  amount_paid: number
  currency: string
  paystack_reference: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  book?: Book
}

export interface LibraryItem {
  id: string
  user_id: string
  book_id: string
  purchased_at: string
  book: Book
}
