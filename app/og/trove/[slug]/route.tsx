import { troveSource } from "@/lib/source";
import { isTroveSlugEnabled } from "@/lib/trove-config";
import { renderOg } from "../../_lib/render";
import { parseVariant } from "../../_lib/variant";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const variant = parseVariant(new URL(request.url).searchParams.get("v"));
  const page = troveSource.getPage([slug]);
  // A disabled entry falls back to the generic card rather than 404ing, so any
  // link already shared keeps rendering something.
  if (!page || !isTroveSlugEnabled(slug)) {
    return renderOg({ kind: "trove", variant });
  }
  const { title, tech, sourceFile } = page.data as {
    title: string;
    tech?: string[];
    sourceFile?: string;
  };
  const meta = [sourceFile, ...(tech ?? [])].filter(Boolean).join(" · ");
  return renderOg({ kind: "trove", title, meta: meta || undefined, variant });
}

export async function generateStaticParams() {
  return troveSource
    .generateParams()
    .map(({ slug }) => ({ slug: slug?.[0] ?? "" }))
    .filter(({ slug }) => isTroveSlugEnabled(slug));
}
