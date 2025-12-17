# Supabase Database Setup

## Step 1: Run the Schema

1. Go to your Supabase project: https://ywiuptsshhuazbqsabvp.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `schema.sql`
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl/Cmd + Enter`

## Step 2: Verify Tables Created

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - users
   - categories
   - schools
   - classes
   - quizzes
   - quiz_attempts
   - question_banks
   - certificates

## Step 3: Check Demo Users

1. Click on **Table Editor** → **users**
2. You should see 4 demo users:
   - admin@quiz.com (Admin)
   - teacher@quiz.com (Teacher)
   - student@quiz.com (Student)
   - parent@quiz.com (Parent)

## What's Next?

After setting up the database:
1. The app will automatically use Supabase instead of localStorage
2. All data will be stored in the cloud
3. Data will persist across devices and browsers
4. Multiple users can access the same data

## Troubleshooting

**If you get errors:**
- Make sure you're logged into Supabase
- Check that you're in the correct project
- Try running the schema in smaller sections
- Check the error message for specific table issues

**To reset the database:**
```sql
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.question_banks CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF NOT EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```
Then run the schema again.
