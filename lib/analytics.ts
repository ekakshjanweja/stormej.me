"use client";

import posthog from "posthog-js";

export type AnalyticsEvent =
  | "cta_clicked"
  | "social_link_clicked"
  | "nav_link_clicked"
  | "mobile_menu_toggled"
  | "keyboard_shortcut_used"
  | "theme_toggled"
  | "content_viewed"
  | "content_card_clicked";

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}
