/* the lab is served from stormej.me/experiments, so next.config sets a
   basePath. next/link and the router add it on their own; anything else that
   takes a url (plain <a>, <img>, <video>, <track>, next/image, new Image())
   needs it added with withBase */

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** "/strip/work" → "/experiments/strip/work". leaves external urls alone */
export const withBase = (path: string) =>
	path.startsWith("/") && !path.startsWith("//") ? `${BASE_PATH}${path}` : path;

/** where the index of every experiment lives */
export const LAB_INDEX = "/lab";
