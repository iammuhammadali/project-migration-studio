import { Suspense } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight, FilePlus2, FolderOpen, Loader2, LogOut, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileShell, TopBar } from "@/components/portal/MobileShell";
import { DocumentUploads } from "@/components/portal/DocumentUploads";
import { applicationsQuery, formatCnic, profileQuery, stepRoute, typeLabel, type Application } from "@/lib/applications";
import { signOutEverywhere } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: (s: Record<string, unknown>) => ({ app: typeof s["app"] === "string" ? s["app"] : undefined }),
  head: () => portalHead("Dashboard — Sindh Domicile & PRC Portal", "View your domicile applications and upload supporting documents."),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(applicationsQuery),
      context.queryClient.ensureQueryData(profileQuery),
    ]);
  },
  component: Dashboard,
});

function Dashboard() {
  const { data: apps } = useSuspenseQuery(applicationsQuery);
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { user } = Route.useRouteContext();
  const { app } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const submitted = apps.filter((a) => a.status === "submitted");
  const selected = submitted.find((a) => a.id === app) ?? submitted[0];

  const signOut = async () => {
    await signOutEverywhere({ queryClient: qc });
    navigate({ to: "/", replace: true });
  };

  return (
    <MobileShell>
      <TopBar
        title="Applicant Dashboard"
        subtitle={profile?.cnic ? `CNIC ${formatCnic(profile.cnic)}` : undefined}
        right={
          <Button variant="glass" size="iconTouch" onClick={signOut} aria-label="Sign out">
            <LogOut />
          </Button>
        }
      />
      <main className="flex-1 space-y-6 px-4 py-5 pb-safe">
        <section className="bg-brand-gradient animate-rise relative overflow-hidden rounded-2xl p-5 text-primary-foreground shadow-brand">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-on-image/10" />
          <p className="font-mono text-xs uppercase opacity-80">Domicile & PRC</p>
          <h2 className="mt-1 text-xl font-bold">Start a new application</h2>
          <p className="mt-1 text-sm opacity-85">7 quick steps. Your progress is saved after each step.</p>
          <Button asChild variant="solidLight" size="touch" className="mt-4 w-full">
            <Link to="/applicant-cnic">
              <FilePlus2 /> New Application
            </Link>
          </Button>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">My Applications</h2>
          {apps.length === 0 ? (
            <div className="glass-card p-6 text-center text-sm text-muted-foreground">
              <FolderOpen className="mx-auto mb-2 size-8 text-primary" />
              No applications yet.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {apps.map((a) => (
                <ApplicationCard key={a.id} a={a} selected={selected?.id === a.id} />
              ))}
            </ul>
          )}
        </section>

        {selected && (
          <Suspense
            fallback={
              <div className="grid place-items-center py-10 text-muted-foreground">
                <Loader2 className="animate-spin" />
              </div>
            }
          >
            <DocumentUploads applicationId={selected.id} userId={user.id} />
          </Suspense>
        )}
      </main>
    </MobileShell>
  );
}

function ApplicationCard({ a, selected }: { a: Application; selected: boolean }) {
  const isDraft = a.status !== "submitted";
  const date = new Date(a.submitted_at ?? a.created_at).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const body = (
    <div className={cn("glass-card flex items-center gap-3 p-3.5 transition-all active:scale-[0.99]", selected && "ring-2 ring-primary/50")}>
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg",
          isDraft ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground",
        )}
      >
        {isDraft ? <Clock className="size-5" /> : <CheckCircle2 className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{typeLabel(a.application_type)}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {formatCnic(a.cnic)} · {date}
        </p>
      </div>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
          isDraft ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground",
        )}
      >
        {isDraft ? `Step ${a.current_step}/7` : "Submitted"}
      </span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );

  if (isDraft) {
    return (
      <li>
        <Link to={stepRoute(a.current_step)} params={{ id: a.id }}>
          {body}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <Link to="/dashboard" search={{ app: a.id }}>
        {body}
      </Link>
    </li>
  );
}
