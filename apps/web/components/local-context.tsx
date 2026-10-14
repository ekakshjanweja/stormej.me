"use client";

import {
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudLightning,
	CloudRain,
	CloudSnow,
	CloudSun,
	type LucideIcon,
	Moon,
	Sun,
} from "lucide-react";
import { useEffect, useState } from "react";

const TIME_ZONE = "Asia/Kolkata";
const CLOCK_TICK_MS = 15_000;
const WEATHER_URL =
	"https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.209&current=temperature_2m,weather_code,is_day&temperature_unit=celsius&timezone=Asia%2FKolkata&forecast_days=1";

interface Weather {
	code: number;
	isDay: boolean;
	temperature: number;
}

const formatTime = (date: Date) =>
	new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
		timeZone: TIME_ZONE,
	}).format(date);

/** wmo weather codes, as open-meteo reports them, grouped into what we can draw */
function describeWeather({ code, isDay }: Weather): {
	icon: LucideIcon;
	label: string;
} {
	if (code === 0) {
		return { icon: isDay ? Sun : Moon, label: "clear" };
	}
	if (code <= 2) {
		return { icon: isDay ? CloudSun : Cloud, label: "partly cloudy" };
	}
	if (code === 3) {
		return { icon: Cloud, label: "overcast" };
	}
	if (code <= 48) {
		return { icon: CloudFog, label: "fog" };
	}
	if (code <= 57) {
		return { icon: CloudDrizzle, label: "drizzle" };
	}
	if (code <= 67 || (code >= 80 && code <= 82)) {
		return { icon: CloudRain, label: "rain" };
	}
	if (code <= 86) {
		return { icon: CloudSnow, label: "snow" };
	}
	return { icon: CloudLightning, label: "thunderstorm" };
}

async function fetchWeather(signal: AbortSignal): Promise<Weather | null> {
	const response = await fetch(WEATHER_URL, { signal });
	if (!response.ok) {
		return null;
	}
	const body = (await response.json()) as {
		current?: {
			is_day?: number;
			temperature_2m?: number;
			weather_code?: number;
		};
	};
	const { current } = body;
	if (
		typeof current?.temperature_2m !== "number" ||
		typeof current.weather_code !== "number"
	) {
		return null;
	}
	return {
		code: current.weather_code,
		isDay: current.is_day === 1,
		temperature: Math.round(current.temperature_2m),
	};
}

function IndiaFlag() {
	return (
		<svg
			aria-label="India"
			className="local-context-flag"
			role="img"
			viewBox="0 0 18 12"
		>
			<rect fill="#ff9933" height="4" width="18" />
			<rect fill="#ffffff" height="4" width="18" y="4" />
			<rect fill="#138808" height="4" width="18" y="8" />
			<circle
				cx="9"
				cy="6"
				fill="none"
				r="1.5"
				stroke="#000080"
				strokeWidth="0.5"
			/>
		</svg>
	);
}

/** "1:15 AM · new delhi [flag] · [cloud] 21°C", live; see the letter navbar */
export function LocalContext() {
	const [time, setTime] = useState<string | null>(null);
	const [weather, setWeather] = useState<Weather | null>(null);

	useEffect(() => {
		const tick = () => setTime(formatTime(new Date()));
		tick();
		const id = setInterval(tick, CLOCK_TICK_MS);
		return () => clearInterval(id);
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		const load = async () => {
			try {
				setWeather(await fetchWeather(controller.signal));
			} catch {
				// no weather is fine; the time and place still read
			}
		};
		load();
		return () => controller.abort();
	}, []);

	const described = weather ? describeWeather(weather) : null;
	const WeatherIcon = described?.icon;

	return (
		<div className="local-context">
			<time suppressHydrationWarning>{time ?? "--:-- --"}</time>
			<span aria-hidden className="local-context-sep">
				·
			</span>
			<span className="local-context-place">
				<span>new delhi</span>
				<IndiaFlag />
			</span>
			{weather && WeatherIcon ? (
				<>
					<span aria-hidden className="local-context-sep">
						·
					</span>
					<span
						aria-label={`${described.label}, ${weather.temperature} degrees Celsius`}
						className="local-context-weather"
						role="img"
					>
						<WeatherIcon aria-hidden className="local-context-icon" />
						<span aria-hidden>{weather.temperature}°C</span>
					</span>
				</>
			) : null}
		</div>
	);
}
