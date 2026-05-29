-- ============================================================
--  TSEBO — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  country      text,
  is_admin     boolean default false,
  created_at   timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. BOOKS
create table if not exists public.books (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  author           text not null,
  language         text not null,
  category         text not null,
  year             integer,
  price            integer not null,  -- in cents (e.g. 8900 = R89.00)
  cover_color      text default '#8B1A1A',
  description      text,
  pages            integer,
  rating           numeric(3,1) default 0,
  isbn             text,
  publisher        text,
  cover_image_url  text,
  file_url         text,              -- path in supabase storage bucket
  is_published     boolean default true,
  created_at       timestamptz default now()
);
alter table public.books enable row level security;

create policy "Anyone can view published books"
  on public.books for select using (is_published = true);

create policy "Admins can do everything with books"
  on public.books for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 3. PURCHASES
create table if not exists public.purchases (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  book_id              uuid not null references public.books(id) on delete cascade,
  amount_paid          integer not null,   -- in cents
  currency             text default 'ZAR',
  paystack_reference   text unique,
  status               text default 'pending' check (status in ('pending','completed','failed')),
  created_at           timestamptz default now(),
  unique(user_id, book_id)
);
alter table public.purchases enable row level security;

create policy "Users can view their own purchases"
  on public.purchases for select using (auth.uid() = user_id);

create policy "Users can insert their own purchases"
  on public.purchases for insert with check (auth.uid() = user_id);

create policy "Admins can view all purchases"
  on public.purchases for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 4. LIBRARY VIEW
-- Columns listed explicitly to avoid duplicate "id" error
create or replace view public.library as
  select
    p.id            as purchase_id,
    p.user_id,
    p.book_id,
    p.created_at    as purchased_at,
    b.id            as id,
    b.title,
    b.author,
    b.language,
    b.category,
    b.year,
    b.price,
    b.cover_color,
    b.description,
    b.pages,
    b.rating,
    b.isbn,
    b.publisher,
    b.cover_image_url,
    b.file_url,
    b.is_published,
    b.created_at    as book_created_at
  from public.purchases p
  join public.books b on b.id = p.book_id
  where p.status = 'completed';

-- 5. STORAGE BUCKET for ebook files
insert into storage.buckets (id, name, public)
values ('ebooks', 'ebooks', false)
on conflict do nothing;

-- Only users who have purchased a book can download it
create policy "Purchased ebooks are accessible"
  on storage.objects for select
  using (
    bucket_id = 'ebooks'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.purchases pu
      join public.books b on b.id = pu.book_id
      where pu.user_id = auth.uid()
        and pu.status = 'completed'
        and b.file_url = storage.objects.name
    )
  );

