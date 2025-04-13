import {
  browserAutomationAgent,
  browserUseTsGithub,
  dtuSocial,
  flux,
  fluxGithub,
  fluxYoutube,
  oldPortfolio,
  oldPortfolioGithub,
  renovatio,
  renovatioGithub,
  stormejIsLive,
  stormejIsLiveGithub,
  stormejIsLiveYoutube,
} from "./links";

interface Project {
  title: string;
  role: string;
  date: string;
  href: string;
  description: string;
  tech: string;
  github?: string;
  youtube?: string;
}

export const projects: Project[] = [
  {
    title: "browser-automation-agent",
    role: "full stack dev",
    date: " (feb 2025 - march 2025)",
    href: browserAutomationAgent,
    description: "browser automation agent made with playwright",
    tech: "aisdk-playwright-bun-hono",
    youtube: browserAutomationAgent,
    github: browserUseTsGithub,
  },
  {
    title: "renovatio",
    role: "full stack dev",
    date: " (july 2024 - oct 2024)",
    href: renovatio,
    description: "project management for interior designers",
    tech: "nextjs-tailwind-postgres-nextauth-drizzle-shadcnui-aceternity",
    github: renovatioGithub,
  },
  {
    title: "flux",
    role: "full stack dev",
    date: " (march 2024)",
    href: flux,
    description: "real-time visual workspace",
    tech: "nextjs-tailwind-shadcnui-prisma-liveblocks-convex-clerk",
    github: fluxGithub,
    youtube: fluxYoutube,
  },
  {
    title: "stormejislive",
    role: "full stack dev",
    date: " (feb 2024)",
    href: stormejIsLive,
    description: "live streaming with real-time chat",
    tech: "nextjs-tailwind-livekit-postgres-clerk-prisma",
    github: stormejIsLiveGithub,
    youtube: stormejIsLiveYoutube,
  },
  {
    title: "dtusocial",
    role: "full stack dev",
    date: " (may 2023 - sept 2023)",
    href: dtuSocial,
    description: "proximity chat app made for college students",
    tech: "flutter-firebase-riverpod-geolocator-mvc",
    youtube: dtuSocial,
  },
  {
    title: "old-portfolio",
    role: "full stack dev",
    date: " (sept 2023 - dec 2023)",
    href: oldPortfolio,
    description: "portfolio website made with flutter web",
    tech: "flutter-web",
    github: oldPortfolioGithub,
  },
  {
    title: "gdocs",
    role: "fullter dev",
    date: " (dec 2022)",
    description: "google docs clone with real-time collab",
    tech: "flutter-riverpod-socketio-nodejs-express-mongodb",
    href: "https://github.com/ekakshjanweja/Google-Docs-Clone",
    github: "https://github.com/ekakshjanweja/Google-Docs-Clone",
    youtube:
      "https://www.youtube.com/watch?v=EKjbYMvR8xs&ab_channel=EkakshJanweja",
  },
];
