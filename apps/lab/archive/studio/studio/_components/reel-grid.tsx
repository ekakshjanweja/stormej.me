"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { REELS } from "@/lib/profile";
import { SHOWREEL } from "../_lib/content";
import { dayMonth } from "../_lib/pages";
import { ExternalLink } from "./external-link";
import { ReelDialog, type ReelDialogHandle } from "./reel-dialog";

/* every @stormej.studio post as a cover. the ones saved here open the reel
   player with sound; the rest open on instagram */

const PLAYABLE = SHOWREEL.reels;

export function ReelGrid() {
	const playerRef = useRef<ReelDialogHandle>(null);

	const open = useCallback((event: { currentTarget: HTMLButtonElement }) => {
		playerRef.current?.open(Number(event.currentTarget.dataset.index));
	}, []);

	return (
		<>
			<ul className="notes-reels">
				{REELS.map((reel) => {
					const index = PLAYABLE.findIndex((item) => item.href === reel.href);
					const body = (
						<>
							<Image
								alt=""
								className="notes-reel-cover"
								height={reel.kind === "reel" ? 640 : 450}
								sizes="(min-width: 988px) 20vw, 45vw"
								src={reel.cover}
								width={360}
							/>
							<span className="notes-reel-title">{reel.title}</span>
							<span className="notes-reel-meta">
								{dayMonth(reel.date)} ·{" "}
								{index === -1 ? `${reel.kind} on instagram` : "plays here"}
							</span>
						</>
					);
					return (
						<li data-reveal key={reel.href}>
							{index === -1 ? (
								<ExternalLink className="notes-reel" href={reel.href}>
									{body}
								</ExternalLink>
							) : (
								<button
									className="notes-reel"
									data-index={index}
									onClick={open}
									type="button"
								>
									{body}
									<span className="sr-only">, play with sound</span>
								</button>
							)}
						</li>
					);
				})}
			</ul>
			<ReelDialog ref={playerRef} />
		</>
	);
}
