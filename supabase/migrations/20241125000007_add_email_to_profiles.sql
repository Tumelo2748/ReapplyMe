-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Update email from auth.users
UPDATE profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id;

-- Add unique constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
