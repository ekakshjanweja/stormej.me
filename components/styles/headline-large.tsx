import { TextScramble } from "../ui/text-scramble";

export default function HeadlineLarge({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <>
      <TextScramble className={className + " text-4xl font-bold mb-4"}>
        {text}
      </TextScramble>
    </>
  );
}
