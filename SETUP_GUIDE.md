# Tsebo — Complete Setup & Deployment Guide

This guide walks you through everything from zero to a live website.
**No developer needed** — follow each step carefully.

---

## What You're Building

- A bookstore website where readers can browse, buy, and download books
- Books are stored in a database (Supabase)
- Payments are handled by Paystack (supports ZAR, BWP, SZL)
- The site is hosted on Vercel (free tier available)

---

## PART 1 — Accounts to Create (all free)

### 1. GitHub (stores your code)
1. Go to https://github.com and click **Sign up**
2. Choose the free plan
3. Verify your email

### 2. Supabase (your database)
1. Go to https://supabase.com and click **Start your project**
2. Sign up with your GitHub account
3. Click **New project**
4. Name it: `tsebo`
5. Choose a strong database password — **save this password somewhere safe**
6. Choose a region closest to you (e.g. `eu-west-2` for Southern Africa)
7. Wait ~2 minutes for the project to be created

### 3. Vercel (hosts your website)
1. Go to https://vercel.com and click **Sign up**
2. Sign up with your GitHub account
3. Choose the free Hobby plan

### 4. Paystack (handles payments)
1. Go to https://paystack.com and click **Create a free account**
2. Fill in your business details
3. Complete the KYC (identity verification) — required to receive payments
4. Once approved, go to **Settings → API Keys** and note your keys

---

## PART 2 — Setting Up Supabase

### Run the database schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/migrations/001_schema.sql` from this project
4. Copy the entire contents and paste it into the SQL editor
5. Click **Run** (the green button)
6. You should see "Success. No rows returned" — this means it worked

### Get your Supabase keys

1. In Supabase, click **Settings** (gear icon) → **API**
2. Copy these three values — you'll need them soon:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon public** key (long string starting with `eyJ`)
   - **service_role** key (another long string — keep this secret!)

### Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Under **Email**, turn on **Confirm email** (users verify their email before logging in)

---

## PART 3 — Uploading the Code to GitHub

### Install required tools (one time only)

You need Node.js and Git on your computer.

**Install Node.js:**
1. Go to https://nodejs.org
2. Download the **LTS** version
3. Run the installer

**Install Git:**
1. Go to https://git-scm.com/downloads
2. Download and install for your operating system

### Upload to GitHub

Open **Terminal** (Mac/Linux) or **Command Prompt** (Windows) and run:

```bash
# Navigate to where you saved the tsebo folder
cd path/to/tsebo

# Install dependencies
npm install

# Set up git
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub
# Go to github.com → New repository → name it "tsebo" → Create
# Then run (replace YOUR_USERNAME):
git remote add origin https://github.com/YOUR_USERNAME/tsebo.git
git branch -M main
git push -u origin main
```

---

## PART 4 — Deploying to Vercel

1. Go to https://vercel.com and log in
2. Click **Add New → Project**
3. Find your `tsebo` repository and click **Import**
4. Under **Environment Variables**, add all of these:

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Your Paystack public key (pk_live_...) |
| `PAYSTACK_SECRET_KEY` | Your Paystack secret key (sk_live_...) |
| `NEXT_PUBLIC_APP_URL` | Leave blank for now (update after deploy) |

5. Click **Deploy** and wait ~2 minutes
6. You'll get a URL like `tsebo-abc123.vercel.app`
7. Go back to Vercel → your project → **Settings → Environment Variables**
8. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL

---

## PART 5 — Paystack Webhook

This tells Paystack to notify your app when a payment is made.

1. Go to your Paystack dashboard
2. Click **Settings → API Keys & Webhooks**
3. Under **Webhook URL**, enter:
   `https://your-vercel-url.vercel.app/api/webhooks/paystack`
4. Click **Update**

---

## PART 6 — Making Yourself an Admin

1. Go to your live site and **create an account** with your email
2. Go to Supabase → **Table Editor** → **profiles**
3. Find your row (your email)
4. Click the row and set `is_admin` to `true`
5. Save
6. You can now visit `https://your-site.com/admin` to manage books

---

## PART 7 — Uploading eBook Files (optional)

When you have PDF files of books to sell:

1. Go to Supabase → **Storage** → **ebooks** bucket
2. Click **Upload file**
3. Name the file clearly, e.g. `chaka-thomas-mofolo.pdf`
4. Go to **Table Editor → books**
5. Find the book row
6. Set `file_url` to the filename you just uploaded (e.g. `chaka-thomas-mofolo.pdf`)
7. After purchase, the reader will see a Download button

---

## PART 8 — Adding New Books

### Via the Admin Panel (easiest)
1. Go to `https://your-site.com/admin`
2. Click **Add Book**
3. Fill in the form and click **Add Book**

### Via Supabase directly
1. Go to Supabase → **Table Editor → books**
2. Click **Insert row**
3. Fill in the columns
4. Note: `price` is in **cents** (R89.00 = enter `8900`)

---

## Managing the Site Day-to-Day

| Task | How |
|---|---|
| Add a book | Admin panel → Add Book |
| Hide a book | Admin panel → Hide |
| Upload an ebook file | Supabase Storage → ebooks |
| See who purchased what | Supabase → purchases table |
| Change a book price | Admin panel → Edit |
| See your revenue | Paystack dashboard |
| Update the site design | Edit files in VS Code, `git push` auto-deploys |

---

## Test Payments (before going live)

Use Paystack's test mode:
1. In Paystack dashboard, toggle to **Test Mode**
2. Get your test keys (`pk_test_...` and `sk_test_...`)
3. Update them in Vercel environment variables temporarily
4. Use test card: `4084084084084081`, expiry: any future date, CVV: `408`
5. When ready to go live, switch back to live keys

---

## Getting Help

- **Supabase docs:** https://supabase.com/docs
- **Vercel docs:** https://vercel.com/docs
- **Paystack docs:** https://paystack.com/docs
- **Next.js docs:** https://nextjs.org/docs

---

*Tsebo — Preserving the literary heritage of Southern Africa's indigenous languages*
