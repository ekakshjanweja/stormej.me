import { HuggingFace } from "@/components/ui/svgs/hugging-face";
import { formatDownloads, formatDownloadsCompact } from "@/lib/huggingface";
import { cn } from "@/lib/utils";

interface HuggingFaceChipProps {
	className?: string;
	/** compact renders 170k, exact renders 169,651 */
	compact?: boolean;
	downloads?: number;
	label?: string;
	onClick?: () => void;
	url: string;
}

export const HuggingFaceChip = ({
	className,
	compact = false,
	downloads,
	label,
	onClick,
	url,
}: HuggingFaceChipProps) => {
	const count =
		downloads === undefined
			? null
			: (compact ? formatDownloadsCompact : formatDownloads)(downloads);

	// the visible text is just a number, so the link needs its destination spelled out
	const ariaLabel = count
		? `${formatDownloads(downloads ?? 0)} downloads on Hugging Face${label ? `: ${label}` : ""}`
		: `${label ?? "dataset"} on Hugging Face`;

	return (
		<a
			aria-label={ariaLabel}
			className={cn(
				"group/hf inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 transition-colors",
				"hover:border-[var(--text-highlight)]/50 hover:bg-[var(--text-highlight)]/8",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
				className
			)}
			href={url}
			onClick={onClick}
			rel="noreferrer"
			target="_blank"
		>
			<HuggingFace aria-hidden className="h-3.5 w-auto shrink-0" />
			<span className="meta-tag whitespace-nowrap transition-colors group-hover/hf:text-[var(--text-highlight)]">
				{count === null ? (label ?? "hugging face") : `${count} downloads`}
			</span>
		</a>
	);
};
