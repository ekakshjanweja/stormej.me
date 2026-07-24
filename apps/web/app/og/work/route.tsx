import { renderOg } from "../_lib/render";
import { parseVariant } from "../_lib/variant";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return renderOg({
    kind: "work",
    title: searchParams.get("title"),
    meta: searchParams.get("meta"),
    variant: parseVariant(searchParams.get("v")),
  });
}
