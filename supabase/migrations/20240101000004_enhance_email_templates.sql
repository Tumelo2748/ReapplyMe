-- Add category field to user_email_templates
alter table public.user_email_templates
add column if not exists category text default 'General';

-- Create template versions table
create table if not exists public.template_versions (
    id uuid default gen_random_uuid() primary key,
    template_id uuid references public.user_email_templates(id) on delete cascade not null,
    content text not null,
    version_number integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete set null,
    unique(template_id, version_number)
);

-- Create template sharing table
create table if not exists public.shared_templates (
    id uuid default gen_random_uuid() primary key,
    template_id uuid references public.user_email_templates(id) on delete cascade not null,
    shared_with uuid references auth.users(id) on delete cascade not null,
    can_edit boolean default false,
    shared_at timestamp with time zone default timezone('utc'::text, now()) not null,
    shared_by uuid references auth.users(id) on delete set null,
    unique(template_id, shared_with)
);

-- Create RLS policies for template versions
alter table public.template_versions enable row level security;

create policy "Users can view their own template versions"
on public.template_versions for select
using (
    exists (
        select 1 from public.user_email_templates t
        where t.id = template_versions.template_id
        and t.user_id = auth.uid()
    )
);

create policy "Users can insert their own template versions"
on public.template_versions for insert
with check (
    exists (
        select 1 from public.user_email_templates t
        where t.id = template_versions.template_id
        and t.user_id = auth.uid()
    )
);

-- Create RLS policies for shared templates
alter table public.shared_templates enable row level security;

create policy "Users can view templates shared with them"
on public.shared_templates for select
using (shared_with = auth.uid());

create policy "Users can share their own templates"
on public.shared_templates for insert
with check (
    exists (
        select 1 from public.user_email_templates t
        where t.id = shared_templates.template_id
        and t.user_id = auth.uid()
    )
);

create policy "Users can delete their own shared templates"
on public.shared_templates for delete
using (
    exists (
        select 1 from public.user_email_templates t
        where t.id = shared_templates.template_id
        and t.user_id = auth.uid()
    )
);
