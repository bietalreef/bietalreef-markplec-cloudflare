-- Read-only public marketplace presentation, with the same approval and plan gates.
create or replace function public.get_public_market_store_page(p_slug text)
returns jsonb language plpgsql stable security definer set search_path = '' as $fn$
declare v_id uuid; v_user uuid; v_profile jsonb; v_catalog jsonb; v_items jsonb; v_legacy jsonb; v_studio boolean; v_contact boolean; v_quotes boolean;
begin
  if p_slug is null or btrim(p_slug) !~ '^[A-Za-z0-9][A-Za-z0-9-]{0,119}$' then
    return jsonb_build_object('ok',false,'code','STORE_NOT_PUBLIC');
  end if;
  select pub.id,pp.user_id,coalesce(pub.direct_contact_enabled,false),coalesce(pub.accepts_quote_requests,false) into v_id,v_user,v_contact,v_quotes
    from public.provider_public_profiles pub
    join public.provider_profiles pp on pp.id=pub.provider_profile_id
    join public.app_accounts acc on acc.user_id=pp.user_id
    join public.provider_store_settings store on store.provider_id=pub.id
   where lower(pub.slug)=lower(btrim(p_slug))
     and pub.verification_status='verified' and pub.publication_status='published'
     and pub.app_publication_status='published'
     and pp.status='approved' and pp.account_stage='approved'
     and acc.account_status='active' and acc.account_approval_status='approved'
     and acc.provider_request_status='verified' and store.store_status='active'
     and store.channel_profile_review #>> '{market,status}'='published'
     and coalesce((private.resolve_provider_publication_entitlement(pub.id)->>'active')::boolean,false)
   limit 1;
  if v_id is null then return jsonb_build_object('ok',false,'code','STORE_NOT_PUBLIC'); end if;
  v_studio:=coalesce((private.provider_runtime_entitlements(v_user)->'features'->>'design_studio')::boolean,false);
  v_profile:=public.get_public_store_channel_profile(p_slug,'market');
  if v_profile is null then return jsonb_build_object('ok',false,'code','STORE_NOT_PUBLIC'); end if;
  v_profile:=v_profile - 'serviceCards' - 'offerCards';
  if not v_contact then v_profile:=v_profile - 'phone' - 'whatsapp'; end if;
  v_profile:=v_profile||jsonb_build_object('quoteEnabled',v_quotes);
  v_catalog:=public.get_public_store_catalog(v_id,50);
  v_items:=case when v_catalog->>'ok'='true' and jsonb_typeof(v_catalog->'items')='array' then v_catalog->'items' else '[]'::jsonb end;
  -- The unified catalog may already contain a legacy product. Enrich that
  -- exact published product before deduplication, so its studio model is not lost.
  select coalesce(jsonb_agg(
    (case when item->>'price_mode'='quote_required' then item - 'price' - 'price_from' - 'price_to' else item end - 'studio_model')
    || case when legacy.sku is not null then jsonb_strip_nulls(jsonb_build_object(
      'studio_model',case when legacy.specifications->>'studio_model' in ('wooden-kitchen','wooden-wardrobe','wooden-door') then legacy.specifications->>'studio_model' else null end,
      'details',(case when jsonb_typeof(item->'details')='object' then item->'details' else '{}'::jsonb end)||jsonb_strip_nulls(jsonb_build_object('sku',legacy.sku,'price_unit_ar',legacy.specifications->>'price_unit_ar','price_unit_en',legacy.specifications->>'price_unit_en'))
    )) else '{}'::jsonb end order by ord),'[]'::jsonb) into v_items
  from jsonb_array_elements(v_items) with ordinality x(item,ord)
  left join lateral (
    select p.sku,p.specifications from public.provider_products p
    where item->>'entity_type'='product' and p.provider_id=v_id and p.is_published
      and (p.sku=coalesce(item->'details'->>'sku',item->>'route_key','') or p.id::text=coalesce(item->>'entity_id',''))
    limit 1
  ) legacy on true;
  -- Legacy products remain subject to their original publication and eligibility checks.
  select coalesce(jsonb_agg(jsonb_build_object(
    'entity_type','product','entity_id',p.id,'route_key',p.sku,
    'title_ar',p.name_ar,'title_en',p.name_en,'description_ar',p.description_ar,'description_en',p.description_en,
    'image_url',p.image_url,'price',case when p.price_visibility in ('public','starting_from') then p.price else null end,'currency',p.currency,
    'price_mode',case p.price_visibility when 'starting_from' then 'from' when 'public' then 'fixed' else 'quote_required' end,
    'studio_model',case when p.specifications->>'studio_model' in ('wooden-kitchen','wooden-wardrobe','wooden-door') then p.specifications->>'studio_model' else null end,
    'details',jsonb_build_object('sku',p.sku,'price_unit_ar',p.specifications->>'price_unit_ar','price_unit_en',p.specifications->>'price_unit_en')
  ) order by p.display_order,p.created_at),'[]'::jsonb) into v_legacy
  from public.provider_products p
  cross join lateral (select public.get_public_marketplace_product(p.sku) as data) checked
  where p.provider_id=v_id and p.is_published and checked.data->>'ok'='true'
    and not exists(select 1 from jsonb_array_elements(v_items) existing
      where coalesce(existing->'details'->>'sku',existing->>'route_key','')=p.sku);
  return jsonb_build_object('ok',true,'profile',v_profile,'items',v_items||v_legacy,'studio_allowed',v_studio);
