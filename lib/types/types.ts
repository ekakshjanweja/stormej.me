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
  images?: string[];
  logo?: string;
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
