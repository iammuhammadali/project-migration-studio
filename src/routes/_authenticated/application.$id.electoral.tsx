import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, Hash, House, Link2, Phone, Truck, Users, Vote, LandPlot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, inputClass, SectionCard } from "@/components/portal/Field";
import { SelectField } from "@/components/portal/SelectField";
import { DateField } from "@/components/portal/DateField";
import { FormFooter } from "@/components/portal/FormFooter";
import { applicationQuery } from "@/lib/applications";
import { BLOOD_RELATIONS } from "@/lib/options";
import { digitsOnly, electoralSchema, fieldErrors, type ElectoralValues, type Errors } from "@/lib/validation";
import { asRecord, useStepSave } from "@/lib/useStepSave";
import { cn } from "@/lib/utils";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/_authenticated/application/$id/electoral")({
  head: () => portalHead("Step 6: Electoral & Delivery — Sindh Domicile & PRC Portal", "Enter voter, family, contact, and delivery information."),
  component: ElectoralStep,
});

function ElectoralStep() {
  const { id } = Route.useParams();
  const { data: app } = useSuspenseQuery(applicationQuery(id));
  const s = asRecord<ElectoralValues>(app.electoral);
  const [v, setV] = useState<ElectoralValues>({
    electoralRoll: s.electoralRoll ?? "",
    bloodRelationNo: s.bloodRelationNo ?? "",
    bloodRelation: s.bloodRelation ?? "",
    bloodIssuanceDate: s.bloodIssuanceDate ?? "",
    propertyDetails: s.propertyDetails ?? "",
    phone: s.phone ?? "",
    homeDelivery: s.homeDelivery === "yes" ? "yes" : "no",
    deliveryAddress: s.deliveryAddress ?? "",
  });
  const [errors, setErrors] = useState<Errors<keyof ElectoralValues>>({});
  const { save, saving } = useStepSave(app);
  const set = (k: keyof ElectoralValues) => (val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = electoralSchema.safeParse(v);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    const data = { ...parsed.data, deliveryAddress: parsed.data.homeDelivery === "yes" ? parsed.data.deliveryAddress : "" };
    save({ electoral: data }, 7, "Electoral and contact details saved successfully");
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
      <SectionCard title="Electoral (Voter List) Information" icon={Vote}>
        <Field id="electoralRoll" label="Electoral Roll" icon={Hash} error={errors.electoralRoll}>
          <Input id="electoralRoll" placeholder="Voter block code / serial number" value={v.electoralRoll} onChange={(e) => set("electoralRoll")(e.target.value)} className={inputClass(errors.electoralRoll) + " font-mono"} />
        </Field>
      </SectionCard>

      <SectionCard title="Blood Relation Domicile (Family Reference)" icon={Users}>
        <Field id="bloodRelationNo" label="Blood Relation Domicile No" icon={Hash} error={errors.bloodRelationNo}>
          <Input id="bloodRelationNo" value={v.bloodRelationNo} onChange={(e) => set("bloodRelationNo")(e.target.value)} className={inputClass(errors.bloodRelationNo) + " font-mono"} />
        </Field>
        <Field id="bloodRelation" label="Relation" icon={Link2} error={errors.bloodRelation}>
          <SelectField id="bloodRelation" value={v.bloodRelation} onChange={set("bloodRelation")} options={BLOOD_RELATIONS} placeholder="Select relation" />
        </Field>
        <Field id="bloodIssuanceDate" label="Issuance Date" icon={CalendarDays} error={errors.bloodIssuanceDate}>
          <DateField id="bloodIssuanceDate" value={v.bloodIssuanceDate} onChange={set("bloodIssuanceDate")} />
        </Field>
      </SectionCard>

      <SectionCard title="Property Details" icon={LandPlot}>
        <Field id="propertyDetails" label="Land, plot or house information" icon={House} error={errors.propertyDetails}>
          <Textarea id="propertyDetails" value={v.propertyDetails} onChange={(e) => set("propertyDetails")(e.target.value)} className={cn(inputClass(errors.propertyDetails), "h-auto min-h-24 py-3")} />
        </Field>
      </SectionCard>

      <SectionCard title="Contact & Delivery" icon={Phone}>
        <Field id="phone" label="Phone Number" icon={Phone} error={errors.phone} hint={`${v.phone.length} / 11 digits`}>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="03XXXXXXXXX"
            maxLength={11}
            value={v.phone}
            onChange={(e) => set("phone")(digitsOnly(e.target.value, 11))}
            className={inputClass(errors.phone) + " font-mono"}
          />
        </Field>
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Truck className="size-4 text-primary" /> Home Delivery
          </p>
          <div role="radiogroup" aria-label="Home Delivery" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["yes", "no"] as const).map((opt) => (
              <Button
                key={opt}
                type="button"
                role="radio"
                aria-checked={v.homeDelivery === opt}
                onClick={() => setV((p) => ({ ...p, homeDelivery: opt }))}
                variant={v.homeDelivery === opt ? "secondary" : "ghost"}
                className="h-10 rounded-lg text-sm font-semibold"
              >
                {opt === "yes" ? "Yes" : "No"}
              </Button>
            ))}
          </div>
        </div>
        {v.homeDelivery === "yes" && (
          <Field id="deliveryAddress" label="Delivery Address" icon={House} error={errors.deliveryAddress}>
            <Textarea id="deliveryAddress" value={v.deliveryAddress} onChange={(e) => set("deliveryAddress")(e.target.value)} className={cn(inputClass(errors.deliveryAddress), "h-auto min-h-24 py-3 animate-rise")} />
          </Field>
        )}
      </SectionCard>
      <FormFooter saving={saving} />
    </form>
  );
}