end; $fn$;
revoke all on function public.get_public_market_store_page(text) from public;
grant execute on function public.get_public_market_store_page(text) to anon,authenticated;

create or replace function public.get_public_market_product_page(p_key text)
returns jsonb language plpgsql stable security definer set search_path = '' as $fn$
declare v_data jsonb; v_store jsonb; v_slug text; v_matching_slugs integer;
begin
  if p_key is null or btrim(p_key) !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$' then
    return jsonb_build_object('ok',false,'code','PRODUCT_NOT_PUBLIC');
  end if;
  if not exists(select 1 from public.provider_products p where p.sku=btrim(p_key) or p.id::text=btrim(p_key)) then
    select count(*) into v_matching_slugs from public.provider_products p where p.slug=btrim(p_key) and p.is_published;
    if v_matching_slugs>1 then return jsonb_build_object('ok',false,'code','PRODUCT_NOT_PUBLIC'); end if;
  end if;
  v_data:=public.get_public_marketplace_product(p_key);
  if v_data->>'ok' is distinct from 'true' then return jsonb_build_object('ok',false,'code','PRODUCT_NOT_PUBLIC'); end if;
  v_slug:=v_data->'provider'->>'slug';
  v_store:=public.get_public_market_store_page(v_slug);
  if v_store->>'ok' is distinct from 'true' then return jsonb_build_object('ok',false,'code','PRODUCT_NOT_PUBLIC'); end if;
  if v_data->'product'->>'price_mode'='quote_required' then
    v_data:=jsonb_set(v_data,'{product}',(v_data->'product') - 'price' - 'price_from' - 'price_to');
  end if;
  return v_data || jsonb_build_object('store_profile',v_store->'profile');
end; $fn$;
revoke all on function public.get_public_market_product_page(text) from public;
grant execute on function public.get_public_market_product_page(text) to anon,authenticated;

