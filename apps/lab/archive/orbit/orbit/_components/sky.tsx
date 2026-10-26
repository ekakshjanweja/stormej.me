import { seeded } from "@/lib/motion";
import { WORLDS, type WorldId } from "../_lib/content";

/* the world behind and in front of the ring, drawn rather than painted:
   a sage morning going gold, svg clouds roughened by turbulence, leaves on
   the wind, a few kites. every layer carries data-depth so the stage can
   drift it with the pointer */

interface Puff {
	r: number;
	x: number;
	y: number;
}

const buildBank = (
	seed: number,
	count: number,
	options: { y: [number, number]; r: [number, number]; spread: number }
): Puff[] => {
	const rand = seeded(seed);
	const puffs: Puff[] = [];
	for (let i = 0; i < count; i += 1) {
		const t = i / (count - 1);
		puffs.push({
			r: options.r[0] + rand() * (options.r[1] - options.r[0]),
			x: -80 + t * 1760 + (rand() - 0.5) * options.spread,
			y: options.y[0] + rand() * (options.y[1] - options.y[0]),
		});
	}
	return puffs;
};

/* the bank the ring sinks into, and a second row behind it */
const FRONT_BANK = buildBank(11, 22, {
	r: [90, 170],
	spread: 60,
	y: [760, 880],
});
const MID_BANK = buildBank(23, 16, { r: [70, 130], spread: 90, y: [690, 780] });

interface Wisp {
	h: number;
	o: number;
	w: number;
	x: number;
	y: number;
}

const WISPS: Wisp[] = [
	{ h: 34, o: 0.55, w: 420, x: 180, y: 150 },
	{ h: 26, o: 0.4, w: 300, x: 520, y: 110 },
	{ h: 40, o: 0.5, w: 520, x: 1180, y: 190 },
	{ h: 22, o: 0.35, w: 260, x: 1420, y: 120 },
	{ h: 30, o: 0.45, w: 380, x: 880, y: 260 },
	{ h: 18, o: 0.3, w: 240, x: 300, y: 330 },
];

interface Drifter {
	color: string;
	delay: number;
	duration: number;
	flip: boolean;
	left: number;
	size: number;
	top: number;
}

const LEAF_COLORS = ["#6f8f6a", "#8aa57e", "#a9b98f", "#d9b464", "#c9d1a6"];

const scatter = (seed: number, count: number, size: [number, number]) => {
	const rand = seeded(seed);
	return Array.from(
		{ length: count },
		(): Drifter => ({
			color: LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)] ?? "#8aa57e",
			delay: -rand() * 28,
			duration: 22 + rand() * 14,
			flip: rand() > 0.5,
			left: rand() * 100,
			size: size[0] + rand() * (size[1] - size[0]),
			top: rand() * 70,
		})
	);
};

const LEAVES_BACK = scatter(5, 7, [6, 10]);
const LEAVES_FRONT = scatter(9, 9, [12, 20]);

const MOTES = (() => {
	const rand = seeded(17);
	return Array.from({ length: 16 }, () => ({
		delay: -rand() * 16,
		left: 8 + rand() * 84,
		size: 3 + rand() * 5,
		top: 40 + rand() * 50,
	}));
})();

interface KiteSpot {
	left: number;
	scale: number;
	top: number;
	world: WorldId;
}

const KITES: KiteSpot[] = [
	{ left: 14, scale: 1, top: 16, world: "work" },
	{ left: 79, scale: 0.75, top: 11, world: "build" },
	{ left: 63, scale: 0.55, top: 27, world: "write" },
];

/* in a world's own sky its kite flies close and the other two are far off */
const bandKites = (world: WorldId): KiteSpot[] => {
	const others = (["work", "build", "write"] as const).filter(
		(id) => id !== world
	);
	return [
		{ left: 9, scale: 1.25, top: 14, world },
		{ left: 47, scale: 0.5, top: 9, world: others[0] },
		{ left: 33, scale: 0.38, top: 24, world: others[1] },
	];
};

function Kite({ color }: { color: string }) {
	return (
		<svg aria-hidden="true" className="kite-svg" viewBox="0 0 40 90">
			<path
				d="M20 2 L36 20 L20 42 L4 20 Z"
				fill={color}
				stroke="rgba(26,29,26,.35)"
				strokeWidth="0.8"
			/>
			<path
				d="M20 2 L20 42 M4 20 L36 20"
				stroke="rgba(255,255,255,.55)"
				strokeWidth="0.9"
			/>
			<path
				className="kite-tail"
				d="M20 42 C 14 52, 26 60, 20 70 S 14 84, 20 90"
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeWidth="1.4"
			/>
		</svg>
	);
}

function SkyLayer() {
	return (
		<div className="sky-layer" data-depth="10">
			<div className="sky-sun" />
			<svg
				aria-hidden="true"
				className="sky-wisps"
				preserveAspectRatio="xMidYMid slice"
				viewBox="0 0 1600 900"
			>
				<defs>
					<filter height="300%" id="wisp" width="160%" x="-30%" y="-100%">
						<feTurbulence
							baseFrequency="0.006 0.04"
							numOctaves="3"
							seed="4"
							type="fractalNoise"
						/>
						<feDisplacementMap
							in="SourceGraphic"
							scale="60"
							xChannelSelector="R"
							yChannelSelector="G"
						/>
						<feGaussianBlur stdDeviation="9" />
					</filter>
				</defs>
				<g filter="url(#wisp)">
					{WISPS.map((wisp) => (
						<ellipse
							cx={wisp.x}
							cy={wisp.y}
							fill="#fffaf0"
							key={`${wisp.x}-${wisp.y}`}
							opacity={wisp.o}
							rx={wisp.w / 2}
							ry={wisp.h / 2}
						/>
					))}
				</g>
			</svg>
		</div>
	);
}

