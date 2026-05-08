grant usage on schema public to anon, authenticated;

-- Authenticated users can rely on RLS for row access.
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.organizations to authenticated;
grant select, insert, update, delete on table public.organization_members to authenticated;
grant select, insert, update, delete on table public.displays to authenticated;
grant select, insert, update, delete on table public.content_items to authenticated;
grant select, insert, update, delete on table public.media_assets to authenticated;
grant select, insert, update, delete on table public.display_content to authenticated;
grant select, insert, update, delete on table public.display_media to authenticated;

-- Anonymous users can read public display data only.
grant select on table public.organizations to anon;
grant select on table public.displays to anon;
grant select on table public.content_items to anon;
grant select on table public.media_assets to anon;
grant select on table public.display_content to anon;
grant select on table public.display_media to anon;

grant execute on function public.is_org_member(uuid) to authenticated, anon;
grant execute on function public.slugify(text) to authenticated, anon;
