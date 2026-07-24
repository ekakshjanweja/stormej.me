import { listBlogs } from "@/lib/blog";
import { listProjects } from "@/lib/projects";
import { listTrove } from "@/lib/trove";
import { TROVE_ENABLED } from "@/lib/trove-config";
import { listWork } from "@/lib/work";

const SITE = "https://www.stormej.me";

function formatRange(start: Date, end?: Date | null) {
	const fmt = (d: Date) =>
		d
			.toLocaleString("default", { month: "short", year: "numeric" })
			.toLowerCase();
	return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

function workLines() {
	return listWork().map((w) => {
		const range = formatRange(w.startDate, w.endDate);
		const tail = w.description ? ` — ${w.description}` : "";
		return `- [${w.title}](${SITE}${w.url}): ${w.role}, ${range}${tail}`;
	});
}

function projectLines() {
	return listProjects()
		.filter((p) => !p.hidden)
		.map((p) => {
			const desc = p.description ?? p.subtitle ?? "";
			return `- [${p.title}](${SITE}${p.url})${desc ? `: ${desc}` : ""}`;
		});
}

function blogLines() {
	return listBlogs().map((b) => {
		const desc = b.description ?? "";
		const date = b.formattedDate ? ` (${b.formattedDate})` : "";
		return `- [${b.title}](${SITE}${b.url})${desc ? `: ${desc}` : ""}${date}`;
	});
}

function troveLines() {
	const trove = listTrove();
	if (trove.length === 0) {
		return [];
	}

	const lines = [
		"## trove",
		"> flutter stuff i actually use. copy one file, ship.",
		"> each entry has a plain text version at <url>/llms.txt with the full source inlined.",
	];
	for (const t of trove) {
		const desc = t.description ?? t.subtitle ?? "";
		const src = t.sourceFile ? ` [${t.sourceFile}]` : "";
		lines.push(
			`- [${t.title}](${SITE}${t.url})${src}${desc ? `: ${desc}` : ""}`
		);
		lines.push(`  full source: ${SITE}${t.url}/llms.txt`);
	}
	lines.push("");
	return lines;
}

export function GET() {
	const lines: string[] = [];

	lines.push("# stormej.me — ekaksh janweja");
	lines.push("");
	lines.push(
		"> mobile developer (flutter, dart, ios, android) building products at early-stage startups."
	);
	lines.push(
		"> currently building ar data capture systems at fpv labs (arkit, arcore, sensor pipelines)."
	);
	lines.push(
		"> based in new delhi, india. writes about mobile development, large file uploads, and shipping apps."
	);
	lines.push(
		"> reach: jekaksh@gmail.com · https://twitter.com/ekaksh_janweja · https://github.com/ekakshjanweja"
	);
	lines.push("");

	lines.push("## skills");
	lines.push("- mobile: flutter, dart, ios, android");
	lines.push("- ar: arkit, arcore, ar data capture (camera, imu, lidar)");
	lines.push("- state & data: riverpod, firebase, rest apis, sqlite");
	lines.push("- uploads: resumable / multipart / background uploads");
	lines.push("- web: typescript, next.js, cloudflare workers, bun");
	lines.push("- other: react native");
	lines.push("");

	lines.push("## work", ...workLines(), "");
	lines.push("## projects", ...projectLines(), "");
	lines.push("## writing", ...blogLines(), "");
	lines.push(...troveLines());

	lines.push("## pages");
	lines.push(`- [home](${SITE}/): bio, recent work, recent writing`);
	lines.push(`- [work](${SITE}/work): roles and case studies`);
	lines.push(`- [projects](${SITE}/projects): side projects and experiments`);
	lines.push(`- [blog](${SITE}/blog): writing on mobile development`);
	if (TROVE_ENABLED) {
		lines.push(
			`- [trove](${SITE}/trove): flutter code you can copy into a project`
		);
	}
	lines.push(`- [gear](${SITE}/gear): hardware setup`);
	lines.push("");

	const body = lines.join("\n");
	return new Response(body, {
		headers: {
			"cache-control": "public, max-age=0, s-maxage=3600",
			"content-type": "text/plain; charset=utf-8",
		},
	});
}
