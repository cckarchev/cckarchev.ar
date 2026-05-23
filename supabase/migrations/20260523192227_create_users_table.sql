-- =============================================================================
-- Migration: Create users table
--
-- The initial users table: a name and an optional, unique email. Email is the
-- key we map a signed-in Google account to (auth.jwt() ->> 'email'), so it must
-- be unique, but it stays nullable so a row can exist before anyone links to it.
--
-- RLS is enabled with NO policies, which denies all access through the anon and
-- authenticated API roles by default. Access policies are added per-feature as
-- we build them, rather than opening the table up speculatively.
-- =============================================================================

create table users (
  id bigint generated always as identity primary key,
  name text not null check (length(name) > 0),
  email text unique
);

alter table users enable row level security;
