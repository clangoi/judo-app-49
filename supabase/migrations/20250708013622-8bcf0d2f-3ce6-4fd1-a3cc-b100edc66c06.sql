
-- Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS competition_category TEXT,
ADD COLUMN IF NOT EXISTS injuries TEXT[],
ADD COLUMN IF NOT EXISTS injury_description TEXT;
