import { getWork, type WorkFrontmatter } from "@/lib/work";
import { workSource } from "@/lib/source";
import { renderOg } from "../../_lib/render";
import { parseVariant } from "../../_lib/variant";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

function formatRange(start: Date, end?: Date | null) {
  const fmt = (d: Date) =>
    d.toLocaleString("default", { month: "short", year: "numeric" }).toLowerCase();
  return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const variant = parseVariant(new URL(request.url).searchParams.get("v"));
  const page = getWork(slug);
  if (!page) {
    return renderOg({ kind: "work", variant });
  }
  const fm = page.data as WorkFrontmatter;
  const range = formatRange(new Date(fm.startDate), fm.endDate ? new Date(fm.endDate) : undefined);
  const meta = fm.role ? `${fm.role} · ${range}` : range;
  return renderOg({ kind: "work", title: fm.title, meta, variant });
}

export async function generateStaticParams() {
  return workSource.generateParams().map(({ slug }) => ({
    slug: slug?.[0] ?? "",
  }));
}
