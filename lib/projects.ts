import { Projects } from "./interfaces";

export const projects: Projects[] = [
  {
    id: 4,
    title: "stormejislive",
    description:
      "A live streaming app with features like real-time chat, user-blocking, dashboard and auth. ",
    link: "https://live.stormej.me",
    github: "https://github.com/ekakshjanweja/stormej-live",
    youtube: "https://www.youtube.com/watch?v=RAcWnMxSdTo&t=110s",
    techStack: "nextjs-tailwind-livekit-postgres-clerk-prisma",
  },
  {
    id: 3,
    title: "dtusocial",
    description:
      "A proximity chat app made for college students to connect with each other.",
    link: "https://dtu.social",
    github: "https://github.com/ekakshjanweja/Google-Docs-Clone",
    techStack: "flutter-firebase-riverpod-geolocator-mvc",
    playstore:
      "https://play.google.com/store/apps/details?id=com.app.dtusocial",
  },
  {
    id: 2,
    title: "old-portfolio",
    description:
      "This is the second iteration of my portfolio which was inspired by the conordewey.com",
    link: "https://flutter.stormej.me",
    github: "https://github.com/ekakshjanweja/Portfolio-Website",
    techStack: "flutter-web",
  },
  {
    id: 1,
    title: "gdocs",
    description: "A google docs clone with real-time collaboration features.",
    link: "https://github.com/ekakshjanweja/Google-Docs-Clone",
    github: "https://github.com/ekakshjanweja/Google-Docs-Clone",
    youtube:
      "https://www.youtube.com/watch?v=EKjbYMvR8xs&ab_channel=EkakshJanweja",
    techStack: "flutter-riverpod-socketio-nodejs-express-mongodb",
  },
];
