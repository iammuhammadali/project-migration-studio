import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { stepRoute, updateApplication, type Application, type ApplicationUpdate } from "./applications";

/** Saves one step of the application and moves on to the next step. */
export function useStepSave(app: Application) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const save = async (patch: ApplicationUpdate, nextStep: number, successMessage?: string) => {
    setSaving(true);
    try {
      const row = await updateApplication(app.id, {
        ...patch,
        current_step: Math.max(app.current_step, nextStep),
      });
      qc.setQueryData(["application", app.id], row);
      qc.invalidateQueries({ queryKey: ["applications"] });
      if (successMessage) toast.success(successMessage);
      await navigate({ to: stepRoute(nextStep), params: { id: app.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return { save, saving };
}

export function asRecord<T extends object>(v: unknown): Partial<Record<keyof T, string>> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Partial<Record<keyof T, string>>) : {};
}
