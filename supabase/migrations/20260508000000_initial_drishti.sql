create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  primary_color text not null default '#2457d6',
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.displays (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null unique,
  template_key text not null default 'lobby' check (template_key in ('lobby', 'hospital', 'school', 'office', 'minimal')),
  layout_config jsonb not null default '{"version":1,"zones":[]}'::jsonb,
  theme_config jsonb not null default '{"primaryColor":"#2457d6","backgroundColor":"#101820","textColor":"#f8fbff","accentColor":"#f6b73c","radius":8,"backgroundMediaUrl":null}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  type text not null check (type in ('notice', 'event', 'document', 'link', 'alert', 'ticker')),
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null check (kind in ('image', 'video', 'audio', 'document', 'background')),
  title text not null,
  storage_path text not null,
  public_url text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.display_content (
  display_id uuid not null references public.displays(id) on delete cascade,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  primary key (display_id, content_item_id)
);

create table if not exists public.display_media (
  display_id uuid not null references public.displays(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  primary key (display_id, media_asset_id)
);

create index if not exists displays_org_idx on public.displays(organization_id);
create index if not exists displays_slug_idx on public.displays(slug);
create index if not exists content_items_org_type_idx on public.content_items(organization_id, type, is_active);
create index if not exists media_assets_org_kind_idx on public.media_assets(organization_id, kind);

create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members member
    where member.organization_id = org_id
      and member.user_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists displays_set_updated_at on public.displays;
create trigger displays_set_updated_at
before update on public.displays
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
  org_name text;
  org_slug text;
  display_slug text;
begin
  org_name := coalesce(new.raw_user_meta_data ->> 'organization_name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Drishti Workspace');
  org_slug := public.slugify(org_name);
  if org_slug = '' then
    org_slug := 'drishti-workspace';
  end if;
  org_slug := org_slug || '-' || substr(new.id::text, 1, 8);
  display_slug := org_slug || '-main';

  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);

  insert into public.organizations (name, slug)
  values (org_name, org_slug)
  returning id into org_id;

  insert into public.organization_members (organization_id, user_id)
  values (org_id, new.id)
  on conflict do nothing;

  insert into public.displays (organization_id, name, slug, template_key, layout_config)
  values (
    org_id,
    'Main Lobby Display',
    display_slug,
    'lobby',
    '{
      "version": 1,
      "zones": [
        {"id":"header","type":"header","title":"Organization Header","x":3,"y":3,"w":94,"h":10,"order":1,"visible":true,"settings":{"source":"organization","fontScale":1}},
        {"id":"hero","type":"hero-media","title":"Feature Visual","x":3,"y":16,"w":58,"h":58,"order":2,"visible":true,"settings":{"source":"image","intervalSeconds":10,"fontScale":1}},
        {"id":"notices","type":"notice-rail","title":"Notice Board","x":63,"y":16,"w":34,"h":35,"order":3,"visible":true,"settings":{"source":"notice","maxItems":4,"fontScale":1}},
        {"id":"events","type":"event-list","title":"Events","x":63,"y":53,"w":34,"h":21,"order":4,"visible":true,"settings":{"source":"event","maxItems":3,"fontScale":1}},
        {"id":"ticker","type":"ticker","title":"Ticker","x":3,"y":77,"w":94,"h":8,"order":5,"visible":true,"settings":{"source":"ticker","fontScale":1}},
        {"id":"footer","type":"footer","title":"Footer","x":3,"y":87,"w":94,"h":8,"order":6,"visible":true,"settings":{"fontScale":1}}
      ]
    }'::jsonb
  );

  insert into public.content_items (organization_id, type, title, body, display_order)
  values
    (org_id, 'notice', 'Welcome to Drishti', 'Use the content library to publish notices, documents, events, and media to this display.', 1),
    (org_id, 'ticker', 'Live updates appear here', 'Connect this ticker to every screen that needs instant announcements.', 2),
    (org_id, 'event', 'Orientation', 'Create your first event and assign it to the lobby display.', 3);

  insert into public.display_content (display_id, content_item_id)
  select d.id, c.id
  from public.displays d
  join public.content_items c on c.organization_id = d.organization_id
  where d.organization_id = org_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.displays enable row level security;
alter table public.content_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.display_content enable row level security;
alter table public.display_media enable row level security;

