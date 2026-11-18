import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, IdCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MobileShell, TopBar } from "@/components/portal/MobileShell";
import { Field, inputClass, SectionCard } from "@/components/portal/Field";
import { SelectField } from "@/components/portal/SelectField";
import { Stepper } from "@/components/portal/Stepper";
import { FormFooter } from "@/components/portal/FormFooter";
import { supabase } from "@/integrations/supabase/client";
import { applicationTypesQuery, profileQuery } from "@/lib/applications";
import { CNIC_LENGTH, cnicSchema, digitsOnly, fieldErrors, type Errors } from "@/lib/validation";
import { toast } from "sonner";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/_authenticated/applicant-cnic")({
  head: () => portalHead("Step 1: Applicant CNIC — Sindh Domicile & PRC Portal", "Choose the application type and enter the applicant CNIC."),
  component: ApplicantCnic,
});

function ApplicantCnic() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: types, isLoading } = useQuery(applicationTypesQuery);
  const [applicationType, setType] = useState("");
  const [cnic, setCnic] = useState("");
  const [errors, setErrors] = useState<Errors<"applicationType" | "cnic">>({});
  const [saving, setSaving] = useState(false);
  const { data: profile } = useQuery(profileQuery);

  // Pre-fill with the CNIC the account was registered with; still editable.
  useEffect(() => {
    if (profile?.cnic) setCnic((cur) => cur || profile.cnic);
  }, [profile?.cnic]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = cnicSchema.safeParse({ applicationType, cnic });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setSaving(true);
    const { data, error } = await supabase
      .from("applications")
      .insert({ application_type: applicationType, cnic, current_step: 2 })
      .select()
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    qc.setQueryData(["application", data.id], data);
    qc.invalidateQueries({ queryKey: ["applications"] });
    navigate({ to: "/application/$id/details", params: { id: data.id } });
  };

  return (
    <MobileShell>
      <TopBar
        title="Applicant CNIC"
        subtitle="New domicile application"
        onBack={() => navigate({ to: "/dashboard", search: { app: undefined } })}
      />
      <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4 px-4 pt-4">
        <Stepper current={1} />
        <SectionCard title="Start your application" icon={FileText}>
          <Field id="type" label="Application Type" error={errors.applicationType}>
            <SelectField
              id="type"
              value={applicationType}
              onChange={setType}
              disabled={isLoading}
              placeholder={isLoading ? "Loading types..." : "Select application type"}
              options={(types ?? []).map((t) => ({ value: t.code, label: t.label }))}
              error={errors.applicationType}
            />
          </Field>
          <Field
            id="cnic"
            label="CNIC Number"
            icon={IdCard}
            error={errors.cnic}
            hint={`${cnic.length} / ${CNIC_LENGTH} digits entered`}
          >
            <Input
              id="cnic"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="13-digit CNIC without dashes"
              value={cnic}
              maxLength={CNIC_LENGTH}
              onKeyDown={(e) => {
                if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
              }}
              onChange={(e) => setCnic(digitsOnly(e.target.value, CNIC_LENGTH))}
              className={inputClass(errors.cnic) + " font-mono"}
            />
          </Field>
        </SectionCard>
        <div className="flex-1" />
        <FormFooter saving={saving} />
      </form>
    </MobileShell>
  );
}
