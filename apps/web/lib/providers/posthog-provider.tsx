"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
			api_host: "/ingest",
			capture_pageleave: true,
			capture_pageview: true,
			person_profiles: "identified_only",
			ui_host: "https://us.i.posthog.com",
		});
	}, []);

	return <PHProvider client={posthog}>{children}</PHProvider>;
}
