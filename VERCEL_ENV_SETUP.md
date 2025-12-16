# Vercel Environment Variables Setup

## How to Add Environment Variables to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to your project on Vercel: https://vercel.com/dashboard
2. Select your `v0-quiz-system` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below:

#### Required Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ywiuptsshhuazbqsabvp.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aXVwdHNzaGh1YXpicXNhYnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODkwNDYsImV4cCI6MjA4MTQ2NTA0Nn0.pBX27KcHT9A2nixTEx9nH89EUFCt9TF3ThUYxk1IdVg` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aXVwdHNzaGh1YXpicXNhYnZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg4OTA0NiwiZXhwIjoyMDgxNDY1MDQ2fQ._qXQm7tY9PIugLrq2s8TKHg4LmSK7BJVwqg6XJS45m0` | Production, Preview, Development |

#### Optional Variable:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `SUPABASE_JWT_SECRET` | `NpxMWSCsTQRKN+mC32u5meVYoA9JM3aGokNXURuJddkOHCKsDzmJENOegjNrzKYQq9EcJ5DcjaYW4cq3PZdjeA==` | Production, Preview, Development |

5. Click **Save** for each variable
6. **Redeploy** your project for changes to take effect

---

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://ywiuptsshhuazbqsabvp.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aXVwdHNzaGh1YXpicXNhYnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODkwNDYsImV4cCI6MjA4MTQ2NTA0Nn0.pBX27KcHT9A2nixTEx9nH89EUFCt9TF3ThUYxk1IdVg

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aXVwdHNzaGh1YXpicXNhYnZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg4OTA0NiwiZXhwIjoyMDgxNDY1MDQ2fQ._qXQm7tY9PIugLrq2s8TKHg4LmSK7BJVwqg6XJS45m0

# Redeploy
vercel --prod
```

---

### Option 3: Copy-Paste Format (For Quick Setup)

**Copy this block and paste into Vercel's bulk environment variable editor:**

```
NEXT_PUBLIC_SUPABASE_URL=https://ywiuptsshhuazbqsabvp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aXVwdHNzaGh1YXpicXNhYnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODkwNDYsImV4cCI6MjA4MTQ2NTA0Nn0.pBX27KcHT9A2nixTEx9nH89EUFCt9TF3ThUYxk1IdVg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aXVwdHNzaGh1YXpicXNhYnZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg4OTA0NiwiZXhwIjoyMDgxNDY1MDQ2fQ._qXQm7tY9PIugLrq2s8TKHg4LmSK7BJVwqg6XJS45m0
SUPABASE_JWT_SECRET=NpxMWSCsTQRKN+mC32u5meVYoA9JM3aGokNXURuJddkOHCKsDzmJENOegjNrzKYQq9EcJ5DcjaYW4cq3PZdjeA==
```

---

## Important Notes

### Security Best Practices

1. **Public Variables** (`NEXT_PUBLIC_*`)
   - ✅ Safe to expose in browser
   - ✅ Used for client-side Supabase connections
   - ✅ Include in all environments

2. **Private Variables** (no `NEXT_PUBLIC_` prefix)
   - ⚠️ **NEVER** expose in client-side code
   - ⚠️ Only use in API routes or server-side code
   - ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies

3. **Service Role Key Usage**
   - Use only for admin operations
   - Use only in API routes (not client components)
   - Example: `/app/api/admin/route.ts`

### Local Development

Your `.env.local` file is already configured with these variables.
- ✅ File created: `.env.local`
- ✅ Gitignored by default (`.env*.local` is in `.gitignore`)

### After Adding Variables

1. Click **Redeploy** on Vercel dashboard
2. Or trigger new deployment:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

---

## Supabase Project Info

- **Project URL**: https://ywiuptsshhuazbqsabvp.supabase.co
- **Project Ref**: ywiuptsshhuazbqsabvp
- **Dashboard**: https://supabase.com/dashboard/project/ywiuptsshhuazbqsabvp

---

## Testing Environment Variables

After deployment, verify variables are loaded:

```typescript
// In your Next.js component or API route
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Has Service Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
```

✅ All set! Your Supabase credentials are ready for Vercel deployment.
