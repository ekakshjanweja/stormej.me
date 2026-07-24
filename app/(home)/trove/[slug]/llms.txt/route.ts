import { readFile } from "node:fs/promises";
import path from "node:path";
import { troveSource } from "@/lib/source";
import { isTroveSlugEnabled } from "@/lib/trove-config";

const SITE = "https://www.stormej.me";

// JSX components used in trove mdx. Their tags carry no meaning for an agent,
// but the prose and code inside them does, so strip only the tag lines.
const COMPONENT_TAG =
  /^\s*<\/?(FlutterDemo|CopyFile|Steps|Step|Callout|Accordions|Accordion|Cards|Card)\b[^>]*\/?>\s*$/;

function toPlainMarkdown(raw: string) {
  const withoutFrontmatter = raw.replace(/^---\n[\s\S]*?\n---\n/, "");
  return withoutFrontmatter
    .split("\n")
    .filter((line) => !COMPONENT_TAG.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function generateStaticParams() {
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
  if (!page || !isTroveSlugEnabled(slug))
    return new Response("not found", { status: 404 });

  const data = page.data as {
    title: string;
    description?: string;
    sourceFile?: string;
    tech?: string[];
  };

  const file = path.join(process.cwd(), "content", "trove", `${slug}.mdx`);
  const body = toPlainMarkdown(await readFile(file, "utf-8"));

  const target = data.sourceFile ?? "a new file in the project";

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
    `1. create ${target} and copy the source from the end of this file into it,`,
    "   verbatim. do not reformat, rename, or refactor it.",
    "2. add no dependencies. this component depends only on the sdk, so nothing",
    data.tech?.includes("flutter")
      ? "   goes into pubspec.yaml."
      : "   goes into the manifest.",
    '3. follow the "install" section below to wire it up. it is the setup the',
    "   author actually uses, so prefer it over improvising.",
    "4. where the docs conflict with conventions already in the host codebase,",
    "   match the host codebase.",
    '5. verify with an example from the "usage" section below.',
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
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
