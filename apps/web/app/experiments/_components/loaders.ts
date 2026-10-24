import type { ComponentType } from "react";
import { CurtainIntro } from "@/components/curtain/curtain-intro";
import { Contributions } from "./loaders/contributions";
import { FullStop } from "./loaders/full-stop";
import { Goo } from "./loaders/goo";
import { KernelPanic } from "./loaders/kernel-panic";
import { RabbitHole } from "./loaders/rabbit-hole";
import { Storm } from "./loaders/storm";
import { TypeWall } from "./loaders/type-wall";
import type { LoaderProps } from "./loaders/types";
import { Typesetter } from "./loaders/typesetter";

export type LoaderGroup = "home" | "wild";

export interface LoaderEntry {
	blurb: string;
	Component: ComponentType<LoaderProps>;
	group: LoaderGroup;
	name: string;
	slug: string;
}

export const GROUP_LABELS: Record<LoaderGroup, string> = {
	home: "close to home",
	wild: "off the rails",
};

export const LOADERS: LoaderEntry[] = [
	{
		blurb: "an odometer rolls to 100, then ink columns lift",
		Component: CurtainIntro,
		group: "home",
		name: "curtain",
		slug: "curtain",
	},
	{
		blurb: "the headline spins through every font, then sets itself",
		Component: Typesetter,
		group: "home",
		name: "typesetter",
		slug: "typesetter",
	},
	{
		blurb: "ink with letter-shaped holes; dive through the full stop",
		Component: FullStop,
		group: "home",
		name: "full stop",
		slug: "full-stop",
	},
	{
		blurb: "the contribution graph takes the screen and spells the name",
		Component: Contributions,
		group: "home",
		name: "contributions",
		slug: "contributions",
	},
	{
		blurb: "a particle cyclone, lightning, the word, then a blast",
		Component: Storm,
		group: "wild",
		name: "storm",
		slug: "storm",
	},
	{
		blurb: "a boot log that panics, tears into rgb and switches off",
		Component: KernelPanic,
		group: "wild",
		name: "kernel panic",
		slug: "kernel-panic",
	},
	{
		blurb: "falling through counter-rotating rings of every project",
		Component: RabbitHole,
		group: "wild",
		name: "rabbit hole",
		slug: "rabbit-hole",
	},
	{
		blurb: "giant marquee rows strobe, squash and slam shut",
		Component: TypeWall,
		group: "wild",
		name: "type wall",
		slug: "type-wall",
	},
	{
		blurb: "sage blobs orbit and merge, flood, then splash away",
		Component: Goo,
		group: "wild",
		name: "goo",
		slug: "goo",
	},
];
