import { readFile } from "node:fs/promises";
import path from "node:path";
import { troveSource } from "@/lib/source";
import { isTroveSlugEnabled } from "@/lib/trove-config";

const SITE = "https://www.stormej.me";

// JSX components used in trove mdx. Their tags carry no meaning for an agent,
// but the prose and code inside them does, so strip only the tag lines.
const COMPONENT_TAG =
	/^\s*<\/?(FlutterDemo|CopyFile|Steps|Step|Callout|Accordions|Accordion|Cards|Card)\b[^>]*\/?>\s*$/;

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;
const BLANK_LINES = /\n{3,}/g;

function toPlainMarkdown(raw: string) {
	const withoutFrontmatter = raw.replace(FRONTMATTER, "");
	return withoutFrontmatter
		.split("\n")
		.filter((line) => !COMPONENT_TAG.test(line))
		.join("\n")
		.replace(BLANK_LINES, "\n\n")
		.trim();
}

export function generateStaticParams() {
	return troveSource
		.generateParams()
		.map(({ slug }) => ({ slug: slug?.[0] ?? "" }))
		.filter(({ slug }) => isTroveSlugEnabled(slug));
}

export async function GET(
	_request: Request,
	context: { params: Promise<{ slug: string }> }
) {
	const { slug } = await context.params;
	const page = troveSource.getPage([slug]);
	if (!(page && isTroveSlugEnabled(slug))) {
		return new Response("not found", { status: 404 });
	}

	const data = page.data as {
		title: string;
		description?: string;
		sourceFile?: string;
		tech?: string[];
		orchestrator?: boolean;
	};

	const file = path.join(process.cwd(), "content", "trove", `${slug}.mdx`);
	const body = toPlainMarkdown(await readFile(file, "utf-8"));

	const target = data.sourceFile ?? "a new file in the project";
	const steps = data.orchestrator
		? [
				"1. inspect the host repository before changing anything. preserve its",
				"   existing naming, state-management, auth, and environment conventions",
				"   unless this document explicitly asks you to add the missing piece.",
				"2. implement the architecture and files described below. use the package",
				"   versions and generated-code commands that are compatible with the host",
				"   project's current Flutter/Dart SDK.",
				"3. keep the first pass schema-free: create the Drift database and its",
				"   migration hook, but do not invent product tables or domain logic.",
				"4. run code generation, formatting, static analysis, and the available",
				"   tests. fix errors introduced by this integration before finishing.",
				"5. report every file changed, every command run, and any platform setup",
				"   that still needs a human decision.",
			]
		: [
				`1. create ${target} and copy the source from the end of this file into it,`,
				"   verbatim. do not reformat, rename, or refactor it.",
				"2. add no dependencies. this component depends only on the sdk, so nothing",
				"   goes into pubspec.yaml.",
				'3. follow the "install" section below to wire it up. it is the setup the',
				"   author actually uses, so prefer it over improvising.",
				"4. where the docs conflict with conventions already present in the host",
				"   codebase, match the host codebase.",
				'5. verify with an example from the "usage" section below.',
			];

	// Addressed to the agent, not the reader. Anything that fetches this url
	// should know what to do without a separate prompt.
	const header = [
		`# ${data.title}`,
		"",
		data.description ?? null,
		"",
		"## task",
		"",
		"integrate this component into the user's codebase. the complete",
		"implementation is at the end of this file. everything you need is here.",
		"",
		"## steps",
		"",
		...steps,
		"",
		"## constraints",
		"",
		"- do not vendor this into a package or split it across files. it is",
		"  designed to be one file.",
		"- do not silently change the public api. if the user needs a different",
		"  api, say so rather than editing the source.",
		"",
		"## reference",
		"",
		`human readable version: ${SITE}/trove/${slug}`,
		data.tech?.length ? `stack: ${data.tech.join(", ")}` : null,
		"",
		"the full api docs, behaviour notes, and source follow.",
		"",
		"---",
		"",
		"",
	]
		// Only drop the conditional entries; the empty strings are blank lines.
		.filter((line): line is string => line !== null)
		.join("\n");

	return new Response(`${header}${body}\n`, {
		headers: {
			"cache-control": "public, max-age=0, must-revalidate",
			"content-type": "text/plain; charset=utf-8",
		},
	});
}
