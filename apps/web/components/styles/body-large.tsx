export default function BodyLarge({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	return (
		<p
			className={`${className}font-light text-base text-foreground leading-6 opacity-85`}
		>
			{text}
		</p>
	);
}
