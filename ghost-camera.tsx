import { Camera, ImageIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GhostOutline } from "@/components/ghost-outline";
import { Button } from "@/components/ui/button";
import { getShot } from "@/lib/categories";
import { compressFile, compressVideoFrame } from "@/lib/images";
import { useAppStore } from "@/store/app-store";

export function GhostCamera() {
  const camera = useAppStore((s) => s.camera);
  const categoryId = useAppStore((s) => s.categoryId);
  const closeCamera = useAppStore((s) => s.closeCamera);
  const addCompressedPhoto = useAppStore((s) => s.addCompressedPhoto);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [live, setLive] = useState(false);
  const [fail, setFail] = useState<string | null>(null);
  const shot = getShot(categoryId, camera.shotId);

  useEffect(() => {
    if (!camera.open) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    setFail(null);
    setLive(false);

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setLive(true);
        }
      } catch {
        setFail("Aparat na żywo jest niedostępny. Wgraj zdjęcie z galerii albo użyj tylnej kamery telefonu.");
      }
    })();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      setLive(false);
    };
  }, [camera.open]);

  if (!camera.open) return null;

  async function capture() {
    const video = videoRef.current;
    if (!video || !live) {
      inputRef.current?.click();
      return;
    }
    const compressed = compressVideoFrame(video);
    addCompressedPhoto({ ...compressed, shotId: camera.shotId });
    closeCamera();
  }

  async function onFile(files: FileList | null) {
    if (!files?.[0]) return;
    const compressed = await compressFile(files[0]);
    addCompressedPhoto({ ...compressed, shotId: camera.shotId });
    closeCamera();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="relative min-h-0 flex-1 bg-bg">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          autoPlay
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10">
          <div className="aspect-[200/260] h-[70%] max-h-[520px] opacity-90">
            <GhostOutline kind={shot?.outline ?? "upper"} />
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent/80">
              Obrys pomocniczy
            </p>
            <p className="mt-1 font-display text-xl text-fg">{shot?.label ?? "Ujęcie przedmiotu"}</p>
            <p className="mt-1 max-w-xs text-sm text-muted">{shot?.hint ?? "Wyrównaj przedmiot do obrysu."}</p>
          </div>
          <Button variant="secondary" size="icon" onClick={closeCamera} aria-label="Zamknij aparat">
            <X />
          </Button>
        </div>
        {fail && (
          <div className="absolute inset-x-4 bottom-32 rounded-xl bg-surface/90 p-3 text-sm text-muted">
            {fail}
          </div>
        )}
      </div>
      <div className="flex items-center justify-around gap-4 bg-surface px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Button variant="ghost" size="icon" onClick={() => inputRef.current?.click()} aria-label="Galeria">
          <ImageIcon />
        </Button>
        <button
          type="button"
          onClick={() => void capture()}
          className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lg transition-transform duration-150 ease-out enabled:active:scale-[0.96]"
          aria-label="Zrób zdjęcie"
        >
          <Camera className="size-7" />
        </button>
        <div className="size-11" />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void onFile(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
