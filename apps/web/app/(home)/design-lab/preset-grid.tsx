"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
	applyDesign,
	DESIGN_AXES,
	DESIGN_PRESETS,
	DESIGN_STORAGE_KEY,
} from "@/lib/design-lab";

type Preset = (typeof DESIGN_PRESETS)[number];

export function PresetGrid() {
	return (
		<ul className="mt-10 grid gap-8 md:grid-cols-2">
			{DESIGN_PRESETS.map((preset) => (
				<PresetCard key={preset.id} preset={preset} />
			))}
		</ul>
	);
}

function PresetCard({ preset }: { preset: Preset }) {
	const router = useRouter();

	const choose = useCallback(() => {
		applyDesign(preset.config);
		localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(preset.config));
		router.push("/");
	}, [preset.config, router]);

	return (
		<li className="flex flex-col gap-3">
			{/* the preview renders the real homepage at 1280px, scaled to fit */}
			<div className="relative aspect-[16/11] overflow-hidden rounded-lg border border-border bg-muted">
				<iframe
					className="absolute top-0 left-0 h-[228.572%] w-[228.572%] origin-top-left scale-[0.4375] border-0"
					loading="lazy"
					src={`/?preset=${preset.id}`}
					title={`${preset.label} preset preview`}
				/>
			</div>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<h2 className="font-medium text-[15px]">{preset.label}</h2>
					<p className="text-[13px] text-muted-foreground">
						{preset.description}
					</p>
					<p className="meta-tag mt-1.5">
						{DESIGN_AXES.map((axis) => preset.config[axis.key]).join(" · ")}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-3 pt-0.5">
					<Link
						aria-label={`Open ${preset.label} preview in a new tab`}
						className="meta-tag hover-dim inline-flex items-center gap-1"
						href={`/?preset=${preset.id}`}
						rel="noopener"
						target="_blank"
					>
						open
						<ArrowUpRight aria-hidden className="size-3" />
					</Link>
					<button
						className="rounded-full border border-foreground bg-foreground px-3 py-1 text-[12px] text-background transition-opacity hover:opacity-80"
						onClick={choose}
						type="button"
					>
						use this
					</button>
				</div>
			</div>
		</li>
	);
}
