"use client";

import { memo } from "react";

interface ChatModeIndicatorProps {
  hasOthersOnSamePath: boolean;
}

export const ChatModeIndicator = memo(function ChatModeIndicator({
  hasOthersOnSamePath,
}: ChatModeIndicatorProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg bg-secondary/95 backdrop-blur-md border border-border/50 shadow-lg text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-300 z-50">
      {hasOthersOnSamePath ? (
        <>
          <span className="font-medium">Chat mode</span> · Type to chat ·{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-background border text-xs">
            Enter
          </kbd>{" "}
          to send ·{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-background border text-xs">
            Esc
          </kbd>{" "}
          to exit
        </>
      ) : (
        <>
          <span className="font-medium">No one else here</span> · Wait for
          others to join ·{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-background border text-xs">
            Esc
          </kbd>{" "}
          to exit
        </>
      )}
    </div>
  );
});
