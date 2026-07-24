"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check, ChevronRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

type CopyState = "idle" | "copied" | "failed";

export function CopyFile({
  name,
  lines,
  className,
  children,
}: {
  name?: string;
  lines?: number;
  className?: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const [open, setOpen] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const fileName = name ?? "file";

  // navigator.clipboard is missing on insecure origins (a phone hitting the dev
  // server over http, say) and throws if the document isn't focused.
  const writeToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    }
  };

  const copy = async () => {
    const source = codeRef.current?.querySelector("pre")?.textContent;
    if (!source) {
      setState("failed");
    } else {
      const ok = await writeToClipboard(source);
      setState(ok ? "copied" : "failed");
      if (ok) track("trove_file_copied", { file: fileName });
    }
    setTimeout(() => setState("idle"), 2000);
  };

  return (
    <div
      className={cn(
        "my-4 overflow-hidden rounded-md border border-border/40",
        className
      )}
    >
      <div className="flex items-center gap-3 px-3 py-1.5">
        <span className="min-w-0 truncate font-mono text-[13px] text-foreground">
          {fileName}
        </span>
        {lines && (
          <span className="meta-tag shrink-0 tabular-nums">{lines} lines</span>
        )}
        <button
          type="button"
          onClick={copy}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
        >
          {state === "copied" ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
          {state === "copied"
            ? "copied"
            : state === "failed"
              ? "failed"
              : "copy"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 border-t border-border/40 px-3 py-1.5 text-[12px] font-light text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset"
      >
        <ChevronRight
          className={cn(
            "size-3.5 transition-transform duration-150 ease-out motion-reduce:transition-none",
            open && "rotate-90"
          )}
          aria-hidden
        />
        {open ? "hide code" : "show code"}
      </button>

      {/* kept mounted so copy works while collapsed */}
      <div
        ref={codeRef}
        hidden={!open}
        className="border-t border-border/40 bg-muted/20 px-3 py-2 [&_figure]:my-0 [&_figure_[role=region]]:py-2"
      >
        {children}
      </div>
    </div>
  );
}
