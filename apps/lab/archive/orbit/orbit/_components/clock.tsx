"use client";

import { useEffect, useState } from "react";
import { PERSON } from "@/lib/profile";

/* the time in delhi, ticking. it only exists in the browser, so the page
   renders a quiet placeholder first and the real time after mount */

const DELHI_OFFSET_MIN = 330;
const TICK_MS = 1000;

const format = new Intl.DateTimeFormat("en-IN", {
	hour: "numeric",
	hour12: true,
	minute: "2-digit",
	timeZone: PERSON.timeZone,
});
const seconds = new Intl.DateTimeFormat("en-GB", {
	second: "2-digit",
	timeZone: PERSON.timeZone,
});

/** "5h 30m ahead of you", from the visitor's own offset */
const gapFrom = (date: Date) => {
	const local = -date.getTimezoneOffset();
	const gap = DELHI_OFFSET_MIN - local;
	if (gap === 0) {
		return "the same time as you";
	}
	const abs = Math.abs(gap);
	const hours = Math.floor(abs / 60);
	const minutes = abs % 60;
	const parts = [hours ? `${hours}h` : "", minutes ? `${minutes}m` : ""]
		.filter(Boolean)
		.join(" ");
	return `${parts} ${gap > 0 ? "ahead of" : "behind"} you`;
};

export function Clock() {
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		setNow(new Date());
		const timer = window.setInterval(() => setNow(new Date()), TICK_MS);
		return () => window.clearInterval(timer);
	}, []);

	const time = now ? format.format(now).toLowerCase() : "--:--";
	const [clock, meridiem] = time.split(" ");

	return (
		<div className="clock">
			<p className="kicker">the time in delhi</p>
			<p className="clock-time">
				<time dateTime={now?.toISOString()}>
					{clock}
					{meridiem ? (
						<span className="clock-meridiem"> {meridiem}</span>
					) : null}
				</time>
				<span aria-hidden="true" className="clock-seconds">
					{now ? `:${seconds.format(now).padStart(2, "0")}` : ""}
				</span>
			</p>
			<p className="clock-note">
				ist · utc+5:30{now ? ` · ${gapFrom(now)}` : ""}
			</p>
		</div>
	);
}
