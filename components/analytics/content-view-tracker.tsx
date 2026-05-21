"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function ContentViewTracker({
  kind,
  slug,
  title,
}: {
  kind: "work" | "project" | "blog" | "publication";
  slug: string;
  title: string;
}) {
  useEffect(() => {
    track("content_viewed", { kind, slug, title });
  }, [kind, slug, title]);

  return null;
}
