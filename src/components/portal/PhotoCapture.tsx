import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImageUp, RefreshCw, ZoomIn, MoveHorizontal, MoveVertical, CameraOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const OUT_W = 420;
const OUT_H = 540; // 7:9 passport frame

type Mode = "camera" | "upload";

function FrameGuide() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-[10%_16%_14%] rounded-[50%] border-2 border-dashed border-on-image/80" />
      <div className="absolute inset-2 rounded-lg border border-on-image/40" />
    </div>
  );
}

export function PhotoCapture({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [mode, setMode] = useState<Mode>("camera");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camState, setCamState] = useState<"idle" | "starting" | "live" | "denied">("idle");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamState("denied");
      return;
    }
    setCamState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamState("live");
    } catch {
      setCamState("denied");
    }
  }, []);

  // Auto-start the camera in camera mode when no photo has been taken yet.
  useEffect(() => {
    if (mode === "camera" && !value) startCamera();
    return stopCamera;
  }, [mode, value, startCamera, stopCamera]);

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const vw = v.videoWidth;
    const vh = v.videoHeight;
    const target = 7 / 9;
    let sw = vw;
    let sh = vw / target;
    if (sh > vh) {
      sh = vh;
      sw = vh * target;
    }
    const sx = (vw - sw) / 2;
    const sy = (vh - sh) / 2;
    const c = document.createElement("canvas");
    c.width = OUT_W;
    c.height = OUT_H;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.translate(OUT_W, 0);
    ctx.scale(-1, 1); // un-mirror the selfie preview
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);
    stopCamera();
    onChange(c.toDataURL("image/jpeg", 0.9));
  };

  const retake = () => {
    onChange(null);
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={mode}
        onValueChange={(m) => {
          stopCamera();
          setMode(m as Mode);
        }}
      >
        <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl">
          <TabsTrigger value="camera" className="h-9 rounded-lg">
            <Camera className="size-4" /> Live Camera
          </TabsTrigger>
          <TabsTrigger value="upload" className="h-9 rounded-lg">
            <ImageUp className="size-4" /> Upload File
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {value ? (
        <div className="space-y-3">
          <div className="relative mx-auto aspect-[7/9] w-60 overflow-hidden rounded-xl border-2 border-primary shadow-brand">
            <img src={value} alt="Captured applicant" className="h-full w-full object-cover" />
            <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-4" />
            </span>
          </div>
          <Button type="button" variant="outline" size="touch" className="w-full" onClick={retake}>
            <RefreshCw /> Retake
          </Button>
        </div>
      ) : mode === "camera" ? (
        <div className="space-y-3">
          <div className="relative mx-auto aspect-[7/9] w-60 overflow-hidden rounded-xl bg-foreground">
            <video
              ref={videoRef}
              playsInline
              muted
              className={cn("h-full w-full -scale-x-100 object-cover", camState !== "live" && "opacity-0")}
            />
            {camState === "live" && <FrameGuide />}
            {camState !== "live" && (
              <div className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-on-image/80">
                {camState === "denied" ? (
                  <div className="space-y-2">
                    <CameraOff className="mx-auto size-8" />
                    <p>Camera unavailable. Allow camera access or use Upload File.</p>
                  </div>
                ) : (
                  <p>Starting camera…</p>
                )}
              </div>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground">Keep your face centred inside the oval.</p>
          {camState === "denied" ? (
            <Button type="button" variant="outline" size="touch" className="w-full" onClick={startCamera}>
              <RefreshCw /> Try camera again
            </Button>
          ) : (
            <Button type="button" variant="brand" size="touch" className="w-full" onClick={capture} disabled={camState !== "live"}>
              <Camera /> Capture Photo
            </Button>
          )}
        </div>
      ) : (
        <UploadCropper onDone={onChange} />
      )}
    </div>
  );
}

function UploadCropper({ onDone }: { onDone: (v: string) => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offX, setOffX] = useState(0);
  const [offY, setOffY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (!img) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const s = Math.max(OUT_W / img.naturalWidth, OUT_H / img.naturalHeight) * zoom;
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      const dx = (OUT_W - dw) / 2 + (offX * (dw - OUT_W)) / 2;
      const dy = (OUT_H - dh) / 2 + (offY * (dh - OUT_H)) / 2;
      ctx.clearRect(0, 0, OUT_W, OUT_H);
      ctx.drawImage(img, dx, dy, dw, dh);
    },
    [img, zoom, offX, offY],
  );

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current);
  }, [draw]);

  const onFile = (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please choose a JPG or PNG image.");
      return;
    }
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => {
      setImg(i);
      setZoom(1);
      setOffX(0);
      setOffY(0);
    };
    i.src = url;
  };

  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-[7/9] w-60 overflow-hidden rounded-xl border border-dashed border-input bg-muted">
        {img ? (
          <>
            <canvas ref={canvasRef} width={OUT_W} height={OUT_H} className="h-full w-full" />
            <FrameGuide />
          </>
        ) : (
          <label htmlFor="photo-file" className="absolute inset-0 grid cursor-pointer place-items-center p-4 text-center text-sm text-muted-foreground">
            <div className="space-y-2">
              <ImageUp className="mx-auto size-8 text-primary" />
              <p>Tap to browse a JPG or PNG photo</p>
            </div>
          </label>
        )}
      </div>
      <input
        id="photo-file"
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {error && <p className="text-center text-xs font-medium text-destructive">{error}</p>}
      {img && (
        <div className="glass-card space-y-4 p-4">
          <SliderRow icon={ZoomIn} label="Zoom" value={zoom} min={1} max={3} step={0.01} onChange={setZoom} />
          <SliderRow icon={MoveHorizontal} label="Crop left / right" value={offX} min={-1} max={1} step={0.01} onChange={setOffX} />
          <SliderRow icon={MoveVertical} label="Crop up / down" value={offY} min={-1} max={1} step={0.01} onChange={setOffY} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline" size="touch">
          <label htmlFor="photo-file" className="cursor-pointer">
            <ImageUp /> Browse
          </label>
        </Button>
        <Button
          type="button"
          variant="brand"
          size="touch"
          disabled={!img}
          onClick={() => {
            const c = document.createElement("canvas");
            c.width = OUT_W;
            c.height = OUT_H;
            const ctx = c.getContext("2d");
            if (!ctx) return;
            draw(c);
            onDone(c.toDataURL("image/jpeg", 0.9));
          }}
        >
          <Check /> Use Photo
        </Button>
      </div>
    </div>
  );
}

function SliderRow({
  icon: Icon,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  icon: typeof ZoomIn;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-4 text-primary" /> {label}
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v ?? min)} aria-label={label} />
    </div>
  );
}
