-- 1. Email Logs Table (for Nodemailer rate limiting)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    email_type TEXT NOT NULL, -- e.g., 'counselling_invite'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster rate limit queries
CREATE INDEX IF NOT EXISTS idx_email_logs_user_type_created 
ON public.email_logs(user_id, email_type, created_at);

-- Set up Row Level Security (RLS) for email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role / anon (server actions) to manage email_logs
CREATE POLICY "Server actions can manage email_logs"
ON public.email_logs
USING (true)
WITH CHECK (true);


-- 2. Profiles Table (for user profile page)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    phone TEXT,
    neet_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Trigger to create a profile automatically when a user signs up (optional but recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent errors on recreation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
