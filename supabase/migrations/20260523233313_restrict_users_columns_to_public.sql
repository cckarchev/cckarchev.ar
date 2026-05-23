-- =============================================================================
-- Migration: Restrict public column access on users to id + name
--
-- Supabase grants anon/authenticated table-level SELECT on every column of new
-- public tables by default. The column grant added in the previous migration was
-- additive, so once the "Anyone can read member names" RLS policy opened the
-- rows, `email` and `role` became readable through the API.
--
-- Fix: drop the blanket table-level SELECT and re-grant only the public columns.
-- After this, a query for `email` or `role` fails with permission denied, while
-- id + name (the columns behind users_public) stay readable. Admin reads of
-- email/role go through SECURITY DEFINER functions, not these grants.
-- =============================================================================

revoke select on users from anon, authenticated;

grant select (id, name) on users to anon, authenticated;
