"use client";

import { useState } from "react";
import { ExternalLink, Maximize2, X } from "lucide-react";

interface WebsitePreviewProps {
  url: string;
  title: string;
}

export function WebsitePreview({ url, title }: WebsitePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            live preview
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
              aria-label="Fullscreen preview"
            >
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
              aria-label="Open in new tab"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        </div>
        <div className="group relative rounded-2xl overflow-hidden border border-border/40 hover:border-highlight/30 transition-all duration-500">
          <div className="relative w-full aspect-[16/10] bg-muted/20">
            <iframe
              src={url}
              title={`${title} website preview`}
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200"
              aria-label="Open in new tab"
            >
              <ExternalLink className="w-5 h-5 text-foreground" />
            </a>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200"
              aria-label="Close fullscreen"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>
          <iframe
            src={url}
            title={`${title} website preview`}
            className="w-full h-full"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}
    </>
  );
}
