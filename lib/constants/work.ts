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
    logo: "/images/logos/digital-domi.svg",
    images: [
      {
        light: "/images/domi/domi_one.PNG",
        dark: "/images/domi/domi_one_dark.PNG",
      },
      {
        light: "/images/domi/domi_two.PNG",
        dark: "/images/domi/domi_two_dark.PNG",
      },
      {
        light: "/images/domi/domi_three.PNG",
        dark: "/images/domi/domi_three_dark.PNG",
      },
      {
        light: "/images/domi/domi_four.PNG",
        dark: "/images/domi/domi_four_dark.PNG",
      },
      {
        light: "/images/domi/domi_five.PNG",
        dark: "/images/domi/domi_five_dark.PNG",
      },
      {
        light: "/images/domi/domi_six.PNG",
        dark: "/images/domi/domi_six_dark.PNG",
      },
      {
        light: "/images/domi/domi_seven.PNG",
        dark: "/images/domi/domi_seven_dark.PNG",
      },
    ],
    screenshotMockup: "iphone-17-pro",
    caseStudy: {
      challenge:
        "shape a mobile experience for digital mailboxes from scratch, on a small team, aiming for consumer-grade polish.",
      chapters: [
        {
          id: "starting-point",
          label: "starting point",
          title: "founding mobile at digital domi",
          body: [
            "i joined digital domi in late 2024 as the **first mobile hire**. there was no app yet: a small team, a web product, and a blunt question about what a mobile mailbox should feel like.",
            "we picked **flutter**. one codebase across ios, android, and web meant we could move fast without splitting attention three ways.",
          ],
        },
        {
          id: "architecture",
          label: "architecture",
          title: "keeping state where it belongs",
          body: [
            "i went with an mvc-style layout backed by **providers and value notifiers**. most state stays ephemeral: the screen owns it, the screen disposes it. nothing global unless it has to be.",
            "this kept the surface area small. **fewer rebuilds, fewer cross-screen bugs**, and a much easier time onboarding the next engineer.",
          ],
          pullQuote:
            "ephemeral by default. global state was a deliberate exception, never the starting point.",
        },
        {
          id: "shipping",
          label: "shipping",
          title: "a mailbox you actually want to open",
          body: [
            "the core experience is the mailbox: **physical mail rendered digitally**, media you can share, ad campaigns you can pull out and act on. i built the upload flow, the viewer, the share sheet, and the edge cases nobody asks about until something breaks.",
            "in parallel i shipped the **flutter web build**. same codebase, deployed to s3 via github actions on every merge to main.",
          ],
        },
        {
          id: "system",
          label: "system",
          title: "one design language across surfaces",
          body: [
            "as the surface grew, the components got pulled into a **unified design system** shared between mobile and web. button, sheet, list row, empty state: same primitives, same tokens, both targets.",
            "the result: a release on one platform doesn't drift visually from the other, and a single change propagates everywhere it should.",
          ],
        },
      ],
      outcomes: [
        { metric: "ios + android + web", label: "live on" },
        { metric: "github actions → s3", label: "ci/cd" },
        { metric: "flutter · dart", label: "stack" },
      ],
    },
    projects: [
      {
        title: "domi app",
        highlights: [
          "built a flutter mobile app end to end: core flows, edge cases, and ui polish",
          "used an mvc architecture with providers and value notifiers, keeping most state ephemeral",
          "developed a mail management system to share media and ad campaigns",
          "shipped a flutter web version with ci cd to s3 via github actions",
          "created a unified design system for both mobile and web",
        ],
        playstore:
          "https://play.google.com/store/apps/details?id=com.domilabs.domi",
        appstore: "https://apps.apple.com/us/app/digital-domi/id6738277048",
        website: "https://web.digitaldomi.com/",
      },
    ],
  },
  {
    id: "merlin",
    title: "merlin",
    subtitle: "flutter, ai, and pushing the limits",
    description:
      "worked on merlin's flutter app building new features, tightening the ux, and improving dev workflows.",
    role: "mobile intern",
    startDate: new Date("2024-05-01"),
    endDate: new Date("2024-10-01"),
    website: "https://www.getmerlin.in/",
    tech: ["flutter", "dart", "firebase", "kotlin", "jetpack glance"],
    logo: "/images/logos/merlin.svg",
    images: [
      "/images/merlin/merlin_one.webp",
      "/images/merlin/merlin_two.jpg",
      "/images/merlin/merlin_three.jpg",
    ],
    caseStudy: {
      challenge:
        "ship native-feeling android features and a new ai image-gen app on top of merlin's existing flutter codebase, without slowing the team down.",
      chapters: [
        {
          id: "context",
          label: "context",
          title: "joining a fast-moving consumer ai app",
          body: [
            "merlin was already shipping fast when i joined: a flutter app talking to multiple ai backends, growing across ios and android. my job was to **push the surface area outward**: native android touchpoints, sharper ux, and a second app under the same brand.",
          ],
        },
        {
          id: "android-native",
          label: "android",
          title: "widgets, shortcuts, and intents",
          body: [
            "android users expected the app to feel native, not just look like a flutter shell. i added **home-screen widgets via jetpack glance**, **app shortcuts**, and **share-sheet intents** so merlin could be invoked from anywhere on the system.",
            "push notifications got rebuilt around action affordances so a tap opens the right thread instead of dumping you on the home screen.",
          ],
          pullQuote:
            "the cheapest engagement is the one users don't have to open the app for.",
        },
        {
          id: "platform",
          label: "platform",
          title: "a dart client for the backend",
          body: [
            "the team was rewriting api calls in every feature. i built a **dart client library** that wrapped auth, retries, and typed responses, so feature work stopped being plumbing work.",
            "alongside it: **http streaming** for chat responses and **config caching** to cut cold-start latency on flaky networks.",
          ],
        },
        {
          id: "wallflower",
          label: "wallflower",
          title: "a second app, same dna",
          body: [
            "i led **wallflower** end to end as a standalone ai image-gen app powered by **flux 1.1 pro** and **ideogram 2.0**. generation flows, prompt ux, gallery, and sharing, soup to nuts.",
            "it shipped on both stores and reused merlin's component vocabulary so the brand felt continuous across products.",
          ],
        },
      ],
      outcomes: [
        { metric: "2 apps", label: "shipped on ios + android" },
        { metric: "jetpack glance", label: "android home-screen widgets" },
        { metric: "flux + ideogram", label: "image-gen models in prod" },
      ],
    },
    projects: [
      {
        title: "merlin - chat with ai",
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
        title: "wallflower - ai image generator",
        highlights: [
          "led wallflower's development for an ai image gen app using models like flux 1.1 pro and ideogram 2.0",
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
    logo: "/images/logos/team-black-box.png",
    caseStudy: {
      challenge:
        "ship real features across three small apps mixing custom ui, nlp parsing, and map geometry on react native with firebase and skia thrown in.",
      chapters: [
        {
          id: "internship",
          label: "internship",
          title: "three products, one six-month run",
          body: [
            "i joined **team black box** for my first long internship (six months) and rotated through **take a sip**, **i won't forget**, and **land blocks**. each one skewed differently: consumer ui, text intelligence, and geo visualization.",
            "the stack was **react native**, **firebase**, and **zustand** for state. it was my first time designing **custom ui** from scratch and my first real exposure to **skia** on mobile.",
          ],
        },
        {
          id: "ui",
          label: "ui",
          title: "custom sips and in-app changelogs",
          body: [
            "on **take a sip** i built the **custom sips** flow end to end and wired it to firebase. i also added **markdown-based changelog** support inside the app so shipping notes could stay in-product instead of bouncing people to email or a blog.",
          ],
          pullQuote:
            "if the update lives in the product, people actually read it.",
        },
        {
          id: "nlp",
          label: "nlp",
          title: "parsing reminders from natural language",
          body: [
            "for **i won't forget** i used **compromise.cool** to pull structured reminder details out of free-form text. tuning the parser moved **accuracy up by about 30%** against our test set.",
            "i wrote **unit tests** around the extraction paths so refactors didn't silently break production behavior. that was my first time treating parsing like a subsystem, not a one-off script.",
          ],
        },
        {
          id: "maps",
          label: "maps",
          title: "land plots with react-native-skia",
          body: [
            "on **land blocks** i took location data and **drew polygons on the map** using **react-native-skia**, wiring geo inputs to something visual on screen.",
          ],
        },
      ],
      outcomes: [
        { metric: "3 apps", label: "features shipped" },
        { metric: "~30% gain", label: "reminder parsing accuracy" },
        { metric: "rn · firebase · skia", label: "stack" },
      ],
    },
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
      "my first internship. barely knew what github was. learned a lot, shipped things that scaled.",
    role: "flutter intern",
    startDate: new Date("2021-10-01"),
    endDate: new Date("2022-01-01"),
    website: "https://www.zuai.co/",
    tech: ["flutter", "firebase"],
    logo: "/images/logos/zuai.png",
    images: [
      "/images/zuai/zuai_one.webp",
      "/images/zuai/zuai_two.webp",
      "/images/zuai/zuai_three.webp",
    ],
    caseStudy: {
      challenge:
        "first internship, first real codebase. learn fast, ship features, and not break a flutter app already serving hundreds of thousands of users.",
      chapters: [
        {
          id: "first-job",
          label: "first job",
          title: "showing up barely knowing github",
          body: [
            "this was my **first internship**. i had written flutter on my own, but i hadn't worked inside a real team or a real codebase. day one meant figuring out **branches, prs, and code review**, the practical side of shipping with other people.",
            "the bar was higher than my college side projects. the app was already live and being used.",
          ],
        },
        {
          id: "shipping-features",
          label: "shipping",
          title: "onboarding and dashboard at scale",
          body: [
            "i built parts of the **onboarding** and **dashboard** screens in flutter. tiny surfaces but every new user hit them. that meant honoring loading, empty, and error, not only the sunny path.",
            "the app needed to handle **500k+ users** across patchy networks, so i used **riverpod** for state and **dio** with retries and timeouts for the api layer.",
          ],
          pullQuote:
            "the happy path is easy. the loading, empty, and error states are the product.",
        },
        {
          id: "polish",
          label: "polish",
          title: "dark mode and the small stuff",
          body: [
            "i added **dark mode** across the screens i owned and nudged general ui polish along the way (spacing, type scale, hit targets). boring on paper but it keeps the product from feeling janky.",
            "this was where i first learned that **detail work compounds**. shipping a ticket isn't always the same thing as finishing it.",
          ],
        },
      ],
      outcomes: [
        { metric: "500k+ users", label: "scale at the time" },
        { metric: "first prod ship", label: "my first real release" },
        { metric: "flutter · firebase", label: "stack" },
      ],
    },
    projects: [
      {
        title: "zuapp",
        highlights: [
          "built onboarding and dashboard pages in flutter",
          "used riverpod and dio to support scale for 500k+ users",
          "added dark mode and contributed to ui polish",
        ],
        playstore:
          "https://play.google.com/store/apps/details?id=in.zupay.app&hl=en",
      },
    ],
  },
];
