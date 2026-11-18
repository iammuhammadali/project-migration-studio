import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileShell, TopBar } from "@/components/portal/MobileShell";
import { Stepper } from "@/components/portal/Stepper";
import { ApplicantBadges } from "@/components/portal/ApplicantBadges";
import { applicationQuery, stepRoute } from "@/lib/applications";
import { STEPS } from "@/lib/options";
import { portalHead } from "@/lib/page-metadata";

function stepFromPath(pathname: string) {
  const last = pathname.split("/").filter(Boolean).pop();
  return STEPS.find((s) => s.path === last)?.n ?? 2;
}

export const Route = createFileRoute("/_authenticated/application/$id")({
  loader: async ({ context, params, location }) => {
    const app = await context.queryClient.ensureQueryData(applicationQuery(params.id));
    const step = stepFromPath(location.pathname);
    if (app.status !== "submitted" && step > app.current_step) {
      throw redirect({ to: stepRoute(app.current_step), params: { id: params.id } });
    }
  },
  head: () => portalHead("Domicile Application — Sindh Domicile & PRC Portal", "Complete or review your Sindh Domicile application."),
  component: ApplicationLayout,
});

function ApplicationLayout() {
  const { id } = Route.useParams();
  const { data: app } = useSuspenseQuery(applicationQuery(id));
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const step = stepFromPath(pathname);
  const meta = STEPS[step - 1];

  const back = () => {
    if (step <= 2) navigate({ to: "/dashboard", search: { app: undefined } });
    else navigate({ to: stepRoute(step - 1), params: { id } });
  };

  if (app.status === "submitted") {
    return (
      <MobileShell>
        <TopBar title="Application submitted" onBack={() => navigate({ to: "/dashboard", search: { app: id } })} />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <CheckCircle2 className="size-12 text-primary" />
          <p className="text-sm text-muted-foreground">This application has already been submitted.</p>
          <Button asChild variant="brand" size="touch">
            <Link to="/dashboard" search={{ app: id }}>
              Go to dashboard
            </Link>
          </Button>
        </main>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <TopBar title={TITLES[step] ?? meta?.label ?? "Application"} subtitle={`Step ${step} of 7`} onBack={back} />
      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        <Stepper current={step} />
        <ApplicantBadges id={id} type={app.application_type} cnic={app.cnic} showPhoto={step >= 4} />
        <Outlet />
      </div>
    </MobileShell>
  );
}

const TITLES: Record<number, string> = {
  2: "Applicant Details",
  3: "Applicant Photo",
  4: "Additional Information",
  5: "Personal Details",
  6: "Electoral & Delivery",
  7: "Fee & Certificate",
};
