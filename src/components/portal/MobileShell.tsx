import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">{children}</div>;
}

export function TopBar({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string | undefined;
  onBack?: (() => void) | undefined;
  right?: ReactNode | undefined;
}) {
  return (
    <header className="glass-bar sticky top-0 z-30 border-b px-4 py-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button type="button" variant="glass" size="iconTouch" onClick={onBack} aria-label="Back">
            <ArrowLeft />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
