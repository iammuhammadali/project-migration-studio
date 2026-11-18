import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Banknote, CalendarDays, Receipt, User, UserRound, Users, BookHeart, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field, inputClass, SectionCard } from "@/components/portal/Field";
import { SelectField } from "@/components/portal/SelectField";
import { DateField } from "@/components/portal/DateField";
import { FormFooter } from "@/components/portal/FormFooter";
import { applicationQuery } from "@/lib/applications";
import { RELATIONS, RELIGIONS } from "@/lib/options";
import { detailsSchema, fieldErrors, type DetailsValues, type Errors } from "@/lib/validation";
import { asRecord, useStepSave } from "@/lib/useStepSave";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/_authenticated/application/$id/details")({
  head: () => portalHead("Step 2: Applicant Details — Sindh Domicile & PRC Portal", "Enter the applicant details and bank challan information."),
  component: DetailsStep,
});

function DetailsStep() {
  const { id } = Route.useParams();
  const { data: app } = useSuspenseQuery(applicationQuery(id));
  const saved = asRecord<DetailsValues>(app.details);
  const [v, setV] = useState<DetailsValues>({
    fullName: saved.fullName ?? "",
    surname: saved.surname ?? "",
    relation: saved.relation ?? "",
    fatherName: saved.fatherName ?? "",
    dob: saved.dob ?? "",
    religion: saved.religion ?? "",
    challanDate: saved.challanDate ?? format(new Date(), "yyyy-MM-dd"),
    challanNumber: saved.challanNumber ?? "",
  });
  const [errors, setErrors] = useState<Errors<keyof DetailsValues>>({});
  const { save, saving } = useStepSave(app);
  const set = (k: keyof DetailsValues) => (val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = detailsSchema().safeParse(v);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    save({ details: parsed.data }, 3);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
      <SectionCard title="Applicant details" icon={UserRound}>
        <Field id="fullName" label="Full Name" icon={User} error={errors.fullName}>
          <Input id="fullName" value={v.fullName} onChange={(e) => set("fullName")(e.target.value)} className={inputClass(errors.fullName)} autoComplete="name" />
        </Field>
        <Field id="surname" label="Surname / Caste" icon={Users} error={errors.surname}>
          <Input id="surname" placeholder="e.g. Memon, Syed, Abbasi" value={v.surname} onChange={(e) => set("surname")(e.target.value)} className={inputClass(errors.surname)} />
        </Field>
        <Field id="relation" label="Relation" icon={Link2} error={errors.relation}>
          <SelectField id="relation" value={v.relation} onChange={set("relation")} options={RELATIONS} placeholder="S/o, D/o or W/o" error={errors.relation} />
        </Field>
        <Field id="fatherName" label="Father / Spouse Name" icon={User} error={errors.fatherName}>
          <Input id="fatherName" value={v.fatherName} onChange={(e) => set("fatherName")(e.target.value)} className={inputClass(errors.fatherName)} />
        </Field>
        <Field id="dob" label="Date of Birth" icon={CalendarDays} error={errors.dob}>
          <DateField id="dob" value={v.dob} onChange={set("dob")} error={errors.dob} placeholder="Select date of birth" />
        </Field>
        <Field id="religion" label="Religion" icon={BookHeart} error={errors.religion}>
          <SelectField id="religion" value={v.religion} onChange={set("religion")} options={RELIGIONS} placeholder="Select religion" error={errors.religion} />
        </Field>
      </SectionCard>

      <SectionCard title="Bank challan" icon={Banknote}>
        <Field id="challanDate" label="Bank Challan Date" icon={CalendarDays} error={errors.challanDate}>
          <DateField id="challanDate" value={v.challanDate} onChange={set("challanDate")} error={errors.challanDate} fromYear={2015} />
        </Field>
        <Field id="challanNumber" label="Bank Challan Number" icon={Receipt} error={errors.challanNumber}>
          <Input id="challanNumber" inputMode="numeric" value={v.challanNumber} onChange={(e) => set("challanNumber")(e.target.value)} className={inputClass(errors.challanNumber) + " font-mono"} />
        </Field>
      </SectionCard>
      <FormFooter saving={saving} />
    </form>
  );
}
