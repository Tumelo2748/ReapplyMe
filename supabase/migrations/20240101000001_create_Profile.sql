-- profiles table
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  title text,
  skills text,
  experience text,
  resume_url text,
  updated_at timestamp with time zone
);