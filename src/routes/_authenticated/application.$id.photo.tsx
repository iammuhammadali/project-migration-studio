import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { SectionCard } from "@/components/portal/Field";
import { PhotoCapture } from "@/components/portal/PhotoCapture";
import { FormFooter } from "@/components/portal/FormFooter";
import { applicationQuery } from "@/lib/applications";
import { readPhoto, savePhoto } from "@/lib/photo";
import { useStepSave } from "@/lib/useStepSave";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/_authenticated/application/$id/photo")({
  head: () => portalHead("Step 3: Applicant Photo — Sindh Domicile & PRC Portal", "Capture or upload an applicant passport-size photograph."),
  component: PhotoStep,
});

function PhotoStep() {
  const { id } = Route.useParams();
  const { data: app } = useSuspenseQuery(applicationQuery(id));
  const [photo, setPhoto] = useState<string | null>(null);
  const { save, saving } = useStepSave(app);

  useEffect(() => setPhoto(readPhoto(id)), [id]);

  const change = (v: string | null) => {
    setPhoto(v);
    savePhoto(id, v);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <SectionCard title="Passport-size photo (7:9)" icon={Camera}>
        <PhotoCapture value={photo} onChange={change} />
      </SectionCard>
      <div className="flex-1" />
      <FormFooter saving={saving} disabled={!photo} onClick={() => save({}, 4)} />
    </div>
  );
}