drop policy if exists "profiles are self readable" on public.profiles;
create policy "profiles are self readable"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles are self writable" on public.profiles;
create policy "profiles are self writable"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "members can read own memberships" on public.organization_members;
create policy "members can read own memberships"
on public.organization_members for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "authenticated can add self memberships" on public.organization_members;
create policy "authenticated can add self memberships"
on public.organization_members for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "members can read organizations" on public.organizations;
create policy "members can read organizations"
on public.organizations for select
to authenticated
using (public.is_org_member(id));

drop policy if exists "public can read organizations for active displays" on public.organizations;
create policy "public can read organizations for active displays"
on public.organizations for select
to anon
using (exists (select 1 from public.displays d where d.organization_id = id and d.is_active));

drop policy if exists "members can update organizations" on public.organizations;
create policy "members can update organizations"
on public.organizations for update
to authenticated
using (public.is_org_member(id))
with check (public.is_org_member(id));

drop policy if exists "authenticated can create organizations" on public.organizations;
create policy "authenticated can create organizations"
on public.organizations for insert
to authenticated
with check (true);

drop policy if exists "members can manage displays" on public.displays;
create policy "members can manage displays"
on public.displays for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists "public can read active displays" on public.displays;
create policy "public can read active displays"
on public.displays for select
to anon
using (is_active);

drop policy if exists "members can manage content" on public.content_items;
create policy "members can manage content"
on public.content_items for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists "public can read active linked content" on public.content_items;
create policy "public can read active linked content"
on public.content_items for select
to anon
using (
  is_active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
  and exists (
    select 1
    from public.display_content dc
    join public.displays d on d.id = dc.display_id
    where dc.content_item_id = public.content_items.id
      and d.is_active
  )
);

drop policy if exists "members can manage media" on public.media_assets;
create policy "members can manage media"
on public.media_assets for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists "public can read linked media" on public.media_assets;
create policy "public can read linked media"
on public.media_assets for select
to anon
using (
  exists (
    select 1
    from public.display_media dm
    join public.displays d on d.id = dm.display_id
    where dm.media_asset_id = public.media_assets.id
      and d.is_active
  )
);

drop policy if exists "members can manage display content links" on public.display_content;
create policy "members can manage display content links"
on public.display_content for all
to authenticated
using (exists (select 1 from public.displays d where d.id = display_id and public.is_org_member(d.organization_id)))
with check (exists (select 1 from public.displays d where d.id = display_id and public.is_org_member(d.organization_id)));

drop policy if exists "public can read display content links" on public.display_content;
create policy "public can read display content links"
on public.display_content for select
to anon
using (exists (select 1 from public.displays d where d.id = display_id and d.is_active));

drop policy if exists "members can manage display media links" on public.display_media;
create policy "members can manage display media links"
on public.display_media for all
to authenticated
using (exists (select 1 from public.displays d where d.id = display_id and public.is_org_member(d.organization_id)))
with check (exists (select 1 from public.displays d where d.id = display_id and public.is_org_member(d.organization_id)));

drop policy if exists "public can read display media links" on public.display_media;
create policy "public can read display media links"
on public.display_media for select
to anon
using (exists (select 1 from public.displays d where d.id = display_id and d.is_active));

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('organization-assets', 'organization-assets', true, 26214400),
  ('display-media', 'display-media', true, 104857600)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public can read drishti storage" on storage.objects;
create policy "public can read drishti storage"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('organization-assets', 'display-media'));

drop policy if exists "members can upload drishti storage" on storage.objects;
create policy "members can upload drishti storage"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('organization-assets', 'display-media')
  and exists (
    select 1
    from public.organization_members member
    where member.user_id = auth.uid()
      and member.organization_id::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "members can update drishti storage" on storage.objects;
create policy "members can update drishti storage"
on storage.objects for update
to authenticated
using (
  bucket_id in ('organization-assets', 'display-media')
  and exists (
    select 1
    from public.organization_members member
    where member.user_id = auth.uid()
      and member.organization_id::text = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id in ('organization-assets', 'display-media')
  and exists (
    select 1
    from public.organization_members member
    where member.user_id = auth.uid()
      and member.organization_id::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "members can delete drishti storage" on storage.objects;
create policy "members can delete drishti storage"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('organization-assets', 'display-media')
  and exists (
    select 1
    from public.organization_members member
    where member.user_id = auth.uid()
      and member.organization_id::text = (storage.foldername(name))[1]
  )
);
