import { source } from "@/lib/source";
import { renderOg } from "../../_lib/render";
import { parseVariant } from "../../_lib/variant";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const variant = parseVariant(new URL(request.url).searchParams.get("v"));
  const page = source.getPage([slug]);
  if (!page) {
    return renderOg({ kind: "blog", variant });
  }
  const { title, date } = page.data as { title: string; date?: string };
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : undefined;
  return renderOg({ kind: "blog", title, meta: formattedDate, variant });
}

export async function generateStaticParams() {
  return source.generateParams().map(({ slug }) => ({
    slug: slug?.[0] ?? "",
  }));
}
