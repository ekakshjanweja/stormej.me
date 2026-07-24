"use client";

import { useEffect, useState } from "react";

function formatIST(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function FooterClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatIST(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time
      className="inline-block font-mono text-[12px] tabular-nums tracking-tight text-muted-foreground"
      suppressHydrationWarning
    >
      {time ?? "--:--:--"} IST
    </time>
  );
}
