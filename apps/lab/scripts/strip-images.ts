import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PLAYABLE_REELS, PORTRAITS, PROJECTS } from "../lib/profile";

const app = fileURLToPath(new URL("../", import.meta.url));
const media = join(app, "public/media");
const output = join(media, "strip");
const manifestPath = join(app, "lib/strip-images.json");
const THUMBNAIL_WIDTH = 320;

interface ImageAsset {
	preview: string;
	sources: { src: string; width: number }[];
}

const sources = new Set([
	"/media/bullzeye_light.webp",
	"/media/fpv_light.webp",
	"/media/team-black-box.webp",
	...PLAYABLE_REELS.map((reel) => reel.cover),
	...Object.values(PORTRAITS).map((portrait) => portrait.src),
	...PROJECTS.flatMap((project) => [
		...(project.image ? [project.image] : []),
		...(project.shots?.map((shot) => shot.src) ?? []),
	]),
]);

const directories = await Promise.all(
	["fpv-labs", "digital-domi", "merlin", "zuai"].map(async (company) => {
		const directory = `cases/${company}`;
		return { directory, files: await readdir(join(media, directory)) };
	})
);
for (const { directory, files } of directories) {
	for (const file of files) {
		if (file.endsWith(".webp")) {
			sources.add(`/media/${directory}/${file}`);
		}
	}
}

await mkdir(output, { recursive: true });

const generateImage = async (src: string): Promise<ImageAsset> => {
	const original = await readFile(join(app, "public", src));
	const image = sharp(original);
	const { width } = await image.metadata();
	if (!width) {
		throw new Error(`Missing image width: ${src}`);
	}
	const preview = await image
		.clone()
		.resize({ width: 24, withoutEnlargement: true })
		.webp({ quality: 45 })
		.toBuffer();
	const variants = [{ src, width }];
	if (width > THUMBNAIL_WIDTH) {
		const thumbnail = await image
			.clone()
			.resize({ width: THUMBNAIL_WIDTH })
			.webp({ quality: 76 })
			.toBuffer();
		if (thumbnail.length < original.length) {
			const hash = createHash("sha256")
				.update(thumbnail)
				.digest("hex")
				.slice(0, 16);
			const filename = `${hash}.webp`;
			await writeFile(join(output, filename), thumbnail);
			variants.unshift({
				src: `/media/strip/${filename}`,
				width: THUMBNAIL_WIDTH,
			});
		}
	}
	return {
		preview: `data:image/webp;base64,${preview.toString("base64")}`,
		sources: variants,
	};
};

const manifest: Record<string, ImageAsset> = {};
for (const src of [...sources].sort()) {
	// biome-ignore lint/performance/noAwaitInLoops: process images serially to bound native image decoding memory
	manifest[src] = await generateImage(src);
}

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
