import { supabase } from "@/integrations/supabase/client";

/** Accounts are keyed by CNIC; auth needs an email, so derive a fixed one per CNIC. */
export function cnicToEmail(cnic: string) {
  return `${cnic}@cnic.sindh-domicile.app`;
}

export async function signOutEverywhere(opts: {
  queryClient: { cancelQueries: () => Promise<void>; clear: () => void };
}) {
  await opts.queryClient.cancelQueries();
  opts.queryClient.clear();
  await supabase.auth.signOut();
}
