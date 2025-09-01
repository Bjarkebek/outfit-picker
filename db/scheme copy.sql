-- ========== 1) Tilføj manglende kolonner i under-tabeller ==========
ALTER TABLE public.top
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS sleevelength text CHECK (sleevelength IN ('short','long'));

ALTER TABLE public.bottom
  ADD COLUMN IF NOT EXISTS type text;

ALTER TABLE public.jacket
  ADD COLUMN IF NOT EXISTS type text;

ALTER TABLE public.shoe
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS heel boolean;

ALTER TABLE public.jewelry
  ADD COLUMN IF NOT EXISTS type text;

-- ========== 2) Backfill fra item.* hvis de fandtes tidligere ==========
DO $$
BEGIN
  -- Kopiér type fra item → top/bottom/jacket/shoe/jewelry ud fra kategori
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='item' AND column_name='type') THEN
    UPDATE public.top     t SET type = i.type FROM public.item i WHERE t.item_id = i.id AND i.category = 'top'     AND t.type IS NULL;
    UPDATE public.bottom  b SET type = i.type FROM public.item i WHERE b.item_id = i.id AND i.category = 'bottom'  AND b.type IS NULL;
    UPDATE public.jacket  j SET type = i.type FROM public.item i WHERE j.item_id = i.id AND i.category = 'jacket'  AND j.type IS NULL;
    UPDATE public.shoe    s SET type = i.type FROM public.item i WHERE s.item_id = i.id AND i.category = 'shoes'   AND s.type IS NULL;
    UPDATE public.jewelry y SET type = i.type FROM public.item i WHERE y.item_id = i.id AND i.category = 'jewelry' AND y.type IS NULL;
  END IF;

  -- Kopiér sleevelength fra item → top.sleevelength
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='item' AND column_name='sleevelength') THEN
    UPDATE public.top t SET sleevelength = i.sleevelength
    FROM public.item i
    WHERE t.item_id = i.id AND i.category = 'top' AND t.sleevelength IS NULL;
  END IF;

  -- Kopiér heel fra item → shoe.heel
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='item' AND column_name='heel') THEN
    UPDATE public.shoe s SET heel = i.heel
    FROM public.item i
    WHERE s.item_id = i.id AND i.category = 'shoes' AND s.heel IS NULL;
  END IF;
END $$;

-- ========== 3) (Valgfri) Constraints på type (hvis du vil låse værdier) ==========
-- Eksempel: lås top.type til din liste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'top_type_check_values'
  ) THEN
    ALTER TABLE public.top
      ADD CONSTRAINT top_type_check_values
      CHECK (type IS NULL OR type IN ('t-shirt','shirt','blouse','cardigan','sweater','hoodie','dress','vest'));
  END IF;
END $$;

-- (Du kan tilføje tilsvarende CHECKs til de andre tabeller, hvis du vil have faste værdier.)

-- ========== 4) Fjern kolonner fra item (nu hvor de er flyttet) ==========
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='item' AND column_name='type') THEN
    ALTER TABLE public.item DROP COLUMN type;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='item' AND column_name='sleevelength') THEN
    ALTER TABLE public.item DROP COLUMN sleevelength;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='item' AND column_name='heel') THEN
    ALTER TABLE public.item DROP COLUMN heel;
  END IF;
END $$;

-- Bemærk: 'shade', 'statement_piece', 'season' osv. bliver i item (de er generelle egenskaber).
