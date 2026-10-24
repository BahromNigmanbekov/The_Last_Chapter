-- =====================================================================
-- THE LAST CHAPTER — foundation schema
-- Run once in Supabase: Dashboard -> SQL Editor -> paste -> Run.
--
-- Access model
--   * Students are NOT Supabase Auth users. They prove identity through the
--     server (name + class + registration code) and receive a signed cookie.
--     All student reads/writes go through Next.js server code that uses the
--     service-role key, so the browser never talks to these tables.
--   * The current admin panel uses a server-side password and signed cookie.
--     Server actions must check that session before using the service-role key.
--     public.admins and its RLS policies also support Supabase Auth admins,
--     but that optional authentication path is not used by the current panel.
--   * With RLS on and no policy for anon, the anon key can read nothing except
--     the public event info.
-- =====================================================================

-- ---------- Admins ----------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------- Events (single row, slug = 'main') ------------------------
create table public.events (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique default 'main',
  name              text not null,
  subtitle          text not null default '',
  description       text not null default '',
  location          text not null,
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  min_contribution  integer not null default 60000 check (min_contribution >= 0),
  registration_open boolean not null default true,
  voting_open       boolean not null default false,
  music_open        boolean not null default false,
  memories_open     boolean not null default false,
  -- [{ "time": "20:00", "title": "Welcome" }, ...]  (editable from admin settings)
  timeline          jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (ends_at > starts_at)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_touch_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

-- ---------- Students (pre-loaded approved list) -----------------------
create table public.students (
  id                uuid primary key default gen_random_uuid(),
  first_name        text not null check (char_length(btrim(first_name)) between 1 and 60),
  last_name         text not null check (char_length(btrim(last_name))  between 1 and 60),
  class_name        text not null check (char_length(btrim(class_name)) between 1 and 10),
  registration_code text not null unique,
  registered        boolean not null default false,
  registered_at     timestamptz,
  created_at        timestamptz not null default now()
);

create index students_class_idx on public.students (class_name);

-- Keep codes canonical so CSV imports / manual inserts always match the login form.
create or replace function public.normalize_student()
returns trigger
language plpgsql
as $$
begin
  new.registration_code = upper(regexp_replace(btrim(new.registration_code), '\s+', '-', 'g'));
  new.first_name = btrim(new.first_name);
  new.last_name  = btrim(new.last_name);
  new.class_name = btrim(new.class_name);
  return new;
end;
$$;

create trigger students_normalize
  before insert or update on public.students
  for each row execute function public.normalize_student();

-- ---------- Tickets ---------------------------------------------------
create table public.tickets (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null unique references public.students (id) on delete cascade,
  -- Random, unguessable, contains no personal data. This is what the QR encodes.
  ticket_token text not null unique
                 default ('TKT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 20))),
  status       text not null default 'valid' check (status in ('valid', 'used', 'revoked')),
  created_at   timestamptz not null default now()
);

-- ---------- Payments --------------------------------------------------
create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.students (id) on delete cascade,
  ticket_id      uuid references public.tickets (id) on delete set null,
  amount         integer not null check (amount > 0),        -- UZS
  status         text not null default 'pending'
                   check (status in ('pending', 'paid', 'failed', 'cancelled')),
  provider       text,                                        -- e.g. 'payme', 'click' (set in Phase 3)
  transaction_id text,
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);

create index payments_student_idx on public.payments (student_id);
create index payments_status_idx  on public.payments (status);
create unique index payments_provider_txn_uniq
  on public.payments (provider, transaction_id)
  where transaction_id is not null;

-- ---------- Movies & votes --------------------------------------------
create table public.movies (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 120),
  description      text not null default '' check (char_length(description) <= 1000),
  poster_url       text,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  is_selected      boolean not null default false,   -- the admin-confirmed final movie
  created_at       timestamptz not null default now()
);

-- At most one confirmed movie.
create unique index movies_single_selected_idx on public.movies (is_selected) where is_selected;

