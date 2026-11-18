CREATE OR REPLACE FUNCTION public.verify_domicile_status(p_cnic text)
RETURNS TABLE (matches boolean, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT true, d.status
  FROM public.issued_domiciles d
  WHERE length(p_cnic) = 13 AND p_cnic !~ '[^0-9]' AND d.cnic = p_cnic
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.verify_domicile_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_domicile_status(text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.verify_domicile(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_domicile(text) TO service_role;
REVOKE ALL ON FUNCTION public.track_application(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.track_application(text) TO authenticated, service_role;