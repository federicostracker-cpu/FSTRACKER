-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: new_hires
-- ============================================================
CREATE TABLE IF NOT EXISTS public.new_hires (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  dni         TEXT NOT NULL,
  entry_date  DATE NOT NULL,
  position    TEXT NOT NULL,
  site        TEXT NOT NULL CHECK (site IN ('Olivos', 'Parque Patricios')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE: feedback_entries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedback_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_hire_id     UUID NOT NULL REFERENCES public.new_hires(id) ON DELETE CASCADE,
  area            TEXT NOT NULL CHECK (area IN ('rrhh', 'operaciones', 'calidad', 'capacitacion')),
  submitted_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at    TIMESTAMPTZ,
  score_overall   INTEGER CHECK (score_overall BETWEEN 1 AND 5),
  feedback_fields JSONB,
  observations    TEXT,
  status          TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'completado')),
  UNIQUE (new_hire_id, area)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_feedback_entries_hire_id ON public.feedback_entries(new_hire_id);
CREATE INDEX IF NOT EXISTS idx_feedback_entries_area    ON public.feedback_entries(area);
CREATE INDEX IF NOT EXISTS idx_feedback_entries_status  ON public.feedback_entries(status);
CREATE INDEX IF NOT EXISTS idx_new_hires_entry_date     ON public.new_hires(entry_date DESC);

-- ============================================================
-- TRIGGER: auto-create pending feedback entries on new hire
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_feedback_entries_for_new_hire()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.feedback_entries (new_hire_id, area, status)
  VALUES
    (NEW.id, 'rrhh',          'pendiente'),
    (NEW.id, 'operaciones',   'pendiente'),
    (NEW.id, 'calidad',       'pendiente'),
    (NEW.id, 'capacitacion',  'pendiente');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_hire_created ON public.new_hires;
CREATE TRIGGER on_new_hire_created
  AFTER INSERT ON public.new_hires
  FOR EACH ROW
  EXECUTE FUNCTION public.create_feedback_entries_for_new_hire();

-- ============================================================
-- Enable Row Level Security
-- ============================================================
ALTER TABLE public.new_hires       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;
