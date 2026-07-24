"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function formatIST(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function DelhiPin() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatIST(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="group inline-flex items-center gap-1 cursor-default transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded-sm"
          >
            <MapPin
              className="w-3 h-3 transition-transform duration-300 group-hover:-translate-y-0.5"
              aria-hidden
            />
            new delhi
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="end"
          className="text-xs font-light leading-relaxed"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-mono tabular-nums">
              {time ?? "--:--:--"} IST
            </span>
            <span className="text-muted-foreground">28.61° N, 77.21° E</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
