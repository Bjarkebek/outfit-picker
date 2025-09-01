-- ============================================
-- OUTFIT: owner_id + RLS + policies
-- ============================================

-- 1) Kolonne til ejer (sættes automatisk til auth.uid() ved insert)
ALTER TABLE public.outfit
  ADD COLUMN IF NOT EXISTS owner_id uuid NOT NULL DEFAULT auth.uid();

-- (valgfrit) FK til auth.users (Supabase tillader FK til auth.users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'outfit_owner_id_fkey'
  ) THEN
    ALTER TABLE public.outfit
      ADD CONSTRAINT outfit_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2) Slå RLS til
ALTER TABLE public.outfit ENABLE ROW LEVEL SECURITY;

-- 3) Policies (idempotent oprettelse)
DO $$
BEGIN
  -- SELECT
  BEGIN
    CREATE POLICY outfit_select_own
      ON public.outfit
      FOR SELECT
      USING (owner_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- INSERT
  BEGIN
    CREATE POLICY outfit_insert_own
      ON public.outfit
      FOR INSERT
      WITH CHECK (owner_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- UPDATE
  BEGIN
    CREATE POLICY outfit_update_own
      ON public.outfit
      FOR UPDATE
      USING (owner_id = auth.uid())
      WITH CHECK (owner_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- DELETE
  BEGIN
    CREATE POLICY outfit_delete_own
      ON public.outfit
      FOR DELETE
      USING (owner_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ITEM
alter table public.item add column if not exists owner_id uuid not null default auth.uid();
create index if not exists ix_item_owner on public.item(owner_id);
alter table public.item enable row level security;

do $$
begin
  begin
    create policy item_select_own on public.item
      for select using (owner_id = auth.uid());
  exception when duplicate_object then null; end;

  begin
    create policy item_insert_own on public.item
      for insert with check (owner_id = auth.uid());
  exception when duplicate_object then null; end;

  begin
    create policy item_update_own on public.item
      for update using (owner_id = auth.uid())
      with check (owner_id = auth.uid());
  exception when duplicate_object then null; end;

  begin
    create policy item_delete_own on public.item
      for delete using (owner_id = auth.uid());
  exception when duplicate_object then null; end;
end $$;

-- ============================================
-- OUTFITITEM: RLS + policies bundet til outfit-ejer
-- (ingen owner_id-kolonne her; vi bruger join)
-- ============================================

ALTER TABLE public.outfititem ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- SELECT: må kun se items for outfits man ejer
  BEGIN
    CREATE POLICY outfititem_select_by_outfit_owner
      ON public.outfititem
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.outfit o
          WHERE o.id = outfititem.outfit_id
            AND o.owner_id = auth.uid()
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- INSERT: må kun indsætte rækker til outfits man ejer
  BEGIN
    CREATE POLICY outfititem_insert_by_outfit_owner
      ON public.outfititem
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.outfit o
          WHERE o.id = outfititem.outfit_id
            AND o.owner_id = auth.uid()
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- UPDATE: kun på rækker, hvor tilhørende outfit ejes af brugeren
  BEGIN
    CREATE POLICY outfititem_update_by_outfit_owner
      ON public.outfititem
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.outfit o
          WHERE o.id = outfititem.outfit_id
            AND o.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.outfit o
          WHERE o.id = outfititem.outfit_id
            AND o.owner_id = auth.uid()
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- DELETE: kun på rækker, hvor tilhørende outfit ejes af brugeren
  BEGIN
    CREATE POLICY outfititem_delete_by_outfit_owner
      ON public.outfititem
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.outfit o
          WHERE o.id = outfititem.outfit_id
            AND o.owner_id = auth.uid()
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ============================================
-- (Valgfrit) BACKFILL eksisterende outfits
-- ============================================
-- Hvis du allerede HAR outfits uden owner_id (kolonnen var NULL før),
-- så skal de have en ejer. Kør fx manuelt:
-- update public.outfit set owner_id = '<DIN-AUTH-UUID>' where owner_id is null;
