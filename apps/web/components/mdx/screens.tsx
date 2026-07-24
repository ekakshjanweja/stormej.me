import { CaseStudyScreens } from "@/components/case-study-screens";
import type { ScreenshotMockupKind, WorkImageAsset } from "@/lib/types/types";

export function Screens({
  images,
  title = "",
  mockup,
  appendix = true,
  sectionId,
}: {
  images: WorkImageAsset[];
  title?: string;
  mockup?: ScreenshotMockupKind;
  appendix?: boolean;
  sectionId?: string;
}) {
  if (!images || images.length === 0) return null;
  return (
    <CaseStudyScreens
      images={images}
      title={title}
      screenshotMockup={mockup}
      appendix={appendix}
      sectionId={sectionId}
    />
  );
}
