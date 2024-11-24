import { TextScramble } from "@/components/ui/text-scramble";
import Link from "next/link";

const randomMessage = [
  "galat rasta le liya shayad? chalo homepage chalte hain 🏠",
  "bhai aisa koi page nahi hai",
  "not found",
  "try something else",
];

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="space-y-6 text-center">
        <TextScramble
          className="text-8xl italic "
          characterSet="0123456789!@#$%^&*()_+{}:<>?"
          duration={5}
        >
          {"404"}
        </TextScramble>
        <p className="text-foreground">
          {randomMessage[Math.floor(Math.random() * randomMessage.length)]}
        </p>
        <Link
          href="/"
          className="inline-block text-foreground hover:text-highlight transition-colors"
        >
          return home
        </Link>
      </div>
    </div>
  );
}
