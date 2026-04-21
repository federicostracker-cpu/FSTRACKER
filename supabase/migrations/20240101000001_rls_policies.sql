-- ============================================================
-- Helper function: get current user's role from metadata
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    (SELECT raw_user_meta_data ->> 'role' FROM auth.users WHERE id = auth.uid())
  );
$$;

-- ============================================================
-- POLICIES: new_hires
-- ============================================================

-- All authenticated users can view new hires (needed to show names in forms)
CREATE POLICY "authenticated_can_view_new_hires"
  ON public.new_hires
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admin can insert new hires
CREATE POLICY "admin_can_insert_new_hires"
  ON public.new_hires
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

-- Only admin can update new hires
CREATE POLICY "admin_can_update_new_hires"
  ON public.new_hires
  FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- Only admin can delete new hires
CREATE POLICY "admin_can_delete_new_hires"
  ON public.new_hires
  FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- POLICIES: feedback_entries
-- ============================================================

-- Admin can view all feedback entries
CREATE POLICY "admin_can_view_all_feedback"
  ON public.feedback_entries
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- Area users can view their own area's feedback entries
CREATE POLICY "area_users_can_view_own_area_feedback"
  ON public.feedback_entries
  FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() IN ('rrhh', 'operaciones', 'calidad', 'capacitacion')
    AND area = public.get_my_role()
  );

-- Area users can insert for their own area (upsert fallback)
CREATE POLICY "area_users_can_insert_own_area_feedback"
  ON public.feedback_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() IN ('rrhh', 'operaciones', 'calidad', 'capacitacion')
    AND area = public.get_my_role()
  );

-- Area users can update their own area's feedback entries
CREATE POLICY "area_users_can_update_own_area_feedback"
  ON public.feedback_entries
  FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() IN ('rrhh', 'operaciones', 'calidad', 'capacitacion')
    AND area = public.get_my_role()
  )
  WITH CHECK (
    public.get_my_role() IN ('rrhh', 'operaciones', 'calidad', 'capacitacion')
    AND area = public.get_my_role()
  );

-- Admin can update any feedback entry
CREATE POLICY "admin_can_update_all_feedback"
  ON public.feedback_entries
  FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');
