"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

function formatIST(date: Date) {
	return new Intl.DateTimeFormat("en-IN", {
		hour: "2-digit",
		hour12: false,
		minute: "2-digit",
		second: "2-digit",
		timeZone: "Asia/Kolkata",
	}).format(date);
}

export function DelhiPin() {
	const [time, setTime] = useState<string | null>(null);

	useEffect(() => {
		const tick = () => setTime(formatIST(new Date()));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, []);

	return (
		<TooltipProvider delayDuration={120}>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="group inline-flex cursor-default items-center gap-1 rounded-sm transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2">
						<MapPin
							aria-hidden
							className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5"
						/>
						new delhi
					</span>
				</TooltipTrigger>
				<TooltipContent
					align="end"
					className="font-light text-xs leading-relaxed"
					side="top"
				>
					<div className="flex flex-col gap-0.5">
						<span className="font-mono tabular-nums">
							{time ?? "--:--:--"} IST
						</span>
						<span className="text-muted-foreground">28.61° N, 77.21° E</span>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