create table public.movie_votes (
  id         uuid primary key default gen_random_uuid(),
  -- UNIQUE(student_id): one vote per student, enforced by the database itself.
  student_id uuid not null unique references public.students (id) on delete cascade,
  movie_id   uuid not null references public.movies (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index movie_votes_movie_idx on public.movie_votes (movie_id);

-- ---------- Music requests --------------------------------------------
create table public.music_requests (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  artist     text not null check (char_length(btrim(artist)) between 1 and 100),
  song       text not null check (char_length(btrim(song))   between 1 and 100),
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index music_requests_student_idx on public.music_requests (student_id);
create index music_requests_status_idx  on public.music_requests (status);

-- ---------- Memories (videos + Memory Wall text) ----------------------
create table public.memories (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  kind       text not null default 'video' check (kind in ('video', 'text')),
  caption    text check (caption is null or char_length(caption) <= 500),
  -- Path inside the PRIVATE 'memories' storage bucket (created in Phase 2).
  -- We store a path, never a public URL: pending videos must not be reachable.
  file_path  text,
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  check (kind <> 'video' or file_path is not null),
  check (kind <> 'text'  or (caption is not null and char_length(btrim(caption)) > 0))
);

create index memories_student_idx on public.memories (student_id);
create index memories_status_idx  on public.memories (status);

-- ---------- Entries (check-in) ----------------------------------------
create table public.entries (
  id            uuid primary key default gen_random_uuid(),
  -- UNIQUE(ticket_id): a ticket can be checked in exactly once (DB-level guarantee).
  ticket_id     uuid not null unique references public.tickets (id) on delete cascade,
  student_id    uuid not null references public.students (id) on delete cascade,
  entered_at    timestamptz not null default now(),
  checked_in_by uuid references auth.users (id) on delete set null
);

-- ---------- Login throttling ------------------------------------------
create table public.login_attempts (
  id           bigint generated always as identity primary key,
  ip_hash      text not null,       -- salted SHA-256; raw IPs are never stored
  subject_hash text not null,       -- salted SHA-256 of normalized name + class
  success      boolean not null,
  created_at   timestamptz not null default now()
);

create index login_attempts_ip_idx      on public.login_attempts (ip_hash, created_at desc);
create index login_attempts_subject_idx on public.login_attempts (subject_hash, created_at desc);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.admins          enable row level security;
alter table public.events          enable row level security;
alter table public.students        enable row level security;
alter table public.tickets         enable row level security;
alter table public.payments        enable row level security;
alter table public.movies          enable row level security;
alter table public.movie_votes     enable row level security;
alter table public.music_requests  enable row level security;
alter table public.memories        enable row level security;
alter table public.entries         enable row level security;
alter table public.login_attempts  enable row level security;

-- Public: event info only (name, date, location, timeline, open/closed flags).
create policy events_public_read on public.events
  for select to anon, authenticated using (true);

-- Admins: full access to every table.
create policy events_admin_write on public.events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy students_admin_all on public.students
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy tickets_admin_all on public.tickets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy payments_admin_all on public.payments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy movies_admin_all on public.movies
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy movie_votes_admin_all on public.movie_votes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy music_requests_admin_all on public.music_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy memories_admin_all on public.memories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy entries_admin_all on public.entries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- admins: an admin may read their own row (used to check "am I an admin?").
-- Nobody can add admins through the API; do it in the SQL editor (see README).
create policy admins_read_self on public.admins
  for select to authenticated using (user_id = auth.uid());

-- login_attempts: no policies at all -> only the service role can touch it.

-- =====================================================================
-- Table privileges (defense in depth on top of RLS)
-- =====================================================================
revoke all on all tables in schema public from anon, authenticated;

grant select on public.events to anon, authenticated;

grant select, insert, update, delete on
  public.events, public.students, public.tickets, public.payments, public.movies,
  public.movie_votes, public.music_requests, public.memories, public.entries
  to authenticated;

grant select on public.admins to authenticated;

grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
