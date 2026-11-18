import { IdCard, FileText, UserRound } from "lucide-react";
import { formatCnic, typeLabel } from "@/lib/applications";
import { usePhoto } from "@/lib/photo";

export function ApplicantBadges({ id, type, cnic, showPhoto }: { id: string; type: string; cnic: string; showPhoto: boolean }) {
  const photo = usePhoto(id);
  return (
    <div className="flex items-center gap-3">
      {showPhoto && (
        <div className="h-[54px] w-[42px] shrink-0 overflow-hidden rounded-md border-2 border-primary/40 bg-muted">
          {photo ? (
            <img src={photo} alt="Applicant" className="h-full w-full object-cover" />
          ) : (
            <UserRound className="m-auto mt-3 size-6 text-muted-foreground" />
          )}
        </div>
      )}
      <div className="flex min-w-0 flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
          <FileText className="size-3.5" /> {typeLabel(type)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-mono text-xs font-medium text-secondary-foreground">
          <IdCard className="size-3.5" /> {formatCnic(cnic)}
        </span>
      </div>
    </div>
  );
}
