
insert into storage.buckets (id, name, public) values ('manga-panels','manga-panels', true)
on conflict (id) do nothing;

create policy "Manga panels are public"
on storage.objects for select
using (bucket_id = 'manga-panels');

create policy "Users upload own manga panels"
on storage.objects for insert
with check (bucket_id = 'manga-panels' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own manga panels"
on storage.objects for update
using (bucket_id = 'manga-panels' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own manga panels"
on storage.objects for delete
using (bucket_id = 'manga-panels' and auth.uid()::text = (storage.foldername(name))[1]);
