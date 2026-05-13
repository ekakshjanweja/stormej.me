import { listBlogs } from "@/lib/blog";
import { listProjects } from "@/lib/projects";
import { listWork } from "@/lib/work";

const SITE = "https://www.stormej.me";

function formatRange(start: Date, end?: Date | null) {
  const fmt = (d: Date) =>
    d
      .toLocaleString("default", { month: "short", year: "numeric" })
      .toLowerCase();
  return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

export async function GET() {
  const work = listWork();
  const projects = listProjects().filter((p) => !p.hidden);
  const blogs = listBlogs();

  const lines: string[] = [];

  lines.push("# stormej.me — ekaksh janweja");
  lines.push("");
  lines.push(
    "> mobile developer (flutter, dart, ios, android) building products at early-stage startups."
  );
  lines.push(
    "> based in new delhi, india. writes about mobile development, file uploads, dark/light mode, and shipping apps."
  );
  lines.push(
    "> Reach: jekaksh@gmail.com · https://twitter.com/ekaksh_janweja · https://github.com/ekakshjanweja"
  );
  lines.push("");

  lines.push("## work");
  for (const w of work) {
    const range = formatRange(w.startDate, w.endDate);
    const tail = w.description ? ` — ${w.description}` : "";
    lines.push(`- [${w.title}](${SITE}${w.url}): ${w.role}, ${range}${tail}`);
  }
  lines.push("");

  lines.push("## projects");
  for (const p of projects) {
    const desc = p.description ?? p.subtitle ?? "";
    lines.push(`- [${p.title}](${SITE}${p.url})${desc ? `: ${desc}` : ""}`);
  }
  lines.push("");

  lines.push("## writing");
  for (const b of blogs) {
    const desc = b.description ?? "";
    const date = b.formattedDate ? ` (${b.formattedDate})` : "";
    lines.push(
      `- [${b.title}](${SITE}${b.url})${desc ? `: ${desc}` : ""}${date}`
    );
  }
  lines.push("");

  lines.push("## pages");
  lines.push(`- [home](${SITE}/): bio, recent work, recent writing`);
  lines.push(`- [work](${SITE}/work): roles and case studies`);
  lines.push(`- [projects](${SITE}/projects): side projects and experiments`);
  lines.push(`- [blog](${SITE}/blog): writing on mobile development`);
  lines.push(`- [gear](${SITE}/gear): hardware setup`);
  lines.push("");

  const body = lines.join("\n");
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
