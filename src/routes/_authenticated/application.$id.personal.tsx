import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Baby, Briefcase, Building2, CalendarDays, GraduationCap, Heart, Landmark, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field, inputClass, SectionCard } from "@/components/portal/Field";
import { SelectField } from "@/components/portal/SelectField";
import { DateField } from "@/components/portal/DateField";
import { FormFooter } from "@/components/portal/FormFooter";
import { applicationQuery } from "@/lib/applications";
import { EDUCATION, MARITAL_STATUSES, OCCUPATIONS, TEHSILS } from "@/lib/options";
import { fieldErrors, personalSchema, type PersonalValues, type Errors } from "@/lib/validation";
import { asRecord, useStepSave } from "@/lib/useStepSave";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/_authenticated/application/$id/personal")({
  head: () => portalHead("Step 5: Personal Details — Sindh Domicile & PRC Portal", "Enter the applicant tehsil, education, occupation, and personal information."),
  component: PersonalStep,
});

function PersonalStep() {
  const { id } = Route.useParams();
  const { data: app } = useSuspenseQuery(applicationQuery(id));
  const saved = asRecord<PersonalValues>(app.personal);
  const [v, setV] = useState<PersonalValues>({
    tehsil: saved.tehsil ?? "",
    unionCouncil: saved.unionCouncil ?? "",
    occupation: saved.occupation ?? "",
    fatherOccupation: saved.fatherOccupation ?? "",
    education: saved.education ?? "",
    placeOfBirth: saved.placeOfBirth ?? "",
    arrivalDate: saved.arrivalDate ?? "",
    maritalStatus: saved.maritalStatus ?? "",
  });
  const [errors, setErrors] = useState<Errors<keyof PersonalValues>>({});
  const { save, saving } = useStepSave(app);
  const set = (k: keyof PersonalValues) => (val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = personalSchema(app.application_type).safeParse(v);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    save({ personal: parsed.data }, 6);
  };

  const ucs = v.tehsil ? (TEHSILS[v.tehsil] ?? []) : [];

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
      <SectionCard title="Profile" icon={UserCog}>
        <Field id="tehsil" label="Tehsil" icon={Landmark} error={errors.tehsil}>
          <SelectField
            id="tehsil"
            value={v.tehsil}
            onChange={(t) => setV((p) => ({ ...p, tehsil: t, unionCouncil: "" }))}
            options={Object.keys(TEHSILS)}
            placeholder="Select tehsil"
            error={errors.tehsil}
          />
        </Field>
        <Field id="unionCouncil" label="Union Council (UC)" icon={Building2} error={errors.unionCouncil}>
          <SelectField
            id="unionCouncil"
            value={v.unionCouncil}
            onChange={set("unionCouncil")}
            options={ucs}
            disabled={!v.tehsil}
            placeholder={v.tehsil ? "Select union council" : "Select tehsil first"}
            error={errors.unionCouncil}
          />
        </Field>
        <Field id="occupation" label="Applicant Occupation" icon={Briefcase} error={errors.occupation}>
          <SelectField id="occupation" value={v.occupation} onChange={set("occupation")} options={OCCUPATIONS} placeholder="Select occupation" error={errors.occupation} />
        </Field>
        <Field id="fatherOccupation" label="Father's Occupation" icon={Briefcase} error={errors.fatherOccupation}>
          <Input id="fatherOccupation" value={v.fatherOccupation} onChange={(e) => set("fatherOccupation")(e.target.value)} className={inputClass(errors.fatherOccupation)} />
        </Field>
        <Field id="education" label="Education" icon={GraduationCap} error={errors.education}>
          <SelectField id="education" value={v.education} onChange={set("education")} options={EDUCATION} placeholder="Select education" error={errors.education} />
        </Field>
        <Field id="placeOfBirth" label="Place of Birth" icon={Baby} error={errors.placeOfBirth}>
          <Input id="placeOfBirth" value={v.placeOfBirth} onChange={(e) => set("placeOfBirth")(e.target.value)} className={inputClass(errors.placeOfBirth)} />
        </Field>
        <Field id="arrivalDate" label="Date of Arrival in Domicile" icon={CalendarDays} error={errors.arrivalDate}>
          <DateField id="arrivalDate" value={v.arrivalDate} onChange={set("arrivalDate")} error={errors.arrivalDate} />
        </Field>
        <Field id="maritalStatus" label="Relationship / Marital Status" icon={Heart} error={errors.maritalStatus}>
          <SelectField id="maritalStatus" value={v.maritalStatus} onChange={set("maritalStatus")} options={MARITAL_STATUSES} placeholder="Select status" error={errors.maritalStatus} />
        </Field>
      </SectionCard>
      <FormFooter saving={saving} />
    </form>
  );
}
