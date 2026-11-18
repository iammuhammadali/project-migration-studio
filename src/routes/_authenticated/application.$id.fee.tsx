import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Award, Receipt } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/portal/Field";
import { FormFooter } from "@/components/portal/FormFooter";
import { applicationQuery, formatCnic, typeLabel, updateApplication } from "@/lib/applications";
import { asRecord } from "@/lib/useStepSave";
import { portalHead } from "@/lib/page-metadata";
import { feeAmounts } from "@/lib/validation";

export const Route = createFileRoute("/_authenticated/application/$id/fee")({
  head: () => portalHead("Step 7: Fee & Certificate — Sindh Domicile & PRC Portal", "Review the certificate fee and submit your application."),
  component: FeeStep,
});

function FeeStep() {
  const { id } = Route.useParams();
  const { data: app } = useSuspenseQuery(applicationQuery(id));
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const details = asRecord<{ fullName: string; challanNumber: string; challanDate: string }>(app.details);
  const fee = feeAmounts[app.application_type as keyof typeof feeAmounts] ?? 0;

  const submit = async () => {
    setSaving(true);
    try {
      const row = await updateApplication(id, {
        status: "submitted",
        fee_amount: fee,
        submitted_at: new Date().toISOString(),
        current_step: 7,
      });
      await qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application submitted successfully");
      await navigate({ to: "/dashboard", search: { app: id }, replace: true });
      qc.setQueryData(["application", id], row);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit");
      setSaving(false);
    }
  };

  const rows: [string, string][] = [
    ["Applicant", details.fullName ?? "—"],
    ["Application Type", typeLabel(app.application_type)],
    ["CNIC", formatCnic(app.cnic)],
    ["Bank Challan No.", details.challanNumber ?? "—"],
    ["Bank Challan Date", details.challanDate ? format(parseISO(details.challanDate), "dd MMM yyyy") : "—"],
  ];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <section className="bg-brand-gradient animate-rise rounded-2xl p-5 text-primary-foreground shadow-brand">
        <p className="flex items-center gap-2 text-xs font-medium uppercase opacity-85">
          <Award className="size-4" /> Certificate Fee
        </p>
        <p className="mt-2 font-mono text-4xl font-semibold">Rs. {fee.toLocaleString("en-PK")}</p>
        <p className="mt-1 text-sm opacity-85">{typeLabel(app.application_type)} — Domicile & PRC</p>
      </section>

      <SectionCard title="Fee summary" icon={Receipt}>
        <dl className="divide-y">
          {rows.map(([k, val]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{val}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 pt-3 text-sm">
            <dt className="font-semibold">Total Payable</dt>
            <dd className="font-mono text-base font-semibold text-primary">Rs. {fee.toLocaleString("en-PK")}</dd>
          </div>
        </dl>
      </SectionCard>
      <div className="flex-1" />
      <FormFooter saving={saving} label="Submit Application" savingLabel="Submitting..." onClick={submit} />
    </div>
  );
}
