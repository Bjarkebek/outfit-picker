-- =========================================================
-- schema.sql — Outfit Picker (Postgres / Supabase)
-- =========================================================

-- UUID-generator til gen_random_uuid()
create extension if not exists "pgcrypto";

-- =========================================================
-- ITEM (core)
-- =========================================================
create table if not exists public.item (
  id              uuid primary key default gen_random_uuid(),
  category        text not null check (category in ('top','bottom','jacket','shoes','hairclip','jewelry')),
  description     text,
  brand           text,
  color           text,
  tone            text check (tone in ('light','medium','dark')),
  type            text, -- fx jeans/sneakers/…
  season          text check (season in ('spring','summer','autumn','winter','all-season')),
  statement_piece boolean not null default false,
  image_url       text,
  image_path      text, -- internt storage-path til sletning/erstatning
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Sikr evt. manglende kolonner (hvis tabel fandtes i forvejen)
alter table public.item add column if not exists brand           text;
alter table public.item add column if not exists color           text;
alter table public.item add column if not exists tone            text;
alter table public.item add column if not exists type            text;
alter table public.item add column if not exists season          text;
alter table public.item add column if not exists statement_piece boolean not null default false;
alter table public.item add column if not exists image_url       text;
alter table public.item add column if not exists image_path      text;
alter table public.item add column if not exists active          boolean not null default true;
alter table public.item add column if not exists created_at      timestamptz not null default now();

-- (Re)apply checks på eksisterende kolonner hvis nødvendigt (ignorer fejl hvis de findes)
do $$
begin
  begin
    alter table public.item add constraint item_category_chk
      check (category in ('top','bottom','jacket','shoes','hairclip','jewelry'));
  exception when duplicate_object then null; end;

  begin
    alter table public.item add constraint item_tone_chk
      check (tone in ('light','medium','dark'));
  exception when duplicate_object then null; end;

  begin
    alter table public.item add constraint item_season_chk
      check (season in ('spring','summer','autumn','winter','all-season'));
  exception when duplicate_object then null; end;
end $$;

-- =========================================================
-- UNDERTABELLER (1:1 til item) — valgfrie pr. kategori
-- =========================================================

create table if not exists public.top (
  item_id uuid primary key references public.item(id) on delete cascade,
  type    text not null check (type in ('tshirt','blouse','shirt','tanktop','sweater','hoodie','cardigan','vest','dress')),
  sleeve_length text
);

create table if not exists public.bottom (
  item_id uuid primary key references public.item(id) on delete cascade,
  type    text not null check (type in ('pants','jeans','shorts','skirt','leggings'))
);

create table if not exists public.shoe (
  item_id uuid primary key references public.item(id) on delete cascade,
  type    text not null check (type in ('sneakers','sandals','boots','heels','flats','slippers','loafers')),
  heel    boolean
);

create table if not exists public.jacket (
  item_id uuid primary key references public.item(id) on delete cascade,
  type    text not null check (type in (
    'blazer','denim_jacket','leather_jacket','bomber','puffer',
    'parka','trench_coat','raincoat','windbreaker','overcoat','wool_coat'
  ))
);

create table if not exists public.jewelry (
  item_id uuid primary key references public.item(id) on delete cascade,
  type    text not null check (type in ('necklace','earrings','bracelet','ring','watch','anklet'))
);

-- =========================================================
-- TAGS (M:N)
-- =========================================================
create table if not exists public.tag (
  id   uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists public.item_tag (
  item_id uuid not null references public.item(id) on delete cascade,
  tag_id  uuid not null references public.tag(id)  on delete cascade,
  primary key (item_id, tag_id)
);

-- =========================================================
-- OUTFITS + ITEMS + HISTORIK
-- =========================================================
create table if not exists public.outfit (
  id          uuid primary key default gen_random_uuid(),
  description text,
  type        text not null check (type in ('casual','work','formal','date','party')),
  season      text not null check (season in ('spring','summer','autumn','winter','all-season')),
  created_at  timestamptz not null default now()
);

create table if not exists public.outfititem (
  id        uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfit(id) on delete cascade,
  item_id   uuid not null references public.item(id)   on delete cascade,
  role      text not null check (role in ('top','layer','jacket','dress','bottom','shoes','hairclip','jewelry')),
  position  int not null default 1
);

-- Undgå samme item to gange i samme outfit
create unique index if not exists ux_outfititem_outfit_item on public.outfititem(outfit_id, item_id);

-- Hvornår et outfit er brugt
create table if not exists public.outfitworn (
  id        uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfit(id) on delete cascade,
  worn_at   timestamptz not null default now(),
  notes     text,
  rating    int check (rating between 1 and 5)
);

-- =========================================================
-- INDEKSER
-- =========================================================
create index if not exists ix_item_category          on public.item(category);
create index if not exists ix_item_colour_tone       on public.item(color, tone);
create index if not exists ix_outfitworn_outfit_time on public.outfitworn(outfit_id, worn_at desc);

-- =========================================================
-- (VALGFRIT) RLS-policies til single-user MVP
-- Slå RLS fra for enkelhed (aktiver senere med policies).
-- =========================================================
-- alter table public.item        disable row level security;
-- alter table public.top         disable row level security;
-- alter table public.bottom      disable row level security;
-- alter table public.shoe        disable row level security;
-- alter table public.jacket      disable row level security;
-- alter table public.jewelry     disable row level security;
-- alter table public.tag         disable row level security;
-- alter table public.item_tag    disable row level security;
-- alter table public.outfit      disable row level security;
-- alter table public.outfititem  disable row level security;
-- alter table public.outfitworn  disable row level security;

-- =========================================================
-- (VALGFRIT) Hjælp til rename fra tidligere CamelCase
-- Kør kun hvis du har tabeller med store bogstaver i forvejen.
-- =========================================================
-- alter table if exists public."Item"       rename to item;
-- alter table if exists public."Top"        rename to top;
-- alter table if exists public."Bottom"     rename to bottom;
-- alter table if exists public."Shoe"       rename to shoe;
-- alter table if exists public."Jacket"     rename to jacket;
-- alter table if exists public."Jewelry"    rename to jewelry;
-- alter table if exists public."Tag"        rename to tag;
-- alter table if exists public."Item_Tag"   rename to item_tag;
-- alter table if exists public."Outfit"     rename to outfit;
-- alter table if exists public."OutfitItem" rename to outfititem;
-- alter table if exists public."OutfitWorn" rename to outfitworn;


-- =========================================================
-- RLS
-- =========================================================

-- 1) Tilføj owner_id på centrale tabeller
ALTER TABLE public.item ADD COLUMN IF NOT EXISTS owner_id uuid DEFAULT auth.uid();
ALTER TABLE public.outfit ADD COLUMN IF NOT EXISTS owner_id uuid DEFAULT auth.uid();
ALTER TABLE public.outfititem ADD COLUMN IF NOT EXISTS owner_id uuid DEFAULT auth.uid();
ALTER TABLE public.tag ADD COLUMN IF NOT EXISTS owner_id uuid DEFAULT auth.uid();

-- 2) Slå RLS til
ALTER TABLE public.item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfititem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag ENABLE ROW LEVEL SECURITY;

-- 3) Policies for ITEM
CREATE POLICY "Users can view their own items"
ON public.item
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own items"
ON public.item
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own items"
ON public.item
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own items"
ON public.item
FOR DELETE
USING (owner_id = auth.uid());

-- 4) Policies for OUTFIT
CREATE POLICY "Users can view their own outfits"
ON public.outfit
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own outfits"
ON public.outfit
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own outfits"
ON public.outfit
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own outfits"
ON public.outfit
FOR DELETE
USING (owner_id = auth.uid());

-- 5) Policies for OUTFITITEM
CREATE POLICY "Users can view their own outfititems"
ON public.outfititem
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own outfititems"
ON public.outfititem
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own outfititems"
ON public.outfititem
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own outfititems"
ON public.outfititem
FOR DELETE
USING (owner_id = auth.uid());

-- 6) Policies for TAG
CREATE POLICY "Users can view their own tags"
ON public.tag
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own tags"
ON public.tag
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own tags"
ON public.tag
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own tags"
ON public.tag
FOR DELETE
USING (owner_id = auth.uid());
