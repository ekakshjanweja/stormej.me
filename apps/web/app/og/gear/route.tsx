import { renderOg } from "../_lib/render";
import { parseVariant } from "../_lib/variant";

export const runtime = "edge";

export function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	return renderOg({
		kind: "gear",
		meta: searchParams.get("meta"),
		title: searchParams.get("title"),
		variant: parseVariant(searchParams.get("v")),
	});
}
