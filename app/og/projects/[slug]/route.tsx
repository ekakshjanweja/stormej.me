import { getProject, type ProjectFrontmatter } from "@/lib/projects";
import { projectsSource } from "@/lib/source";
import { renderOg } from "../../_lib/render";
import { parseVariant } from "../../_lib/variant";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const variant = parseVariant(new URL(request.url).searchParams.get("v"));
  const page = getProject(slug);
  if (!page) {
    return renderOg({ kind: "projects", variant });
  }
  const fm = page.data as ProjectFrontmatter;
  return renderOg({ kind: "projects", title: fm.title, meta: fm.subtitle, variant });
}

export async function generateStaticParams() {
  return projectsSource.generateParams().map(({ slug }) => ({
    slug: slug?.[0] ?? "",
  }));
}
