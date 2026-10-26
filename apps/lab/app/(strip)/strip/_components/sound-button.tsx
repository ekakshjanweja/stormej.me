"use client";

/* "sound on / off", with four little bars that dance while it's audible */
export function SoundButton({
	audible,
	label = "reel sound",
	onToggle,
	tone = "ink",
}: {
	audible: boolean;
	/** what the sound belongs to, for screen readers */
	label?: string;
	onToggle: () => void;
	tone?: "ink" | "paper";
}) {
	return (
		<button
			aria-label={label}
			aria-pressed={audible}
			className="sound"
			data-cursor="nav"
			data-tone={tone}
			onClick={onToggle}
			type="button"
		>
			<span aria-hidden="true" className="sound-bars" data-on={audible}>
				<span />
				<span />
				<span />
				<span />
			</span>
			{audible ? "sound on" : "sound off"}
		</button>
	);
}
