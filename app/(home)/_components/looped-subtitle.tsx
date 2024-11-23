import { TextLoop } from "@/components/ui/text-loop";
import { valorant } from "@/lib/constants/links";
import Link from "next/link";

export default function LoopedSubtitle() {
  return (
    <>
      <div className="flex space-x-4">
        <p className="opacity-80">{"i am also obsessed with"}</p>
        <TextLoop
          className="text-base text-foreground leading-6 font-semibold"
          variants={{
            initial: { y: 10, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: -10, opacity: 0 },
          }}
          interval={3.5}
          transition={{ duration: 0.3 }}
        >
          <div className="flex text-highlight items-center justify-center space-x-4">
            <Link href={"/gear"}>
              <p>{"my gear"}</p>
            </Link>
            <p className="text-xs font-light text-muted-foreground">
              {" (SHIFT + G)"}
            </p>
          </div>

          <span className="text-blue-700">{"i-use-arch-btw"}</span>

          <div className="flex text-red-500 items-center justify-center space-x-4">
            <Link href={valorant} target="_blank">
              {"valorant"}
            </Link>
            <p className="text-xs font-light text-muted-foreground">
              {" (SHIFT + V)"}
            </p>
          </div>

          <div className="flex text-yellow-500 items-center justify-center space-x-4">
            <p>{"lifting weights"}</p>
            <p className="text-xs font-light text-muted-foreground">
              {" (need to be more consistent)"}
            </p>
          </div>

          <span>engineering</span>
        </TextLoop>
      </div>
    </>
  );
}
