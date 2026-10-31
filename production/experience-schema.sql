-- Editorial pages for the existing marketplace; merchant publication tables,
-- subscription limits, and the Shopping queue remain independent.
create table public.marketplace_experience_pages (
  slug text primary key check (slug in ('design','stores','contracting-services','partnerships')),
  content jsonb not null check (
    jsonb_typeof(content) = 'object' and content ? 'slug' and content ? 'ar' and content ? 'en' and content->>'slug' = slug
    and jsonb_typeof(content->'ar') = 'object'
    and jsonb_typeof(content->'en') = 'object'
  ),
  status text not null default 'draft' check (status in ('draft','published')),
  updated_at timestamptz not null default now()
);
alter table public.marketplace_experience_pages enable row level security;
revoke all on public.marketplace_experience_pages from anon, authenticated;
grant select on public.marketplace_experience_pages to anon, authenticated;
grant insert, update on public.marketplace_experience_pages to authenticated;
create policy market_experience_public_read on public.marketplace_experience_pages
  for select to anon, authenticated using (status = 'published');
create policy market_experience_admin_read on public.marketplace_experience_pages
  for select to authenticated using ((select public.is_platform_admin()));
create policy market_experience_admin_insert on public.marketplace_experience_pages
  for insert to authenticated with check ((select public.is_platform_admin()));
create policy market_experience_admin_update on public.marketplace_experience_pages
  for update to authenticated using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create trigger market_experience_updated_at before update on public.marketplace_experience_pages
  for each row execute function public.set_updated_at_v2();
