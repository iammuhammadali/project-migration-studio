CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cnic text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, cnic)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'cnic', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.application_types (
  code text PRIMARY KEY,
  label text NOT NULL,
  fee integer NOT NULL DEFAULT 0,
  sort integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.application_types TO anon, authenticated;
GRANT ALL ON public.application_types TO service_role;
ALTER TABLE public.application_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read application types" ON public.application_types FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  application_type text NOT NULL REFERENCES public.application_types(code),
  cnic text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  current_step integer NOT NULL DEFAULT 2,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  additional jsonb NOT NULL DEFAULT '{}'::jsonb,
  personal jsonb NOT NULL DEFAULT '{}'::jsonb,
  electoral jsonb NOT NULL DEFAULT '{}'::jsonb,
  fee_amount integer,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own applications select" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own applications insert" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own applications update" ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own applications delete" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX applications_user_idx ON public.applications(user_id, created_at DESC);
CREATE INDEX applications_cnic_idx ON public.applications(cnic, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER applications_touch BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.application_documents TO authenticated;
GRANT ALL ON public.application_documents TO service_role;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own docs select" ON public.application_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own docs insert" ON public.application_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND a.user_id = auth.uid()));
CREATE POLICY "Own docs delete" ON public.application_documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.issued_domiciles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cnic text NOT NULL UNIQUE,
  full_name text NOT NULL,
  surname text NOT NULL,
  tehsil text NOT NULL,
  district text NOT NULL,
  date_of_birth date NOT NULL,
  issue_date date NOT NULL,
  status text NOT NULL DEFAULT 'Issued',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.issued_domiciles TO service_role;
ALTER TABLE public.issued_domiciles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.verify_domicile(p_cnic text)
RETURNS TABLE (full_name text, surname text, tehsil text, district text, date_of_birth date, issue_date date, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT d.full_name, d.surname, d.tehsil, d.district, d.date_of_birth, d.issue_date, d.status
  FROM public.issued_domiciles d
  WHERE length(p_cnic) = 13 AND p_cnic !~ '[^0-9]' AND d.cnic = p_cnic
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.verify_domicile(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_domicile(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.track_application(p_cnic text)
RETURNS TABLE (application_type text, stage text, created_at timestamptz, submitted_at timestamptz, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT a.application_type,
    CASE
      WHEN a.status = 'draft' THEN 'data_entry'
      WHEN a.status = 'submitted' AND NOT EXISTS (
        SELECT 1 FROM public.application_documents d WHERE d.application_id = a.id
      ) THEN 'document_submission'
      ELSE a.status
    END AS stage,
    a.created_at, a.submitted_at, a.updated_at
  FROM public.applications a
  WHERE length(p_cnic) = 13 AND p_cnic !~ '[^0-9]' AND a.cnic = p_cnic AND a.user_id = auth.uid()
  ORDER BY a.created_at DESC
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.track_application(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_application(text) TO authenticated, service_role;

CREATE TABLE public.legacy_user_mappings (
  legacy_user_id uuid PRIMARY KEY,
  auth_user_id uuid NOT NULL UNIQUE,
  imported_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.legacy_user_mappings TO service_role;
ALTER TABLE public.legacy_user_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants read own files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'applicant-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Applicants upload own files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'applicant-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Applicants delete own files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'applicant-documents' AND (storage.foldername(name))[1] = auth.uid()::text);