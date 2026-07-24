"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ImageModal } from "@/components/image-modal";

interface ProjectImagesProps {
	images?: string[];
	title: string;
}

function ProjectImage({
	image,
	index,
	title,
	onSelect,
}: {
	image: string;
	index: number;
	title: string;
	onSelect: (selected: { src: string; alt: string }) => void;
}) {
	const alt = `${title} - Image ${index + 1}`;
	const src = `/${image}`;
	const select = useCallback(
		() => onSelect({ alt, src }),
		[alt, onSelect, src]
	);

	return (
		<button
			className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-border/40 transition-all duration-500 hover:border-highlight/30"
			onClick={select}
			type="button"
		>
			<Image
				alt={alt}
				className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
				height={600}
				src={src}
				width={800}
			/>
		</button>
	);
}

export function ProjectImages({ title, images }: ProjectImagesProps) {
	const [selectedImage, setSelectedImage] = useState<{
		src: string;
		alt: string;
	} | null>(null);

	const clearSelection = useCallback(() => setSelectedImage(null), []);

	if (!images || images.length === 0) {
		return null;
	}

	return (
		<>
			{/* Project Images */}
			<div className="space-y-6">
				<h3 className="font-semibold text-foreground text-lg tracking-tight">
					diagrams
				</h3>
				<div className="space-y-6">
					{images.map((image, index) => (
						<ProjectImage
							image={image}
							index={index}
							key={image}
							onSelect={setSelectedImage}
							title={title}
						/>
					))}
				</div>
			</div>

			{/* Image Modal */}
			<ImageModal
				imageAlt={selectedImage?.alt || ""}
				imageSrc={selectedImage?.src || ""}
				isOpen={selectedImage !== null}
				onClose={clearSelection}
			/>
		</>
	);
}
