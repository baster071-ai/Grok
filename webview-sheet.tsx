import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

export function WebviewSheet() {
  const webview = useAppStore((s) => s.webview);
  const closeWebview = useAppStore((s) => s.closeWebview);

  if (!webview) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg/80 pt-10">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl bg-surface" style={{ boxShadow: "var(--shadow-border)" }}>
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{webview.title}</p>
          <Button variant="ghost" size="icon" className="size-10" asChild>
            <a href={webview.url} target="_blank" rel="noreferrer" aria-label="Otwórz w nowej karcie">
              <ExternalLink />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="size-10" onClick={closeWebview} aria-label="Zamknij">
            <X />
          </Button>
        </div>
        <iframe title={webview.title} src={webview.url} className="min-h-0 w-full flex-1 bg-bg" />
      </div>
    </div>
  );
}
