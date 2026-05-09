/** Device frame for work case-study screenshots (`CaseStudyScreens`). */
export type ScreenshotMockupKind = "iphone-17-pro";

/** One file, or light + dark pair (CSS `dark:` toggles visibility). */
export type WorkImageAsset = string | { light: string; dark: string };

export type Work = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  website?: string;
  tech: string[];
  highlights?: string[];
  projects?: WorkProject[];
  features?: string[];
  images?: WorkImageAsset[];
  /** Case study screenshots device frame (`ScreenshotMockupKind`). */
  screenshotMockup?: ScreenshotMockupKind;
  logo?: string;
  caseStudy?: WorkCaseStudy;
};

export type WorkCaseStudy = {
  challenge?: string;
  chapters: WorkChapter[];
  outcomes?: WorkOutcome[];
};

export type WorkChapter = {
  id: string;
  label: string;
  title: string;
  body: string[];
  pullQuote?: string;
};

export type WorkOutcome = {
  metric: string;
  label: string;
};

export type WorkProject = {
  title: string;
  highlights: string[];
  playstore?: string;
  appstore?: string;
  website?: string;
  images?: string[];
};

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  highlights?: string[];
  features?: string[];
  playstore?: string;
  appstore?: string;
  website?: string;
  tech: string[];
  youtube?: string;
  github?: string;
  hidden?: boolean;
  images?: string[];
};
