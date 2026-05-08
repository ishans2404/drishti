-- =============================================================
--  Drishti — single migration
--  Order: extensions → tables → functions → triggers →
--         RLS enable → policies → grants → storage
-- =============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ── Tables ───────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);

create table if not exists public.organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  logo_url      text,
  primary_color text not null default '#1a3a6e',
  created_at    timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id)           on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.displays (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name            text not null,
  slug            text not null unique,
  template_key    text not null default 'lobby'
                  check (template_key in ('lobby','hospital','school','office','minimal')),
  layout_config   jsonb not null default '{"version":1,"zones":[]}'::jsonb,
  theme_config    jsonb not null default '{
    "primaryColor":"#1a3a6e",
    "backgroundColor":"#101820",
    "textColor":"#f8fbff",
    "accentColor":"#c8a84b",
    "radius":6,
    "backgroundMediaUrl":null
  }'::jsonb,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.content_items (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  type            text not null
                  check (type in ('notice','event','document','link','alert','ticker')),
  title           text not null,
  body            text,
  metadata        jsonb not null default '{}'::jsonb,
  starts_at       timestamptz,
  ends_at         timestamptz,
  is_active       boolean not null default true,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

create table if not exists public.media_assets (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kind            text not null
                  check (kind in ('image','video','audio','document','background')),
  title           text not null,
  storage_path    text not null,
  public_url      text not null,
  mime_type       text,
  size_bytes      bigint,
  created_at      timestamptz not null default now()
);

create table if not exists public.display_content (
  display_id      uuid not null references public.displays(id)       on delete cascade,
  content_item_id uuid not null references public.content_items(id)  on delete cascade,
  primary key (display_id, content_item_id)
);

