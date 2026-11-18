import { useRef, useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, Eye, FileText, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { documentsQuery, type AppDocument } from "@/lib/applications";
import { DOCUMENT_TYPES } from "@/lib/options";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const BUCKET = "applicant-documents";
const IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);

export function DocumentUploads({ applicationId, userId }: { applicationId: string; userId: string }) {
  const { data: docs } = useSuspenseQuery(documentsQuery(applicationId));
  const done = DOCUMENT_TYPES.filter((t) => docs.some((d) => d.doc_type === t.key)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Document Upload</h2>
        <span className="font-mono text-xs text-muted-foreground">
          {done}/{DOCUMENT_TYPES.length} uploaded
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="bg-brand-gradient h-full transition-all" style={{ width: `${(done / DOCUMENT_TYPES.length) * 100}%` }} />
      </div>
      <ol className="space-y-2.5">
        {DOCUMENT_TYPES.map((t, i) => (
          <DocumentRow
            key={t.key}
            index={i + 1}
            type={t}
            files={docs.filter((d) => d.doc_type === t.key)}
            applicationId={applicationId}
            userId={userId}
          />
        ))}
      </ol>
    </div>
  );
}

function DocumentRow({
  index,
  type,
  files,
  applicationId,
  userId,
}: {
  index: number;
  type: (typeof DOCUMENT_TYPES)[number];
  files: AppDocument[];
  applicationId: string;
  userId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const imageOnly = "imageOnly" in type && type.imageOnly;
  const accept = imageOnly ? "image/jpeg,image/png" : "image/jpeg,image/png,application/pdf";

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(list)) {
        const okType = imageOnly ? IMAGE_TYPES.has(file.type) : IMAGE_TYPES.has(file.type) || file.type === "application/pdf";
        if (!okType) {
          toast.error(`${file.name}: ${imageOnly ? "please upload an image" : "please upload an image or PDF"}.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is larger than 10 MB.`);
          continue;
        }
        const safe = file.name.replace(/[^\w.-]+/g, "_").slice(-80);
        const path = `${userId}/${applicationId}/${type.key}/${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { error } = await supabase.from("application_documents").insert({
          application_id: applicationId,
          doc_type: type.key,
          file_path: path,
          file_name: file.name.slice(0, 200),
          mime_type: file.type,
        });
        if (error) throw error;
      }
      await qc.invalidateQueries({ queryKey: ["documents", applicationId] });
      toast.success(`${type.label} uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const view = async (doc: AppDocument) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_path, 300);
    if (error || !data) {
      toast.error("Could not open file");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const remove = async (doc: AppDocument) => {
    await supabase.storage.from(BUCKET).remove([doc.file_path]);
    const { error } = await supabase.from("application_documents").delete().eq("id", doc.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["documents", applicationId] });
  };

  const has = files.length > 0;
  return (
    <li className={cn("glass-card p-3.5 transition-all", has && "border-primary/40")}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold",
            has ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {has ? <CheckCircle2 className="size-4" /> : String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{type.label}</p>
          <p className="text-xs text-muted-foreground">({type.hint})</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={has ? "outline" : "brand"}
          className="h-9 shrink-0 rounded-lg"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Upload />}
          {has ? "Add" : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={!imageOnly}
          className="sr-only"
          aria-label={`Upload ${type.label}`}
          onChange={(e) => upload(e.target.files)}
        />
      </div>
      {has && (
        <ul className="mt-3 space-y-1.5 border-t pt-3">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-xs">
              {f.mime_type === "application/pdf" ? (
                <FileText className="size-4 shrink-0 text-brand-blue" />
              ) : (
                <ImageIcon className="size-4 shrink-0 text-primary" />
              )}
              <span className="min-w-0 flex-1 truncate">{f.file_name}</span>
              <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => view(f)} aria-label="View file">
                <Eye />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove(f)} aria-label="Remove file">
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
