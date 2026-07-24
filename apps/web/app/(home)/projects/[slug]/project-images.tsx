"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageModal } from "@/components/image-modal";

interface ProjectImagesProps {
	images?: string[];
	title: string;
}

export function ProjectImages({ title, images }: ProjectImagesProps) {
	const [selectedImage, setSelectedImage] = useState<{
		src: string;
		alt: string;
	} | null>(null);

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
						<div
							className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/40 transition-all duration-500 hover:border-highlight/30"
							key={index}
							onClick={() => {
								setSelectedImage({
									alt: `${title} - Image ${index + 1}`,
									src: `/${image}`,
								});
							}}
						>
							<Image
								alt={`${title} - Image ${index + 1}`}
								className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
								height={600}
								src={`/${image}`}
								width={800}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Image Modal */}
			<ImageModal
				imageAlt={selectedImage?.alt || ""}
				imageSrc={selectedImage?.src || ""}
				isOpen={selectedImage !== null}
				onClose={() => setSelectedImage(null)}
			/>
		</>
	);
}
