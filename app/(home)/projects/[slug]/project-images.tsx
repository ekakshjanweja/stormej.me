"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageModal } from "@/components/image-modal";
import type { Project } from "@/lib/types/types";

interface ProjectImagesProps {
  project: Project;
}

export function ProjectImages({ project }: ProjectImagesProps) {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  if (!project.images || project.images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Project Images */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          diagrams
        </h3>
        <div className="space-y-6">
          {project.images.map((image, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden border border-border/40 hover:border-highlight/30 transition-all duration-500 cursor-pointer"
              onClick={() => {
                setSelectedImage({
                  src: `/${image}`,
                  alt: `${project.title} - Image ${index + 1}`,
                });
              }}
            >
              <Image
                src={`/${image}`}
                alt={`${project.title} - Image ${index + 1}`}
                width={800}
                height={600}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={selectedImage !== null}
        imageSrc={selectedImage?.src || ""}
        imageAlt={selectedImage?.alt || ""}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}