-- Admins can upload ebook files
create policy "Admins can upload ebooks"
  on storage.objects for insert
  with check (
    bucket_id = 'ebooks'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 6. SEED — insert all 24 books
insert into public.books (title, author, language, category, year, price, cover_color, description, pages, rating) values
  ('Chaka',                    'Thomas Mofolo',             'sesotho',  'Fiction',   1925, 8900, '#8B1A1A', 'The epic tale of the Zulu king Shaka, one of Africa''s greatest literary works.', 224, 4.8),
  ('Moeti oa Bochabela',       'Thomas Mofolo',             'sesotho',  'Fiction',   1907, 7500, '#6B2737', 'The Traveller of the East — the first novel written in an African language.', 148, 4.6),
  ('Pitseng',                  'Thomas Mofolo',             'sesotho',  'Fiction',   1910, 7900, '#922B21', 'A love story set in the mountains of Lesotho, rich with Basotho culture.', 180, 4.5),
  ('Marara',                   'B.M. Khaketla',             'sesotho',  'Drama',     1954, 6500, '#A04000', 'A dramatic exploration of family and tradition in Sesotho society.', 120, 4.3),
  ('Dingaka tsa Setswana',     'D.P. Moloto',               'setswana', 'Folklore',  1962, 7000, '#512E5F', 'Traditional Setswana healing wisdom and the role of medicine in culture.', 155, 4.4),
  ('Mhudi',                    'Sol Plaatje',               'setswana', 'Fiction',   1930, 8500, '#6C3483', 'South Africa''s first novel rooted in Setswana oral tradition.', 235, 4.9),
  ('Mmegi wa Dikgang',         'Sol Plaatje',               'setswana', 'History',   1916, 9500, '#4A235A', 'Pioneering Setswana journalism that documented the birth of a nation.', 200, 4.7),
  ('Go lela Naga',             'O.K. Matsepe',              'sepedi',   'Fiction',   1963, 7200, '#1A5276', 'A celebrated Sepedi novel exploring identity, land, and belonging.', 168, 4.5),
  ('Kgorong ya Thabo',         'O.K. Matsepe',              'sepedi',   'Fiction',   1967, 6900, '#1B4F72', 'At the Threshold of Joy — a poetic journey through the Northern Sotho landscape.', 175, 4.4),
  ('Izihlabelelo zamaKholwa',  'John Langalibalele Dube',   'zulu',     'Poetry',    1911, 8000, '#1E8449', 'Hymns and songs of the believers — a cornerstone of isiZulu literary tradition.', 142, 4.6),
  ('Ukuziphatha Kahle',        'J.L. Dube',                 'zulu',     'Education', 1928, 7400, '#196F3D', 'On Good Conduct — a foundational guide to Zulu ethics and Ubuntu philosophy.', 130, 4.5),
  ('Noma Nini',                'R.R.R. Dhlomo',             'zulu',     'Fiction',   1946, 7800, '#239B56', 'A sweeping Zulu epic spanning generations of love and war.', 210, 4.7),
  ('Insila kaShaka',           'John Langalibalele Dube',   'zulu',     'Fiction',   1933, 8200, '#0E6655', 'The Servant of Shaka — a vivid historical novel of the Zulu kingdom.', 192, 4.8),
  ('Ndzawo ya Moya',           'H.W. Kumalo',               'siswati',  'Poetry',    1958, 6800, '#B7470A', 'Songs of the spirit — a landmark collection of Siswati poetry.', 110, 4.3),
  ('Bukhosi Bembubuko',        'A.K. Hlophe',               'siswati',  'History',   1972, 7600, '#D35400', 'The Kingdom of Origins — tracing Swati history through oral and written tradition.', 188, 4.5),
  ('Izindaba zabantu',         'C.L.S. Nyembezi',           'ndebele',  'Folklore',  1950, 7100, '#0E7673', 'Stories of the people — Ndebele oral traditions preserved in written form.', 165, 4.4),
  ('Umdlalo weZintaba',        'N.S. Sigogo',               'ndebele',  'Drama',     1959, 6700, '#117A65', 'The Mountain Play — a dramatic retelling of Ndebele struggle and resilience.', 128, 4.2),
  ('Umyezo',                   'S.E.K. Mqhayi',             'xhosa',    'Poetry',    1914, 8300, '#B94A00', 'The Orchard — by the Poet of the Xhosa Nation, a timeless collection of verse.', 145, 4.9),
  ('Ityala lamawele',          'S.E.K. Mqhayi',             'xhosa',    'Fiction',   1914, 8700, '#C0392B', 'The Case of the Twins — the foundational Xhosa novel, a masterpiece of African literature.', 198, 4.8),
  ('Ingqumbo yeminyanya',      'A.C. Jordan',               'xhosa',    'Fiction',   1940, 9200, '#D35400', 'The Wrath of the Ancestors — the greatest Xhosa novel ever written.', 312, 5.0),
  ('UDingiswayo kaJobe',       'S.E.K. Mqhayi',             'xhosa',    'History',   1939, 7700, '#E74C3C', 'A powerful biographical account of the Mthethwa king Dingiswayo.', 172, 4.6),
  ('Tshiimbi tsha Maramba',    'E.N. Mulaudzi',             'venda',    'Folklore',  1958, 6900, '#1C2833', 'The Drums of Maramba — Venda oral tradition set to the written word.', 138, 4.4),
  ('Vhudifhinduleli',          'T.N. Maumela',              'venda',    'Fiction',   1970, 7300, '#2E4057', 'Responsibility — a Tshivenda story of moral courage in a changing world.', 160, 4.3),
  ('Dzimauli',                 'M.E. Mugivhi',              'venda',    'Poetry',    1961, 6500, '#273746', 'Ancient Venda praise poetry celebrating the spirit world and ancestors.', 105, 4.5)
on conflict do nothing;
