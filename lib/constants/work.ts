import {
  domi,
  getMerlin,
  iWontForgetPlayStore,
  merlinAppStore,
  merlinPlayStore,
  takeASipPlayStore,
  tbb,
  wallflowerAppStore,
  wallflowerPlayStore,
  zuai,
  zuAppPlayStore,
} from "@/lib/constants/links";

export interface ProjectType {
  title: string;
  points?: string[];
  featuresBuilt?: string[];
  playstore?: string;
  appstore?: string;
}

export interface WorkEntryType {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  date: string;
  href: string;
  description: string;
  tech: string;
  projects?: ProjectType[];
}

export const work: WorkEntryType[] = [
  {
    id: "digital-domi",
    title: "digital domi",
    role: "founding engineer",
    date: " (oct 2024 - present)",
    href: domi,
    subtitle: "digital mailboxes",
    description:
      "leading the mobile efforts at digital domi rn, building a flutter app from scratch. it's been a fun ride so far—figuring out features, fixing bugs, and everything in between.",
    tech: "flutter-dart-supabase-websockets-sentry-googlemlkit-googlemaps-provider-onesignal-videoplayer",
    projects: [
      {
        title: "domi",
        points: [
          "pushing mobile efforts at digital domi, building the app from scratch",
          "added share, print pdf, sentry, auth, push notifications, google ml kit, socket chat, deep links, google maps",
          "built payouts, mailer campaigns, auth, and real-time chat with websockets",
          "role-based access control for different user types",
          "video playback optimization for smooth streaming experience with a ui simillar to instagram reels",
          "this is still a work in progress, so stay tuned for more updates!",
        ],
        featuresBuilt: [
          "share",
          "print-pdf",
          "sentry",
          "auth",
          "push-notifs",
          "google-ml-kit",
          "socket-chat",
          "deep-links",
          "google-maps",
          "role-based-access",
          "video-playback-optimization",
        ],
      },
    ],
  },
  {
    id: "merlin",
    title: "merlin",
    role: "mobile intern",
    date: " (may 2024 - oct 2024)",
    href: getMerlin,
    subtitle: "flutter, ai, and pushing the limits",
    description:
      "added android widgets, app shortcuts, sharing intents, push notifications and more to boost the UX on merlin's flutter app. also built a dart client library to streamline dev & led wallflower, an ai image-gen app with models like flux 1.1 pro.",
    tech: "flutter-dart-firebase-jetpackglance-kotlin",
    projects: [
      {
        title: "merlin - chat with ai",
        points: [
          "engineered various features and ux enhancements.",
          "made things more maintainable by creatng a dart client library for internal backend.",
          "improved app stability by incorporating caching of config files.",
        ],
        featuresBuilt: [
          "app shortcuts",
          "android widgets",
          "sharing intents",
          "push notifications",
          "dart client library",
          "http streaming",
          "caching",
        ],
        playstore: merlinPlayStore,
        appstore: merlinAppStore,
      },
      {
        title: "wallflower - ai image generator",
        points: [
          "led wallflower's development an ai image gen app using models like flux 1.1 pro & ideogram 2.0 ",
        ],
        featuresBuilt: ["ux", "image generation"],
        playstore: wallflowerPlayStore,
        appstore: wallflowerAppStore,
      },
    ],
  },
  {
    id: "team-black-box",
    title: "team black box",
    role: "mobile intern",
    date: " (jan 2023 - jun 2023)",
    href: tbb,
    subtitle: "ui, nlp, and polygons ftw",
    description:
      "creating small modules and first time hdesigned custom ui features, used nlp for smarter reminders, and plotted polygons for geo-mapping with react-native-skia.",
    tech: "react-reactnative-firebase-zustand-skia",
    projects: [
      {
        title: "take a sip",
        points: [
          "implemented custom sips feature with react native & firebase.",
          "integrated markdown files for a change-log section in the app.",
        ],
        featuresBuilt: ["custom sips", "markdown integration"],
        playstore: takeASipPlayStore,
      },
      {
        title: "i won't forget",
        points: [
          "leveraged nlp from compromise.cool to extract parameters from reminders, improving accuracy by 30%.",
        ],
        featuresBuilt: ["nlp", "reminder accuracy", "unit tests"],
        playstore: iWontForgetPlayStore,
      },
      {
        title: "land blocks",
        points: [
          "applied react-native-skia library to construct a polygon with location coordinates.",
        ],
        featuresBuilt: ["polygon plotting", "geo-mapping"],
      },
    ],
  },
  {
    id: "zuai",
    title: "zuai",
    role: "flutter intern",
    date: " (oct 2021 - jan 2022)",
    href: zuai,
    subtitle: "my first step into the dev world",
    description:
      "baby steps this was my first internship tbh did not even know what github is",
    tech: "flutter-firebase",
    projects: [
      {
        title: "zuapp",
        points: [
          "built onboarding and dashboard pages for zuapp in flutter, leveraging riverpod and dio to scale for 500k+ users.",
        ],
        featuresBuilt: ["onboarding", "dark theme", "dashboard"],
        playstore: zuAppPlayStore,
      },
    ],
  },
];
