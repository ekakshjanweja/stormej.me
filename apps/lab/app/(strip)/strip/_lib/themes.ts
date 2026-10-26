/* the strip's two settings, chosen apart: a colour palette (the original
   sage, cobalt, the reference's dusk, and violet) and a type style (the original
   serif, or the reference's grotesk). the colours and faces themselves live
   in themes.css and type.css; these are their names, in the order the
   picker lists them */

export const THEMES = [
	{ id: "sage", name: "sage" },
	{ id: "cobalt", name: "cobalt" },
	{ id: "dusk", name: "dusk" },
	{ id: "violet", name: "violet" },
] as const;

export const TYPES = [
	{ id: "serif", name: "serif" },
	{ id: "grotesk", name: "grotesk" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type TypeId = (typeof TYPES)[number]["id"];

export const THEME_KEY = "strip:theme";
export const TYPE_KEY = "strip:type";

export const isTheme = (value: unknown): value is ThemeId =>
	THEMES.some((theme) => theme.id === value);

export const isType = (value: unknown): value is TypeId =>
	TYPES.some((type) => type.id === value);

/* until someone chooses, every visit opens as cobalt with the serif */
export const DEFAULT_THEME: ThemeId = "cobalt";
export const DEFAULT_TYPE: TypeId = "serif";

const THEME_IDS = JSON.stringify(THEMES.map((theme) => theme.id));
const TYPE_IDS = JSON.stringify(TYPES.map((type) => type.id));

/* runs before first paint (inline in the layout), so the page never flashes
   one look and then another. ?theme=violet or ?type=grotesk in the url picks
   one too, and sticks. a saved choice that's no longer offered falls back to
   the default, which is set first so blocked storage still gets it */
export const THEME_GATE = `var d=document.documentElement;d.dataset.theme="${DEFAULT_THEME}";d.dataset.type="${DEFAULT_TYPE}";try{var u=new URLSearchParams(location.search),s=localStorage,th=${THEME_IDS},ty=${TYPE_IDS},q=u.get("theme"),r=u.get("type");if(q&&th.indexOf(q)>-1){s.setItem("${THEME_KEY}",q)}if(r&&ty.indexOf(r)>-1){s.setItem("${TYPE_KEY}",r)}var t=s.getItem("${THEME_KEY}"),y=s.getItem("${TYPE_KEY}");if(t&&th.indexOf(t)>-1){d.dataset.theme=t}if(y&&ty.indexOf(y)>-1){d.dataset.type=y}}catch(e){}`;
