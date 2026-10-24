begin;

-- Codes are assigned by the database and displayed after sign-in.
alter table public.students alter column registration_code set default
  ('LC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)));

create or replace function public.student_name_key(value text)
returns text language sql immutable strict set search_path = public as $$
  select btrim(regexp_replace(
    regexp_replace(lower(normalize(value, NFKC)), $pattern$['‘’ʹʻʼ′`´]$pattern$, '', 'g'),
    '[\s–—_.-]+', ' ', 'g'));
$$;
create or replace function public.student_class_key(value text)
returns text language sql immutable strict set search_path = public as $$
  select regexp_replace(translate(upper(normalize(value, NFKC)), 'АВСЕ', 'ABCE'), '[\s–—_.-]+', '', 'g');
$$;

alter table public.students add column if not exists first_name_key text generated always as (public.student_name_key(first_name)) stored;
alter table public.students add column if not exists last_name_key text generated always as (public.student_name_key(last_name)) stored;
alter table public.students add column if not exists class_key text generated always as (public.student_class_key(class_name)) stored;
create index if not exists students_identity_idx on public.students(first_name_key, last_name_key, class_key);

-- A QR may exist before payment; it is explicitly pending until payment is confirmed.
alter table public.tickets drop constraint if exists tickets_status_check;
alter table public.tickets add constraint tickets_status_check check(status in ('pending', 'valid', 'used', 'revoked'));

alter table public.memories drop constraint if exists memories_kind_check;
alter table public.memories add constraint memories_kind_check check(kind in ('text', 'image', 'video'));
alter table public.memories add constraint memories_image_file_required check(kind <> 'image' or file_path is not null);

-- No public read/upload policy: the server grants scoped upload and viewing URLs.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values('memories', 'memories', false, 52428800, array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
on conflict(id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

commit;
