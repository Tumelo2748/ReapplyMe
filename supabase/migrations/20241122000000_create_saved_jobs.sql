create table saved_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  job_id text not null,
  title text not null,
  company text not null,
  location text,
  description text,
  url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, job_id)
);
