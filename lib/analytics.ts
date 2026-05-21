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
  | "content_card_clicked"
  | "publications_list_viewed";

export type PublicationClickLocation = "home" | "publications";

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function trackPublicationClicked(
  pub: { slug: string; title: string; paperUrl: string },
  location: PublicationClickLocation,
) {
  track("content_card_clicked", {
    kind: "publication",
    slug: pub.slug,
    title: pub.title,
    location,
    paper_url: pub.paperUrl,
    external: true,
  });
}

export function trackPublicationsListViewed() {
  track("publications_list_viewed");
}
