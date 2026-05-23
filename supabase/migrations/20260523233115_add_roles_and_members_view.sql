-- =============================================================================
-- Migration: Add member roles + public members view
--
-- Gives each user a role (basic | admin) for the upcoming admin panel, exposes a
-- name-only public view for the Miembros page, and seeds the first admin.
-- =============================================================================

-- ─── 1. Role column ──────────────────────────────────────────────────────────

alter table users
  add column role text not null default 'basic'
  check (role in ('basic', 'admin'));

-- ─── 2. Seed the initial admin ───────────────────────────────────────────────
-- The role activates when this Google account signs in: identity maps to the
-- row by email (auth.jwt() ->> 'email'), see current_user_role() below.

insert into users (name, email, role)
  values ('Nicolás Venturo', 'nicolas.venturo@gmail.com', 'admin');

-- ─── 3. Public members list (name only) ──────────────────────────────────────
-- The view runs with the caller's privileges (security_invoker), so access is
-- governed by the RLS policy + column grants below. `email` and `role` are never
-- granted, so they cannot be read through the API — only id and name are public.

create policy "Anyone can read member names" on users
  for select to anon, authenticated using (true);

grant select (id, name) on users to anon, authenticated;

create view users_public
  with (security_invoker = true)
  as select id, name from users;

grant select on users_public to anon, authenticated;

-- ─── 4. Role helpers (for the future admin panel) ────────────────────────────

create or replace function current_user_role()
returns text language sql security definer stable
set search_path = ''
as $$
  select coalesce(
    (select role from public.users where email = auth.jwt() ->> 'email'),
    'basic'
  )
$$;

create or replace function is_admin()
returns boolean language sql security definer stable
set search_path = ''
as $$ select public.current_user_role() = 'admin' $$;

grant execute on function current_user_role() to authenticated;
grant execute on function is_admin() to authenticated;
