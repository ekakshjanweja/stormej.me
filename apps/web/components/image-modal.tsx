"use client";

import Image from "next/image";

interface ImageModalProps {
	imageAlt: string;
	imageSrc: string;
	isOpen: boolean;
	onClose: () => void;
}

export function ImageModal({
	isOpen,
	imageSrc,
	imageAlt,
	onClose,
}: ImageModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
			onClick={onClose}
		>
			<div className="relative flex h-full w-full items-center justify-center p-4">
				{/* Close Button */}
				<button
					className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors duration-200 hover:bg-black/70"
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
				>
					<svg
						className="h-6 w-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M6 18L18 6M6 6l12 12"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
						/>
					</svg>
				</button>

				{/* Image Container */}
				<div className="relative max-h-full max-w-full">
					<Image
						alt={imageAlt}
						className="max-h-[90vh] max-w-full object-contain"
						height={800}
						priority
						src={imageSrc}
						width={1200}
					/>
				</div>
			</div>
		</div>
	);
}
