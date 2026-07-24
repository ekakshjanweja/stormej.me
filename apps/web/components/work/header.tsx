import { ArrowUpRight } from "lucide-react";
import { LogoTile } from "@/components/logo-tile";
import { StoreLinks } from "@/components/mdx/store-links";
import { LinkPreview } from "@/components/ui/link-preview";
import type { WorkFrontmatter } from "@/lib/work";

interface HeaderProps {
	endDate?: Date;
	fm: WorkFrontmatter;
	formatRange: (start: Date, end?: Date | null) => string;
	startDate: Date;
}

function StickyTitleRow({ fm }: { fm: WorkFrontmatter }) {
	if (!(fm.website || fm.appStore || fm.playStore || fm.logo || fm.title)) {
		return null;
	}
	return (
		<div className="sticky top-16 z-20 -mx-2 mb-6 overflow-visible bg-background/85 px-2 py-3 backdrop-blur-md">
			<div className="flex flex-col gap-4 overflow-visible sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4">
				<div className="flex min-w-0 flex-1 items-center gap-3">
					{fm.logo && <LogoTile boxClassName="h-9 w-9" src={fm.logo} />}
					{fm.website ? (
						<h1 className="headline m-0 min-w-0 flex-1 text-[clamp(22px,2.4vw,30px)]">
							<LinkPreview
								className="inline-flex min-w-0 items-center gap-2 font-serif italic"
								url={fm.website}
							>
								<span className="squiggle-link min-w-0 [overflow-wrap:anywhere]">
									{fm.title}
								</span>
								<ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
							</LinkPreview>
						</h1>
					) : (
						<h1 className="headline text-[clamp(22px,2.4vw,30px)]">
							{fm.title}
						</h1>
					)}
				</div>
				{(fm.appStore || fm.playStore) && (
					<div className="flex shrink-0 items-center sm:justify-end">
						<StoreLinks
							appStore={fm.appStore ? { href: fm.appStore } : undefined}
							className="my-0"
							playStore={fm.playStore ? { href: fm.playStore } : undefined}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

function MetaCell({ label, value }: { label: string; value: string }) {
	return (
		<div className="space-y-1">
			<dt className="meta-tag">{label}</dt>
			<dd className="font-light text-[13px] text-foreground">{value}</dd>
		</div>
	);
}

export function WorkCaseStudyHeader({
	fm,
	startDate,
	endDate,
	formatRange,
}: HeaderProps) {
	return (
		<>
			<StickyTitleRow fm={fm} />
			<header className="mb-10 space-y-5">
				{fm.challenge && (
					<p className="max-w-[60ch] font-light text-[15px] text-foreground leading-[1.6]">
						{fm.challenge}
					</p>
				)}

				<dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-border/70 border-y py-4 sm:grid-cols-3">
					<MetaCell label="role" value={fm.role} />
					<MetaCell label="timeline" value={formatRange(startDate, endDate)} />
					<MetaCell label="stack" value={fm.tech.join(" · ")} />
				</dl>
			</header>
		</>
	);
}

export function WorkDefaultHeader({
	fm,
	startDate,
	endDate,
	formatRange,
}: HeaderProps) {
	return (
		<>
			<StickyTitleRow fm={fm} />
			<header className="mb-10 space-y-4">
				<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<span className="font-light text-[14px] text-foreground">
						{fm.role}
					</span>
					<span className="meta-tag">{formatRange(startDate, endDate)}</span>
				</div>

				{fm.description && (
					<p className="font-light text-[14px] text-muted-foreground leading-[1.6]">
						{fm.description}
					</p>
				)}

				{fm.tech.length > 0 && (
					<p className="meta-tag">{fm.tech.join(" · ")}</p>
				)}
			</header>
		</>
	);
}
