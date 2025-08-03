import { Work } from "../types/types";

export const work: Work[] = [
  {
    id: "digital-domi",
    title: "digital domi",
    subtitle: "digital mailboxes",
    description:
      "leading mobile at digital domi. started from scratch with flutter. figuring out features, fixing bugs, and everything in between.",
    role: "founding mobile engineer",
    startDate: new Date("2024-10-22"),
    website: "https://digitaldomi.com/",
    tech: ["flutter", "dart"],
    projects: [
      {
        title: "domi app",
        highlights: [
          "built a flutter mobile app end to end — core flows, edge cases, and ui polish",
          "used an mvc architecture with providers and value notifiers, keeping most state ephemeral",
          "developed a mail management system to share media and ad campaigns",
          "shipped a flutter web version with ci cd to s3 via github actions",
          "created a unified design system for both mobile and web",
        ],
        playstore:
          "https://play.google.com/store/apps/details?id=com.digitaldomi.app",
        appstore: "https://apps.apple.com/us/app/digital-domi/id6453692447",
        website: "https://web.digitaldomi.com/",
      },
    ],
  },
  {
    id: "merlin",
    title: "merlin",
    subtitle: "flutter, ai, and pushing the limits",
    description:
      "worked on merlin's flutter app — building new features, tightening the ux, and improving dev workflows.",
    role: "mobile intern",
    startDate: new Date("2024-05-01"),
    endDate: new Date("2024-10-01"),
    website: "https://www.getmerlin.in/",
    tech: ["flutter", "dart", "firebase", "kotlin", "jetpack glance"],
    projects: [
      {
        title: "merlin – chat with ai",
        highlights: [
          "added android widgets, app shortcuts, sharing intents, and push notifications",
          "built a dart client library to streamline backend access",
          "added http streaming and config caching to improve performance and stability",
        ],
        playstore:
          "https://play.google.com/store/apps/details?id=com.foyer.merlin&hl=en_IN",
        appstore:
          "https://apps.apple.com/us/app/merlin-ai-ask-chat-write/id6453692447",
      },
      {
        title: "wallflower – ai image generator",
        highlights: [
          "led wallflower's development — an ai image gen app using models like flux 1.1 pro and ideogram 2.0",
          "handled image generation flows, ux, and feature development end to end",
        ],
        playstore:
          "https://play.google.com/store/apps/details?id=com.foyer.wallflower",
        appstore:
          "https://apps.apple.com/in/app/wallflower-ai-image-generator/id6670315498",
      },
    ],
  },
  {
    id: "team-black-box",
    title: "team black box",
    subtitle: "ui, nlp, and polygons ftw",
    description:
      "worked on multiple modules across ui, nlp, and geo-features. first time designing custom ui and playing with skia.",
    role: "mobile intern",
    startDate: new Date("2023-01-01"),
    endDate: new Date("2023-06-01"),
    website: "https://teamblackbox.in/",
    tech: ["react", "react native", "firebase", "zustand", "skia"],
    projects: [
      {
        title: "take a sip",
        highlights: [
          "built the custom sips feature using react native and firebase",
          "added markdown-based changelog support inside the app",
        ],
        playstore: "https://play.google.com/store/apps/details?id=app.takeasip",
      },
      {
        title: "i won't forget",
        highlights: [
          "used nlp via compromise.cool to extract reminder details and improve accuracy by 30%",
          "wrote unit tests to ensure parsing stability",
        ],
        playstore:
          "https://play.google.com/store/apps/details?id=app.iwontforget",
      },
      {
        title: "land blocks",
        highlights: [
          "plotted polygons on maps using location data and react-native-skia",
        ],
      },
    ],
  },
  {
    id: "zuai",
    title: "zuai",
    subtitle: "my first step into the dev world",
    description:
      "my first internship — barely knew what github was. learned a lot, built stuff that scaled.",
    role: "flutter intern",
    startDate: new Date("2021-10-01"),
    endDate: new Date("2022-01-01"),
    website: "https://www.zuai.co/",
    tech: ["flutter", "firebase"],
    projects: [
      {
        title: "zuapp",
        highlights: [
          " built onboarding and dashboard pages in flutter",
          "used riverpod and dio to support scale for 500k+ users",
          "added dark mode and contributed to ui polish",
        ],
        playstore:
          "https://play.google.com/store/apps/details?id=in.zupay.app&hl=en",
      },
    ],
  },
];
