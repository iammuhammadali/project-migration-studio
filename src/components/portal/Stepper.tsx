import { STEPS } from "@/lib/options";
import { cn } from "@/lib/utils";

export function Stepper({ current }: { current: number }) {
  const step = STEPS[current - 1];
  return (
    <div className="space-y-2" aria-label={`Step ${current} of ${STEPS.length}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-medium text-primary">
          STEP {String(current).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </span>
        <span className="font-medium text-muted-foreground">{step?.label}</span>
      </div>
      <div className="flex gap-1">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              s.n < current && "bg-primary",
              s.n === current && "bg-brand-gradient",
              s.n > current && "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
