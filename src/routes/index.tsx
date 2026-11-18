import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, BadgeCheck, CircleUserRound, FileSearch, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApplicationTracker } from "@/components/portal/ApplicationTracker";
import { supabase } from "@/integrations/supabase/client";
import heritage from "@/assets/sindh-heritage-skyline.png.asset.json";
import wordmark from "@/assets/sindh-domicile-prc-wordmark.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sindh Domicile & PRC Portal — Welcome" },
      { name: "description", content: "Apply for your Sindh Domicile and PRC certificate, verify an issued domicile, track your application or log in." },
      { property: "og:title", content: "Sindh Domicile & PRC Portal" },
      { property: "og:description", content: "Apply for your Sindh Domicile and PRC certificate, verify an issued domicile, track your application or log in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "author", content: "Government of Sindh" },
    ],
  }),
  component: Welcome,
});

const cardClass =
  "group glass-card flex aspect-[1.05] flex-col items-center justify-center gap-3 border border-glass-border p-4 text-center transition-all hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function CardInner({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground [&_svg]:size-7">
        {icon}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </>
  );
}

function Welcome() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);

  // Signed-in applicants skip the welcome screen.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      setAuthResolved(true);
      if (data.user) navigate({ to: "/dashboard", search: { app: undefined }, replace: true });
    });
  }, [navigate]);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-background">
      <header className="glass-bar sticky top-0 z-30 border-b px-4 py-3">
        <div className="flex items-center">
          <img
            src={wordmark.url}
            alt="Government of Sindh — Domicile & PRC Portal"
            width={662}
            height={140}
            className="h-auto w-full max-w-[13.75rem]"
          />
        </div>
      </header>

      <main className="relative z-10 flex flex-col gap-7 px-5 pt-8">
        <div className="animate-rise space-y-2 text-center">
          <h1 className="font-display text-[1.75rem] font-bold leading-tight text-brand-ink sm:text-3xl">
            Sindh Domicile
            <br />& PRC Portal
          </h1>
          <p className="font-mono text-xs uppercase text-brand-deep">Online Services App</p>
        </div>

        <nav aria-label="Main actions" className="animate-rise grid grid-cols-2 gap-4 [animation-delay:120ms]">
          <Link to="/verify" className={cardClass}>
            <CardInner icon={<BadgeCheck />} label="Domicile Verification" />
          </Link>
          <Button
            type="button"
            variant="ghost"
            className={cardClass}
            aria-expanded={trackingOpen}
            aria-controls="application-tracker"
            onClick={() => setTrackingOpen((open) => !open)}
          >
            <CardInner icon={<FileSearch />} label="Track Application" />
          </Button>
          <Link to="/login" className={cardClass}>
            <CardInner icon={<CircleUserRound />} label="Login" />
          </Link>
          <Button
            type="button"
            variant="ghost"
            className={cardClass}
            onClick={() => toast.info("Feedback will be available soon.")}
          >
            <CardInner icon={<MessageSquareText />} label="Feedback" />
          </Button>
        </nav>

        {trackingOpen && (
          <div id="application-tracker" className="animate-rise scroll-mt-20">
            <ApplicationTracker signedIn={signedIn} authResolved={authResolved} />
          </div>
        )}

        <Button asChild variant="deep" size="touch" className="animate-rise h-14 w-full rounded-2xl border border-glass-border text-base font-semibold [animation-delay:220ms]">
          <Link to="/register">
            Apply Now <ArrowRight className="!size-5" />
          </Link>
        </Button>
      </main>

      <div
        aria-hidden="true"
        className="pointer-events-none mt-auto aspect-[1536/382] w-full bg-primary opacity-25"
        style={{
          maskImage: `url(${heritage.url})`,
          WebkitMaskImage: `url(${heritage.url})`,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
