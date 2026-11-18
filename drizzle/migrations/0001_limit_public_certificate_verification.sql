CREATE OR REPLACE FUNCTION public.verify_domicile(p_cnic text)
RETURNS TABLE (
  full_name text,
  surname text,
  tehsil text,
  district text,
  date_of_birth date,
  issue_date date,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULL::text, NULL::text, NULL::text, NULL::text, NULL::date, NULL::date, d.status
  FROM public.issued_domiciles d
  WHERE length(p_cnic) = 13 AND p_cnic !~ '[^0-9]' AND d.cnic = p_cnic
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.verify_domicile(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_domicile(text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.track_application(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.track_application(text) TO authenticated, service_role;