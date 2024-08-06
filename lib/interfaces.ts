export interface Projects {
  id: number;
  title: string;
  description: string;
  link?: string;
  github?: string;
  youtube?: string;
  techStack?: string;
  playstore?: string;
  points?: string[];
}

export interface WorkEx {
  id: number;
  company: string;
  role: string;
  duration: string;
  companyLink: string;
  projects: Projects[];
}