function Kites({ spots }: { spots: KiteSpot[] }) {
	return (
		<div className="kites" data-depth="16">
			{spots.map((kite, index) => (
				<span
					className="kite"
					key={kite.world}
					style={
						{
							"--kite-delay": `${index * -2.7}s`,
							"--kite-scale": kite.scale,
							left: `${kite.left}%`,
							top: `${kite.top}%`,
						} as React.CSSProperties
					}
				>
					<Kite color={WORLDS[kite.world].color} />
				</span>
			))}
		</div>
	);
}

function BackLeaves() {
	return (
		<div className="leaves" data-depth="20">
			{LEAVES_BACK.map((leaf) => (
				<Leaf key={`${leaf.left}-${leaf.top}`} leaf={leaf} />
			))}
		</div>
	);
}

/** the sky, the distant wisps, the kites and the far leaves */
export function SkyBack() {
	return (
		<div aria-hidden className="world-view">
			<SkyLayer />
			<Kites spots={KITES} />
			<BackLeaves />
		</div>
	);
}

function Leaf({ leaf }: { leaf: Drifter }) {
	return (
		<span
			className="leaf"
			data-flip={leaf.flip || undefined}
			style={{
				animationDelay: `${leaf.delay}s`,
				animationDuration: `${leaf.duration}s`,
				background: leaf.color,
				height: leaf.size * 0.62,
				left: `${leaf.left}%`,
				top: `${leaf.top}%`,
				width: leaf.size,
			}}
		/>
	);
}

function Bank({
	filter,
	puffs,
	shade,
	body,
	light,
}: {
	filter: string;
	puffs: Puff[];
	shade: string;
	body: string;
	light: string;
}) {
	return (
		<g filter={`url(#${filter})`}>
			{/* three passes: shadow under, body, sunlit tops */}
			{puffs.map((puff) => (
				<circle
					cx={puff.x}
					cy={puff.y + puff.r * 0.28}
					fill={shade}
					key={`s-${puff.x}`}
					r={puff.r}
				/>
			))}
			{puffs.map((puff) => (
				<circle
					cx={puff.x}
					cy={puff.y}
					fill={body}
					key={`b-${puff.x}`}
					r={puff.r * 0.94}
				/>
			))}
			{puffs.map((puff) => (
				<circle
					cx={puff.x + puff.r * 0.18}
					cy={puff.y - puff.r * 0.3}
					fill={light}
					key={`l-${puff.x}`}
					r={puff.r * 0.55}
				/>
			))}
		</g>
	);
}

function Clouds({ rise }: { rise: boolean }) {
	return (
		<div
			className={rise ? "cloud-layer cloud-rise" : "cloud-layer"}
			data-depth="28"
		>
			<svg
				aria-hidden="true"
				preserveAspectRatio="xMidYMax slice"
				viewBox="0 0 1600 900"
			>
				<defs>
					<filter height="160%" id="cloud" width="130%" x="-15%" y="-30%">
						<feTurbulence
							baseFrequency="0.012 0.02"
							numOctaves="4"
							seed="8"
							type="fractalNoise"
						/>
						<feDisplacementMap
							in="SourceGraphic"
							scale="46"
							xChannelSelector="R"
							yChannelSelector="B"
						/>
						<feGaussianBlur stdDeviation="2.4" />
					</filter>
					<linearGradient id="cloud-fade" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0.55" stopColor="#f7efe0" stopOpacity="0" />
						<stop offset="1" stopColor="#f7efe0" stopOpacity="0.9" />
					</linearGradient>
				</defs>
				<Bank
					body="#f1ebdc"
					filter="cloud"
					light="#fff8e8"
					puffs={MID_BANK}
					shade="#c8cdbb"
				/>
				<Bank
					body="#fbf6ea"
					filter="cloud"
					light="#fffdf6"
					puffs={FRONT_BANK}
					shade="#d5d3c2"
				/>
				<rect fill="url(#cloud-fade)" height="900" width="1600" />
			</svg>
		</div>
	);
}

function NearLight() {
	return (
		<>
			<div className="leaves" data-depth="36">
				{LEAVES_FRONT.map((leaf) => (
					<Leaf key={`${leaf.left}-${leaf.top}`} leaf={leaf} />
				))}
			</div>
			<div className="motes" data-depth="44">
				{MOTES.map((mote) => (
					<span
						className="mote"
						key={`${mote.left}-${mote.top}`}
						style={{
							animationDelay: `${mote.delay}s`,
							height: mote.size,
							left: `${mote.left}%`,
							top: `${mote.top}%`,
							width: mote.size,
						}}
					/>
				))}
			</div>
		</>
	);
}

/** the cloud bank in front of the ring, near leaves and floating light */
export function SkyFront() {
	return (
		<div aria-hidden className="world-view world-front">
			<Clouds rise />
			<NearLight />
		</div>
	);
}

/** a window of the same sky for the other pages, tinted toward a world.
 *  whatever hangs in it goes between the far sky and the near clouds */
export function SkyBand({
	children,
	world,
}: {
	children?: React.ReactNode;
	world?: WorldId | null;
}) {
	return (
		<>
			<div aria-hidden className="world-view band-view">
				<SkyLayer />
				<Kites spots={world ? bandKites(world) : KITES} />
				<BackLeaves />
			</div>
			{children}
			<div aria-hidden className="world-view world-front band-view">
				<Clouds rise />
				<NearLight />
			</div>
		</>
	);
}
