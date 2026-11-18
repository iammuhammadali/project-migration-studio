import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, CircleAlert, IdCard, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, inputClass } from "@/components/portal/Field";
import { MobileShell, TopBar } from "@/components/portal/MobileShell";
import { supabase } from "@/integrations/supabase/client";
import { CNIC_LENGTH, digitsOnly, fieldErrors, verifySchema } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/verify")({
  head: () => portalHead("Domicile Verification — Sindh Domicile & PRC Portal", "Check whether an issued Sindh domicile matches a CNIC without revealing personal details."),
  component: VerifyDomicile,
});

type Domicile = {
  matches: boolean;
  status: string;
};

function VerifyDomicile() {
  const navigate = useNavigate();
  const [cnic, setCnic] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Domicile | null | undefined>(undefined);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = verifySchema.safeParse({ cnic });
    if (!parsed.success) {
      setError(fieldErrors(parsed.error)["cnic"]);
      return;
    }
    setError(undefined);
    setBusy(true);
    const { data, error: rpcError } = await supabase.rpc("verify_domicile_status", { p_cnic: parsed.data.cnic });
    setBusy(false);
    if (rpcError) {
      setError("Could not verify right now. Please try again.");
      return;
    }
    setResult(data?.[0] ?? null);
  };

  const issued = result?.matches === true && result.status.toLowerCase() === "issued";

  return (
    <MobileShell>
      <TopBar title="Domicile Verification" subtitle="Sindh Domicile & PRC Portal" onBack={() => navigate({ to: "/" })} />
      <main className="flex flex-1 flex-col gap-5 px-4 py-6">
        <div className="animate-rise space-y-2">
          <div className="bg-brand-gradient grid size-12 place-items-center rounded-xl text-primary-foreground shadow-brand">
            <BadgeCheck className="size-6" />
          </div>
          <h2 className="text-2xl font-bold">Verify a domicile</h2>
          <p className="text-sm text-muted-foreground">Enter a CNIC to check whether an issued domicile matches. Personal details are not shown.</p>
        </div>

        <form onSubmit={submit} className="glass-card animate-rise space-y-4 p-4" noValidate>
          <Field id="cnic" label="CNIC Number" icon={IdCard} error={error} hint={`${cnic.length} / ${CNIC_LENGTH} digits entered`}>
            <Input
              id="cnic"
              inputMode="numeric"
              placeholder="4130412345671"
              value={cnic}
              maxLength={CNIC_LENGTH}
              onChange={(e) => {
                setCnic(digitsOnly(e.target.value, CNIC_LENGTH));
                setResult(undefined);
              }}
              className={inputClass(error) + " font-mono"}
            />
          </Field>
          <Button type="submit" variant="brand" size="touch" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Search />}
            Verify Domicile
          </Button>
        </form>

        {result === null && (
          <div role="status" className="glass-card animate-rise flex items-start gap-3 p-4">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold">No domicile found</p>
              <p className="text-sm text-muted-foreground">No issued domicile is registered against this CNIC.</p>
            </div>
          </div>
        )}

        {result && (
          <section aria-label="Domicile details" className="glass-card animate-rise overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <h3 className="font-semibold">Certificate Status</h3>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  issued ? "bg-primary text-primary-foreground" : "bg-destructive/15 text-destructive",
                )}
              >
                {result.status}
              </span>
            </div>
            <dl className="divide-y">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-muted-foreground">Certificate</dt>
                <dd className="text-right text-sm font-semibold">An issued domicile matches this CNIC.</dd>
              </div>
            </dl>
          </section>
        )}
      </main>
    </MobileShell>
  );
}
