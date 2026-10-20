import type { ReactNode } from "react";
import { StoryMedia } from "@/components/story/story-media";
import type { WorkImageAsset } from "@/lib/types/types";

/**
 * One part of a story with its screens: the text, then the screens right
 * under it, so each picture sits with the words about it.
 */
export function Spread({
	id,
	media,
	landscape = false,
	label,
	children,
}: {
	id?: string;
	media: WorkImageAsset[];
	landscape?: boolean;
	/** names the screens for screen readers */
	label: string;
	children: ReactNode;
}) {
	return (
		<section className="spread scroll-mt-32 space-y-10" id={id}>
			<div className="max-w-[40rem] space-y-4">{children}</div>
			<StoryMedia label={label} landscape={landscape} media={media} />
		</section>
	);
}
