-- =============================================================================
-- Migration: Admin management of the users table
--
-- Lets admins manage members, layered on top of the public read path (anon /
-- authenticated can still read only id + name via users_public) without
-- loosening it. Two parts:
--   1. Write policies (insert / update / delete) gated by is_admin().
--   2. A SECURITY DEFINER read RPC, because anon/authenticated are column-granted
--      to (id, name) only — even an admin can't read email/role through the base
--      table, so admin reads go through this function instead.
-- =============================================================================

-- ─── 1. Admin write policies ─────────────────────────────────────────────────
-- Only authenticated callers whose linked role is 'admin' may write. anon and
-- basic users have no matching policy, so RLS denies their writes.

create policy "Admins can insert users" on users
  for insert to authenticated with check (is_admin());

create policy "Admins can update users" on users
  for update to authenticated using (is_admin()) with check (is_admin());

create policy "Admins can delete users" on users
  for delete to authenticated using (is_admin());

-- ─── 2. Admin read RPC (full rows, incl. email + role) ───────────────────────
-- Runs as definer so it bypasses the (id, name) column grant; guards on
-- is_admin() so only admins get data. The admin panel calls this to list members.

create or replace function admin_list_users()
returns table (id bigint, name text, email text, role text)
language plpgsql security definer stable
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo los administradores pueden listar los usuarios';
  end if;
  return query
    select u.id, u.name, u.email, u.role
    from public.users u
    order by u.name;
end;
$$;

grant execute on function admin_list_users() to authenticated;
