import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  id,
  label,
  icon: Icon,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  icon?: LucideIcon | undefined;
  error?: string | undefined;
  hint?: ReactNode | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium">
        {Icon && <Icon className="size-4 text-primary" aria-hidden />}
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass = (error?: string) =>
  cn(
    "h-12 rounded-md border-input bg-card/70 text-base shadow-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring",
    error && "border-destructive focus-visible:ring-destructive/30",
  );

export function SectionCard({ title, icon: Icon, children }: { title?: string | undefined; icon?: LucideIcon | undefined; children: ReactNode }) {
  return (
    <section className="glass-card animate-rise space-y-4 p-4">
      {title && (
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {Icon && (
            <span className="grid size-7 place-items-center rounded-md bg-accent text-accent-foreground">
              <Icon className="size-4" aria-hidden />
            </span>
          )}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
