"use client";

import { PORTRAITS } from "@/lib/profile";
import { INTRO_CARD } from "./about-cards";
import { type FacePhoto, Faces, type Spot } from "./faces";
import { ProjectTabs } from "./project-tabs";
import { SpotifyPanel } from "./spotify";

/* the middle of the home strip: a glance at the numbers and the teams, the
   builds, the reels, the latest notes. each is small until you reach for it */

/* one more face, up in the empty sky above the projects. reached for, it
   says hello */
const BUILDS_FACES: FacePhoto[] = [{ ...PORTRAITS.elevator, card: INTRO_CARD }];
const BUILDS_SPOTS: Spot[] = [
	{ left: "18%", size: 4.5, tilt: -6, top: "24%" },
	{ left: "52%", size: 4, tilt: 5, top: "22%" },
	{ right: "14%", size: 4.75, tilt: -3, top: "26%" },
];

/** the projects, early on the strip, right after the hello */
export function HomeBuilds() {
	return (
		<section aria-labelledby="builds-title" className="s-builds">
			<Faces
				className="faces-home"
				photos={BUILDS_FACES}
				spots={BUILDS_SPOTS}
			/>
			<div className="s-builds-head">
				<p className="s-index">builds</p>
				<h2 className="s-builds-title" id="builds-title">
					side projects, <em>shipped</em>
				</h2>
			</div>
			<ProjectTabs />
		</section>
	);
}

export function HomeMore() {
	return <SpotifyPanel />;
}
