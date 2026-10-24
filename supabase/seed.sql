-- Run AFTER 0001_foundation.sql. Safe to re-run (upserts the 'main' event).
--
-- !! CHECK THE YEAR BELOW !!  It is the only place the event date lives.
-- Times are entered in Uzbekistan time (UTC+5, no daylight saving).
insert into public.events
  (slug, name, subtitle, description, location, starts_at, ends_at, min_contribution, timeline)
values (
  'main',
  'THE LAST CHAPTER',
  '2026-YIL BITIRUVCHILARI',
  'Ikkita 11-sinf uchun bitiruv oqshomi. Yana bir unutilmas kecha birga.',
  'Maktabning markaziy hovlisi',
  timestamptz '2027-05-25 20:00:00+05',
  timestamptz '2027-05-25 22:00:00+05',
  60000,
  '[
    {"time": "20:00", "title": "Kutib olish"},
    {"time": "20:15", "title": "Xotiralar va videolar"},
    {"time": "20:30", "title": "Film"},
    {"time": "21:30", "title": "Hikoyalar va tilaklar"},
    {"time": "21:45", "title": "Yakuniy lahzalar"},
    {"time": "22:00", "title": "Yakun"}
  ]'::jsonb
)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  description = excluded.description,
  location = excluded.location,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  min_contribution = excluded.min_contribution,
  timeline = excluded.timeline;
