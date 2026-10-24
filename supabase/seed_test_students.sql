-- DEV / TESTING ONLY. Fake students so you can try the registration flow.
-- Delete them before the real list goes in:
--   delete from public.students where registration_code in
--     ('AZI-7294','MAL-1846','JAS-5031','DIL-9420');
insert into public.students (first_name, last_name, class_name, registration_code) values
  ('Aziz',    'Karimov',   '11-A', 'AZI-7294'),
  ('Malika',  'Yusupova',  '11-A', 'MAL-1846'),
  ('Jasur',   'Rakhimov',  '11-B', 'JAS-5031'),
  ('Dilnoza', 'Tursunova', '11-B', 'DIL-9420')
on conflict (registration_code) do nothing;
