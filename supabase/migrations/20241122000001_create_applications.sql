-- applications table
create table applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  job_title text not null,
  company text not null,
  status text not null,
  applied_at timestamp with time zone default now()
);