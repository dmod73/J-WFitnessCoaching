-- === Fase 1: usuarios, perfiles y roles ===
create type if not exists public.user_role as enum ('admin', 'user');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil extendido para usuarios de Supabase Auth';

-- Trigger para mantener updated_at al modificar registros
create or replace function public.handle_profile_updated()
returns trigger
language plpgsql
security definer
set search_path = public as 
begin
  new.updated_at := now();
  return new;
end;
;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_profile_updated();

-- Trigger para autopoblar profiles cuando se crea auth.user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public as 
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;

create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "admin read all" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "admin update all" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- RPC para promover a admin (usar Service Role)
create or replace function public.promote_to_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public as 
begin
  update public.profiles
  set role = 'admin', updated_at = now()
  where email = target_email;
end;
;