create table if not exists public.display_media (
  display_id     uuid not null references public.displays(id)      on delete cascade,
  media_asset_id uuid not null references public.media_assets(id)  on delete cascade,
  primary key (display_id, media_asset_id)
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists displays_org_idx          on public.displays(organization_id);
create index if not exists displays_slug_idx         on public.displays(slug);
create index if not exists content_items_org_type_idx on public.content_items(organization_id, type, is_active);
create index if not exists media_assets_org_kind_idx  on public.media_assets(organization_id, kind);

-- ── Helper functions (created BEFORE policies that reference them) ────
create or replace function public.slugify(input text)
returns text
language sql immutable as $$
  select trim(both '-' from
    regexp_replace(lower(coalesce(input,'')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql security definer
set search_path = public
stable as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
  );
$$;

-- ── updated_at trigger ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists displays_set_updated_at on public.displays;
create trigger displays_set_updated_at
  before update on public.displays
  for each row execute function public.set_updated_at();

-- ── New-user bootstrap trigger ───────────────────────────────
--  Runs as postgres (superuser) — bypasses RLS completely.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_org_id      uuid;
  v_org_name    text;
  v_org_slug    text;
  v_disp_slug   text;
begin
  v_org_name  := coalesce(
    new.raw_user_meta_data->>'organization_name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email,'@',1),
    'Drishti Workspace'
  );
  v_org_slug  := public.slugify(v_org_name);
  if v_org_slug = '' then v_org_slug := 'workspace'; end if;
  v_org_slug  := v_org_slug || '-' || substr(new.id::text, 1, 8);
  v_disp_slug := v_org_slug || '-main';

  -- profile
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do update
    set email     = excluded.email,
        full_name = coalesce(excluded.full_name, profiles.full_name);

  -- org
  insert into public.organizations (name, slug)
  values (v_org_name, v_org_slug)
  returning id into v_org_id;

  -- membership
  insert into public.organization_members (organization_id, user_id)
  values (v_org_id, new.id)
  on conflict do nothing;

  -- default display
  insert into public.displays (organization_id, name, slug, template_key, layout_config)
  values (
    v_org_id,
    'Main Display',
    v_disp_slug,
    'lobby',
    '{
      "version":1,
      "zones":[
        {"id":"header","type":"header","title":"Organization Header","x":3,"y":3,"w":94,"h":10,"order":1,"visible":true,"settings":{"source":"organization","fontScale":1}},
        {"id":"hero","type":"hero-media","title":"Feature Visual","x":3,"y":16,"w":58,"h":58,"order":2,"visible":true,"settings":{"source":"image","intervalSeconds":10,"fontScale":1}},
        {"id":"notices","type":"notice-rail","title":"Notice Board","x":63,"y":16,"w":34,"h":35,"order":3,"visible":true,"settings":{"source":"notice","maxItems":4,"fontScale":1}},
        {"id":"events","type":"event-list","title":"Events","x":63,"y":53,"w":34,"h":21,"order":4,"visible":true,"settings":{"source":"event","maxItems":3,"fontScale":1}},
        {"id":"ticker","type":"ticker","title":"Ticker","x":3,"y":77,"w":94,"h":8,"order":5,"visible":true,"settings":{"source":"ticker","fontScale":1}},
        {"id":"footer","type":"footer","title":"Footer","x":3,"y":87,"w":94,"h":8,"order":6,"visible":true,"settings":{"fontScale":1}}
      ]
    }'::jsonb
  );

  -- seed content
  insert into public.content_items (organization_id, type, title, body, display_order)
  values
    (v_org_id, 'notice', 'Welcome to Drishti',
     'Use the Content Library to publish notices, documents, events, and media.', 1),
    (v_org_id, 'ticker', 'Live updates appear here',
     'Connect this ticker to every screen that needs instant announcements.', 2),
    (v_org_id, 'event',  'Orientation',
     'Create your first event and assign it to the lobby display.', 3);

  -- link seed content to display
  insert into public.display_content (display_id, content_item_id)
  select d.id, c.id
  from   public.displays       d
  join   public.content_items  c on c.organization_id = d.organization_id
  where  d.organization_id = v_org_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Enable RLS ───────────────────────────────────────────────
alter table public.profiles             enable row level security;
alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.displays             enable row level security;
alter table public.content_items        enable row level security;
alter table public.media_assets         enable row level security;
alter table public.display_content      enable row level security;
alter table public.display_media        enable row level security;

-- ── RLS Policies ─────────────────────────────────────────────

-- profiles
drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_read"   on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_self_update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- organization_members
drop policy if exists "members_read_own" on public.organization_members;
drop policy if exists "members_insert_self" on public.organization_members;
create policy "members_read_own"    on public.organization_members for select to authenticated using (user_id = auth.uid());
create policy "members_insert_self" on public.organization_members for insert to authenticated with check (user_id = auth.uid());

-- organizations
drop policy if exists "orgs_member_read"        on public.organizations;
drop policy if exists "orgs_public_read"         on public.organizations;
drop policy if exists "orgs_member_update"       on public.organizations;
drop policy if exists "orgs_authenticated_insert" on public.organizations;

create policy "orgs_member_read"
  on public.organizations for select to authenticated
  using (public.is_org_member(id));

create policy "orgs_public_read"
  on public.organizations for select to anon
  using (exists (select 1 from public.displays d where d.organization_id = id and d.is_active));

create policy "orgs_member_update"
  on public.organizations for update to authenticated
  using (public.is_org_member(id)) with check (public.is_org_member(id));

create policy "orgs_authenticated_insert"
  on public.organizations for insert to authenticated
  with check (true);

-- displays
drop policy if exists "displays_member_all"    on public.displays;
drop policy if exists "displays_public_read"   on public.displays;
create policy "displays_member_all"
  on public.displays for all to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
create policy "displays_public_read"
  on public.displays for select to anon
  using (is_active);

-- content_items
drop policy if exists "content_member_all"   on public.content_items;
drop policy if exists "content_public_read"  on public.content_items;
create policy "content_member_all"
  on public.content_items for all to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
create policy "content_public_read"
  on public.content_items for select to anon
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >= now())
    and exists (
      select 1 from public.display_content dc
      join   public.displays d on d.id = dc.display_id
      where  dc.content_item_id = content_items.id and d.is_active
    )
  );

