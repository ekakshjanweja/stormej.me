import { Project } from "../types/types";

export const projects: Project[] = [
  {
    id: "turi",
    title: "turi",
    subtitle: "ai powered email client",
    description:
      "built a email client which is voice first and uses ai to send and read emails.",
    tech: ["bun", "hono", "cloudflare-workers", "flutter", "ai-sdk"],
    website: "https://www.turi.email/",
    images: ["agent-workflow-turi.png", "vad-turi.png"],
    github: "https://github.com/ekakshjanweja/turi",
  },
  {
    id: "better-auth-flutter",
    title: "better-auth-flutter",
    subtitle: "flutter client for better-auth",
    tech: ["flutter", "dart"],
    website: "https://pub.dev/packages/better_auth_flutter",
    github: "https://github.com/ekakshjanweja/better_auth_flutter",
  },
  {
    id: "browser-automation",
    title: "browser-automation",
    subtitle: "browser automation agent",
    tech: ["ai sdk", "playwright", "bun", "hono", "nextjs"],
    highlights: [],
    youtube: "https://www.youtube.com/watch?v=2xEgXGYzQgw",
    github: "https://github.com/kunal00000/browser-use-ts",
  },
  {
    id: "renovatio",
    title: "renovatio",
    subtitle: "project management for interior designers",
    description:
      "project management platform for interior designers. task scheduling, ai-powered visuals, multi-project view — all built with nextjs",
    tech: [
      "nextjs",
      "tailwind",
      "postgres",
      "nextauth",
      "drizzle",
      "shadcn/ui",
      "aceternity",
    ],
    website: "https://renovatio-design.vercel.app/",
    github: "https://github.com/ekakshjanweja/renovatio",
    hidden: true,
  },
  {
    id: "flux",
    title: "flux",
    subtitle: "real-time visual workspace",
    description:
      "built with liveblocks and convex. drag, drop, sync in real time.",
    tech: [
      "nextjs",
      "tailwind",
      "shadcn/ui",
      "prisma",
      "liveblocks",
      "convex",
      "clerk",
    ],
    website: "https://flux.stormej.me",
    github: "https://github.com/ekakshjanweja/flux",
    youtube: "https://youtu.be/6HJoyJrVJ-0?si=vTbvFu_5m-z86rXI",
  },
  {
    id: "stormejislive",
    title: "stormejislive",
    subtitle: "live streaming with real-time chat.",
    description: "built a lightweight twitch-style clone using livekit.",
    tech: ["nextjs", "tailwind", "livekit", "postgres", "clerk", "prisma"],
    website: "https://live.stormej.me",
    github: "https://github.com/ekakshjanweja/stormej-live",
    youtube: "https://www.youtube.com/watch?v=RAcWnMxSdTo",
  },
  {
    id: "dtusocial",
    title: "dtusocial",
    subtitle:
      "proximity chat app for college students. used geolocation, riverpod, and firebase to make it all work on the go.",
    description:
      "proximity chat app for college students. used geolocation, riverpod, and firebase to make it all work on the go.",
    tech: ["flutter", "firebase", "riverpod", "geolocator", "mvc"],
    youtube: "https://www.youtube.com/watch?v=uPrSzoiw8Ms",
    website: "https://www.youtube.com/watch?v=uPrSzoiw8Ms",
  },
  {
    id: "old-portfolio",
    title: "old-portfolio",
    subtitle:
      "personal portfolio made with flutter web. custom animations and responsive design.",
    tech: ["flutter web"],
    website: "https://flutter.stormej.me",
    github: "https://github.com/ekakshjanweja/Portfolio-Website",
  },
  {
    id: "gdocs",
    title: "gdocs",
    subtitle:
      "google docs clone with real-time collab. sockets for sync, mongodb for persistence.",
    description:
      "google docs clone with real-time collab. sockets for sync, mongodb for persistence.",
    tech: ["flutter", "riverpod", "socket.io", "node.js", "express", "mongodb"],
    github: "https://github.com/ekakshjanweja/gdocs",
    youtube: "https://www.youtube.com/watch?v=QwC2U2VQK6A",
  },
];
