import { WorkEx } from "./interfaces";

export const workexs: WorkEx[] = [
  {
    id: 3,
    company: "Merlin AI",
    role: "Mobile Intern",
    companyLink: "https://www.getmerlin.in/",
    duration: "May'24 - Present",
    projects: [
      {
        id: 1,
        title: "Merlin AI -> Mobile App",
        description: "An AI app with several AI tools in one place.",
        link: "https://www.getmerlin.in/mobile-app",
        techStack: "",
      },
    ],
  },
  {
    id: 2,
    company: "TeamBlackBox",
    role: "Mobile Intern",
    duration: "Jan'23 - Jun'23",
    companyLink: "https://teamblackbox.in/",
    projects: [
      {
        id: 1,
        title: "Take A Sip -> Set Water Reminders",
        description:
          "An app used to set water reminder. I implemented a feature of adding custom sip units.",
        link: "https://play.google.com/store/apps/details?id=app.takeasip",
        techStack: "reactnative-firebase-zustand",
      },
      {
        id: 2,
        title: "I Wont Forget -> Set Reminders from Voice",
        description:
          "Used compromise.cool nlp to extract parts of speech from user input",
        link: "https://play.google.com/store/apps/details?id=app.iwontforget",
        techStack: "reactnative-firebase-compromise.cool",
      },
      {
        id: 3,
        title: "Land Blocks",
        description:
          "Land Blocks is a geo mapping app in which I used react-native-skia (by shopify) ibrary to construct a polygon with location coordinates.",

        techStack: "reactnative-firebase-zustand-skia",
      },
    ],
  },
  {
    id: 1,
    company: "ZuAi",
    role: "Flutter Intern",
    duration: "Oct'21 - Jan'22",
    companyLink: "https://www.zuapp.co/",
    projects: [
      {
        id: 1,
        title: "ZuApp",
        description:
          "Implemented darkmode in the entire app using riverpod for state management. Also, worked on ui for multiple screens.",
        link: "https://play.google.com/store/apps/details?id=in.zupay.app",
        techStack: "flutter-riverpod",
      },
    ],
  },
];