-- Read live, eligible product records; never synthesize or expose draft listings.
create or replace function public.get_public_market_product_feed(p_query text default '')
returns jsonb language plpgsql stable security definer set search_path = '' as $fn$
declare v_store record; v_page jsonb; v_item jsonb; v_out jsonb:='[]'::jsonb; v_query text:=lower(left(coalesce(btrim(p_query),''),100));
begin
  for v_store in select slug from public.provider_public_profiles where publication_status='published' and app_publication_status='published' and verification_status='verified' order by slug limit 250 loop
    v_page:=public.get_public_market_store_page(v_store.slug);
    if v_page->>'ok' is distinct from 'true' then continue; end if;
    for v_item in select value from jsonb_array_elements(v_page->'items') loop
      if v_item->>'entity_type'<>'product' or coalesce(v_item->>'route_key','')='' then continue; end if;
      if v_query<>'' and position(v_query in lower(coalesce(v_item->>'title_ar','')||' '||coalesce(v_item->>'title_en','')||' '||coalesce(v_page->'profile'->>'nameAr','')||' '||coalesce(v_page->'profile'->>'nameEn','')))=0 then continue; end if;
      if public.get_public_market_product_page(v_item->>'route_key')->>'ok' is distinct from 'true' then continue; end if;
      v_out:=v_out||jsonb_build_array(v_item||jsonb_build_object('store_slug',v_store.slug,'store_name_ar',v_page->'profile'->>'nameAr','store_name_en',v_page->'profile'->>'nameEn'));
      if jsonb_array_length(v_out)>=60 then return jsonb_build_object('ok',true,'items',v_out); end if;
    end loop;
  end loop;
  return jsonb_build_object('ok',true,'items',v_out);
end; $fn$;
revoke all on function public.get_public_market_product_feed(text) from public;
grant execute on function public.get_public_market_product_feed(text) to anon,authenticated;

-- Supply indexable merchant URLs from current approved data, without a site rebuild.
create or replace function public.get_public_market_sitemap()
returns jsonb language plpgsql stable security definer set search_path = '' as $fn$
declare v_store record; v_page jsonb; v_item jsonb; v_product jsonb; v_key text; v_path text; v_seen text[]:=array[]::text[]; v_pages jsonb:='[]'::jsonb;
begin
  for v_store in select slug from public.provider_public_profiles where publication_status='published' and app_publication_status='published' and verification_status='verified' order by slug loop
    v_page:=public.get_public_market_store_page(v_store.slug);
    if v_page->>'ok' is distinct from 'true' then continue; end if;
    v_path:='/stores/'||v_store.slug;
    v_pages:=v_pages||jsonb_build_array(jsonb_strip_nulls(jsonb_build_object('path',v_path,'image',nullif(v_page->'profile'->>'cover',''),'updated_at',nullif(v_page->'profile'->>'updatedAt',''))));
    for v_item in select value from jsonb_array_elements(v_page->'items') loop
      if v_item->>'entity_type'<>'product' then continue; end if;
      v_key:=v_item->>'route_key';if v_key is null then continue; end if;
      v_product:=public.get_public_marketplace_product(v_key);
      if v_product->>'ok' is distinct from 'true' or v_product->'provider'->>'slug'<>v_store.slug then continue; end if;
      v_key:=v_product->'product'->>'route_key';
      if v_key is null or v_key !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$' or v_key=any(v_seen) then continue; end if;
      v_seen:=array_append(v_seen,v_key);
      v_pages:=v_pages||jsonb_build_array(jsonb_strip_nulls(jsonb_build_object('path','/product/'||v_key,'image',nullif(v_product->'product'->>'image_url',''),'images',case when jsonb_typeof(v_product->'product'->'gallery')='array' then v_product->'product'->'gallery' else '[]'::jsonb end,'updated_at',nullif(v_product->'product'->>'updated_at',''))));
      if jsonb_array_length(v_pages)>=12000 then return jsonb_build_object('ok',true,'pages',v_pages); end if;
    end loop;
    if jsonb_array_length(v_pages)>=12000 then return jsonb_build_object('ok',true,'pages',v_pages); end if;
  end loop;
  return jsonb_build_object('ok',true,'pages',v_pages);
end; $fn$;
revoke all on function public.get_public_market_sitemap() from public;
grant execute on function public.get_public_market_sitemap() to anon,authenticated;
