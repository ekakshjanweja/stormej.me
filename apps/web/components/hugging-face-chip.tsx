import { HuggingFace } from "@/components/ui/svgs/hugging-face";
import {
	formatDownloads,
	formatDownloadsCompact,
	type HuggingFaceRepoType,
} from "@/lib/huggingface";
import { cn } from "@/lib/utils";

interface HuggingFaceChipProps {
	className?: string;
	/** compact renders 170k, exact renders 169,651 */
	compact?: boolean;
	downloads?: number;
	/** repo id, only used for the accessible name */
	label?: string;
	onClick?: () => void;
	type?: HuggingFaceRepoType;
	url: string;
}

export const HuggingFaceChip = ({
	className,
	compact = false,
	downloads,
	label,
	onClick,
	type = "dataset",
	url,
}: HuggingFaceChipProps) => {
	const count =
		downloads === undefined
			? null
			: (compact ? formatDownloadsCompact : formatDownloads)(downloads);

	const text = count === null ? type : `${type} · ${count} downloads`;

	// the visible text is terse, so the link spells out its destination
	const ariaLabel =
		count === null
			? `${label ?? type} on Hugging Face`
			: `${type}: ${formatDownloads(downloads ?? 0)} downloads on Hugging Face${label ? ` (${label})` : ""}`;

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
				{text}
			</span>
		</a>
	);
};