-- media_assets
drop policy if exists "media_member_all"  on public.media_assets;
drop policy if exists "media_public_read" on public.media_assets;
create policy "media_member_all"
  on public.media_assets for all to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
create policy "media_public_read"
  on public.media_assets for select to anon
  using (exists (
    select 1 from public.display_media dm
    join   public.displays d on d.id = dm.display_id
    where  dm.media_asset_id = media_assets.id and d.is_active
  ));

-- display_content links
drop policy if exists "dc_member_all"   on public.display_content;
drop policy if exists "dc_public_read"  on public.display_content;
create policy "dc_member_all"
  on public.display_content for all to authenticated
  using (exists (
    select 1 from public.displays d
    where d.id = display_id and public.is_org_member(d.organization_id)
  ))
  with check (exists (
    select 1 from public.displays d
    where d.id = display_id and public.is_org_member(d.organization_id)
  ));
create policy "dc_public_read"
  on public.display_content for select to anon
  using (exists (select 1 from public.displays d where d.id = display_id and d.is_active));

-- display_media links
drop policy if exists "dm_member_all"  on public.display_media;
drop policy if exists "dm_public_read" on public.display_media;
create policy "dm_member_all"
  on public.display_media for all to authenticated
  using (exists (
    select 1 from public.displays d
    where d.id = display_id and public.is_org_member(d.organization_id)
  ))
  with check (exists (
    select 1 from public.displays d
    where d.id = display_id and public.is_org_member(d.organization_id)
  ));
create policy "dm_public_read"
  on public.display_media for select to anon
  using (exists (select 1 from public.displays d where d.id = display_id and d.is_active));

-- ── Grants (AFTER tables exist) ──────────────────────────────
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles             to authenticated;
grant select, insert, update, delete on public.organizations        to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.displays             to authenticated;
grant select, insert, update, delete on public.content_items        to authenticated;
grant select, insert, update, delete on public.media_assets         to authenticated;
grant select, insert, update, delete on public.display_content      to authenticated;
grant select, insert, update, delete on public.display_media        to authenticated;

grant select on public.organizations   to anon;
grant select on public.displays        to anon;
grant select on public.content_items   to anon;
grant select on public.media_assets    to anon;
grant select on public.display_content to anon;
grant select on public.display_media   to anon;

grant execute on function public.is_org_member(uuid) to authenticated, anon;
grant execute on function public.slugify(text)        to authenticated, anon;

-- ── Storage buckets ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('organization-assets', 'organization-assets', true, 26214400),
  ('display-media',       'display-media',       true, 104857600)
on conflict (id) do update set public = excluded.public;

drop policy if exists "storage_public_read"    on storage.objects;
drop policy if exists "storage_member_insert"  on storage.objects;
drop policy if exists "storage_member_update"  on storage.objects;
drop policy if exists "storage_member_delete"  on storage.objects;

create policy "storage_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('organization-assets','display-media'));

create policy "storage_member_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('organization-assets','display-media')
    and exists (
      select 1 from public.organization_members m
      where m.user_id = auth.uid()
        and m.organization_id::text = (storage.foldername(name))[1]
    )
  );

create policy "storage_member_update"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('organization-assets','display-media')
    and exists (
      select 1 from public.organization_members m
      where m.user_id = auth.uid()
        and m.organization_id::text = (storage.foldername(name))[1]
    )
  );

create policy "storage_member_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('organization-assets','display-media')
    and exists (
      select 1 from public.organization_members m
      where m.user_id = auth.uid()
        and m.organization_id::text = (storage.foldername(name))[1]
    )
  );