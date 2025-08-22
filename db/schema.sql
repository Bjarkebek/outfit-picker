-- =========================================================
-- Supabase/Postgres: fuldt schema til Outfit Picker
-- =========================================================

-- UUID generator (krævet til gen_random_uuid)
create extension if not exists "pgcrypto";

-- =======================
-- CORE: Item + undertabeller
-- =======================
create table if not exists Item (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('top','bottom','jacket','shoes','hairclip','jewelry')),
  description text,
  brand text,
  tone text check (tone in ('light','medium','dark')),
  colour text,
  statement_piece boolean not null default false,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Top (1:1 til Item)
create table if not exists Top (
  item_id uuid primary key references Item(id) on delete cascade,
  type text not null check (type in ('tshirt','blouse','shirt','tanktop','sweater','hoodie','cardigan','vest','dress')),
  sleeve_length text
);

-- Bottom (1:1 til Item)
create table if not exists Bottom (
  item_id uuid primary key references Item(id) on delete cascade,
  type text not null check (type in ('pants','jeans','shorts','skirt','leggings'))
);

-- Shoe (1:1 til Item)
create table if not exists Shoe (
  item_id uuid primary key references Item(id) on delete cascade,
  type text not null check (type in ('sneakers','sandals','boots','heels','flats','slippers','loafers')),
  heel boolean
);

-- Jacket (1:1 til Item)
create table if not exists Jacket (
  item_id uuid primary key references Item(id) on delete cascade,
  type text not null check (type in (
    'blazer','denim_jacket','leather_jacket','bomber','puffer',
    'parka','trench_coat','raincoat','windbreaker','overcoat','wool_coat'
  ))
);

-- Jewelry (1:1 til Item)
create table if not exists Jewelry (
  item_id uuid primary key references Item(id) on delete cascade,
  type text not null check (type in ('necklace','earrings','bracelet','ring','watch','anklet'))
);

-- =======================
-- TAGS (M:N)
-- =======================
create table if not exists Tag (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists Item_Tag (
  item_id uuid references Item(id) on delete cascade,
  tag_id uuid references Tag(id) on delete cascade,
  primary key (item_id, tag_id)
);

-- =======================
-- OUTFITS + ITEMS + HISTORIK
-- =======================
create table if not exists Outfit (
  id uuid primary key default gen_random_uuid(),
  description text,
  type text not null check (type in ('casual','work','formal','date','party')),
  season text not null check (season in ('spring','summer','autumn','winter','all')),
  created_at timestamptz not null default now()
);

create table if not exists OutfitItem (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references Outfit(id) on delete cascade,
  item_id   uuid not null references Item(id) on delete cascade,
  role text not null check (role in ('top','layer','jacket','dress','bottom','shoes','hairclip','jewelry')),
  position int not null default 1
);

-- Undgå samme item to gange i samme outfit
create unique index if not exists uniq_outfit_item on OutfitItem(outfit_id, item_id);

-- Historik: hver gang et outfit bruges
create table if not exists OutfitWorn (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references Outfit(id) on delete cascade,
  worn_at timestamptz not null default now(),
  notes text,
  rating int check (rating between 1 and 5)
);

-- =======================
-- Hjælpe-indekser
-- =======================
create index if not exists ix_item_category on Item(category);
create index if not exists ix_item_colour_tone on Item(colour, tone);
create index if not exists ix_outfitworn_outfit_time on OutfitWorn(outfit_id, worn_at desc);
