import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, CircleDot, FileSearch, IdCard, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, inputClass } from "@/components/portal/Field";
import { trackingQuery } from "@/lib/applications";
import { formatCnic } from "@/lib/applications";
import { TRACKING_STAGES, trackingStageIndex, trackingStatusTone, trackingToneClass } from "@/lib/tracking";
import { CNIC_LENGTH, digitsOnly, verifySchema } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type TrackingRecord = Database["public"]["Functions"]["track_application"]["Returns"][number];

function displayCnic(value: string) {
  const digits = digitsOnly(value, CNIC_LENGTH);
  const first = digits.slice(0, 5);
  const second = digits.slice(5, 12);
  const last = digits.slice(12, 13);
  return [first, second, last].filter(Boolean).join("-");
}

const toneClass = {
  primary: "border-primary/25 bg-accent text-accent-foreground",
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/35 bg-warning/15 text-warning-foreground",
  destructive: "border-destructive/25 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
} as const;

export function ApplicationTracker({ signedIn, authResolved }: { signedIn: boolean; authResolved: boolean }) {
  const queryClient = useQueryClient();
  const [cnic, setCnic] = useState("");
  const [record, setRecord] = useState<TrackingRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNeedsSignIn(false);
    setSearched(false);
    setRecord(null);

    const parsed = verifySchema.safeParse({ cnic });
    if (!parsed.success) {
      setError("CNIC must be exactly 13 digits.");
      return;
    }
    if (!signedIn) {
      setNeedsSignIn(true);
      return;
    }

    setLoading(true);
    try {
      const result = await queryClient.fetchQuery(trackingQuery(parsed.data.cnic));
      setRecord(result);
      setSearched(true);
    } catch {
      setError("Could not check right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStage = record ? trackingStageIndex(record.stage) : -1;
  const currentTone = record ? trackingStatusTone(record.stage) : "muted";

  return (
    <section className="glass-card animate-rise space-y-4 border border-glass-border p-4" aria-labelledby="tracking-title">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          <FileSearch className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="tracking-title" className="font-display text-base font-semibold text-foreground">Track Application</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Enter the applicant’s CNIC to check the latest status.</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="space-y-4">
        <Field id="tracking-cnic" label="CNIC Number" icon={IdCard} error={error}>
          <Input
            id="tracking-cnic"
            inputMode="numeric"
            autoComplete="off"
            aria-describedby="tracking-cnic-hint"
            placeholder="00000-0000000-0"
            value={displayCnic(cnic)}
            maxLength={15}
            onChange={(event) => {
              setCnic(digitsOnly(event.target.value, CNIC_LENGTH));
              setRecord(null);
              setSearched(false);
              setNeedsSignIn(false);
              setError("");
            }}
            className={cn(inputClass(error), "font-mono")}
          />
        </Field>
        <p id="tracking-cnic-hint" className="-mt-3 text-xs text-muted-foreground">Use the 13 digits shown on the CNIC.</p>
        <Button type="submit" variant="brand" size="touch" className="w-full" disabled={loading || !authResolved}>
          {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <FileSearch aria-hidden="true" />}
          {loading ? "Checking status…" : "Track Status"}
        </Button>
      </form>

      {needsSignIn && (
        <div role="status" className="glass-card space-y-3 border border-glass-border p-4 text-sm">
          <p className="text-foreground">Please sign in to securely view your application status.</p>
          <Button asChild variant="deep" size="touch" className="w-full">
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      )}

      {searched && !record && (
        <div role="status" className="glass-card border border-glass-border p-4 text-sm text-foreground" aria-live="polite">
          No application record found for this CNIC.
        </div>
      )}

      {record && (
        <div className="space-y-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Application Status</h3>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">CNIC {formatCnic(cnic)}</p>
            </div>
            <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", toneClass[currentTone])}>
              {currentStage >= 0 ? TRACKING_STAGES[currentStage]?.label : record.stage.replaceAll("_", " ")}
            </span>
          </div>

          <ol aria-label="Application status timeline" className="space-y-1">
            {TRACKING_STAGES.map((stage, index) => {
              const completed = currentStage >= 0 && index < currentStage;
              const current = index === currentStage;
              const Icon = completed ? CheckCircle2 : current ? CircleDot : Circle;
              const stageTone = current ? currentTone : "primary";
              return (
                <li
                  key={stage.id}
                  aria-current={current ? "step" : undefined}
                  className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-2 py-1"
                >
                  <span className={cn("grid size-6 place-items-center", completed && "text-success", current && trackingToneClass(stageTone), !completed && !current && "text-muted-foreground")}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className={cn("text-sm", (completed || current) ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {stage.label}
                  </span>
                  {current && (
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", toneClass[stageTone])}>
                      Current
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}