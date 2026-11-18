import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Globe2, Home, MapPin, MapPinned } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, inputClass, SectionCard } from "@/components/portal/Field";
import { SelectField } from "@/components/portal/SelectField";
import { FormFooter } from "@/components/portal/FormFooter";
import { applicationQuery } from "@/lib/applications";
import { DOMICILE_AREAS } from "@/lib/options";
import { additionalSchema, fieldErrors, type AdditionalValues, type Errors } from "@/lib/validation";
import { asRecord, useStepSave } from "@/lib/useStepSave";
import { cn } from "@/lib/utils";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/_authenticated/application/$id/additional")({
  head: () => portalHead("Step 4: Address Details — Sindh Domicile & PRC Portal", "Enter the applicant domicile area and home addresses."),
  component: AdditionalStep,
});

const areaClass = (e?: string) => cn(inputClass(e), "h-auto min-h-24 py-3");

function AdditionalStep() {
  const { id } = Route.useParams();
  const { data: app } = useSuspenseQuery(applicationQuery(id));
  const saved = asRecord<AdditionalValues>(app.additional);
  const [v, setV] = useState<AdditionalValues>({
    domicileArea: saved.domicileArea ?? "",
    permanentAddress: saved.permanentAddress ?? "",
    temporaryAddress: saved.temporaryAddress ?? "",
    outsideAddress: saved.outsideAddress === "NIL" ? "" : (saved.outsideAddress ?? ""),
  });
  const [errors, setErrors] = useState<Errors<keyof AdditionalValues>>({});
  const { save, saving } = useStepSave(app);
  const set = (k: keyof AdditionalValues) => (val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = additionalSchema.safeParse(v);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    save({ additional: parsed.data }, 5);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
      <SectionCard title="Address details" icon={MapPinned}>
        <Field id="domicileArea" label="Domicile Area" icon={MapPin} error={errors.domicileArea}>
          <SelectField id="domicileArea" value={v.domicileArea} onChange={set("domicileArea")} options={DOMICILE_AREAS} placeholder="Rural or Urban" error={errors.domicileArea} />
        </Field>
        <Field id="permanentAddress" label="Permanent Address" icon={Home} error={errors.permanentAddress}>
          <Textarea id="permanentAddress" value={v.permanentAddress} onChange={(e) => set("permanentAddress")(e.target.value)} className={areaClass(errors.permanentAddress)} />
        </Field>
        <Field id="temporaryAddress" label="Temporary Address" icon={Home} error={errors.temporaryAddress}>
          <Textarea id="temporaryAddress" value={v.temporaryAddress} onChange={(e) => set("temporaryAddress")(e.target.value)} className={areaClass(errors.temporaryAddress)} />
        </Field>
        <Field id="outsideAddress" label="Outside Pakistan Address" icon={Globe2} hint='Leave empty if not applicable — it will be saved as "NIL".'>
          <Input id="outsideAddress" placeholder="NIL" value={v.outsideAddress} onChange={(e) => set("outsideAddress")(e.target.value)} className={inputClass()} />
        </Field>
      </SectionCard>
      <FormFooter saving={saving} />
    </form>
  );
}
