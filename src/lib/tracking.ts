export const TRACKING_STAGES = [
  { id: "data_entry", label: "Data Entry" },
  { id: "document_submission", label: "Document Submission" },
  { id: "submitted", label: "Submitted" },
  { id: "approved", label: "Approved" },
  { id: "revision", label: "Revision" },
  { id: "refused", label: "Refused" },
  { id: "printed", label: "Printed" },
  { id: "dispatched", label: "Dispatched" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export type TrackingStatusTone = "primary" | "success" | "warning" | "destructive" | "muted";

const statusAliases: Record<string, string> = {
  draft: "data_entry",
  documents_submitted: "document_submission",
  canceled: "cancelled",
  rejected: "refused",
};

export function normalizeTrackingStatus(status: string) {
  const normalized = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return statusAliases[normalized] ?? normalized;
}

export function trackingStageIndex(status: string) {
  return TRACKING_STAGES.findIndex((stage) => stage.id === normalizeTrackingStatus(status));
}

export function trackingStatusTone(status: string): TrackingStatusTone {
  switch (normalizeTrackingStatus(status)) {
    case "approved":
    case "printed":
    case "dispatched":
    case "delivered":
      return "success";
    case "revision":
      return "warning";
    case "refused":
    case "cancelled":
      return "destructive";
    case "data_entry":
    case "document_submission":
    case "submitted":
      return "primary";
    default:
      return "muted";
  }
}

export function trackingToneClass(tone: TrackingStatusTone) {
  return {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning-foreground",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  }[tone];
}