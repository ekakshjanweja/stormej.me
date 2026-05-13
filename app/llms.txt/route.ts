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
