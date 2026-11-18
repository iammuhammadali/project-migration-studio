import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FormFooter({
  saving,
  disabled,
  label = "Next",
  savingLabel = "Saving...",
  onClick,
}: {
  saving?: boolean | undefined;
  disabled?: boolean | undefined;
  label?: string | undefined;
  savingLabel?: string | undefined;
  onClick?: (() => void) | undefined;
}) {
  return (
    <div className="glass-bar pb-safe sticky bottom-0 z-20 -mx-4 mt-2 border-t px-4 pt-3">
      <Button
        type={onClick ? "button" : "submit"}
        onClick={onClick}
        variant="brand"
        size="touch"
        className="w-full"
        disabled={saving || disabled}
      >
        {saving ? (
          <>
            <Loader2 className="animate-spin" /> {savingLabel}
          </>
        ) : (
          <>
            {label} <ArrowRight />
          </>
        )}
      </Button>
    </div>
  );
}
