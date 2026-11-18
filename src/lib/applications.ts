import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];
export type AppDocument = Database["public"]["Tables"]["application_documents"]["Row"];

export const applicationTypesQuery = queryOptions({
  queryKey: ["application-types"],
  queryFn: async () => {
    const { data, error } = await supabase.from("application_types").select("*").order("sort");
    if (error) throw error;
    return data;
  },
  staleTime: 5 * 60_000,
});

export const applicationQuery = (id: string) =>
  queryOptions({
    queryKey: ["application", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Application not found");
      return data;
    },
  });

export const applicationsQuery = queryOptions({
  queryKey: ["applications"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const trackingQuery = (cnic: string) =>
  queryOptions({
    queryKey: ["application-track", cnic],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("track_application", { p_cnic: cnic });
      if (error) throw error;
      return data[0] ?? null;
    },
  });

export const documentsQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["documents", applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_documents")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data } = await supabase.from("profiles").select("cnic").eq("id", u.user.id).maybeSingle();
    return data;
  },
});

export async function updateApplication(id: string, patch: ApplicationUpdate) {
  const { data, error } = await supabase.from("applications").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export function typeLabel(code: string) {
  return (
    {
      new: "New Application",
      correction: "Correction",
      lost: "Lost",
      form_c: "Form C",
      form_d: "Form D",
    } as Record<string, string>
  )[code] ?? code;
}

export function formatCnic(cnic: string) {
  if (cnic.length !== 13) return cnic;
  return `${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic.slice(12)}`;
}

export const STEP_ROUTES = {
  2: "/application/$id/details",
  3: "/application/$id/photo",
  4: "/application/$id/additional",
  5: "/application/$id/personal",
  6: "/application/$id/electoral",
  7: "/application/$id/fee",
} as const satisfies Record<number, string>;

export type StepRoute = (typeof STEP_ROUTES)[keyof typeof STEP_ROUTES];

export function stepRoute(n: number): StepRoute {
  return (STEP_ROUTES as Record<number, StepRoute>)[n] ?? STEP_ROUTES[2];
}
