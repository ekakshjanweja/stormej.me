import { TextScramble } from "../ui/text-scramble";

export default function HeadlineLarge({
  text,
  className,
  showAsterisk,
}: {
  text: string;
  className?: string;
  showAsterisk?: boolean;
}) {
  return (
    <>
      <div className="flex">
        {showAsterisk && <p className="text-4xl text-highlight mr-2">*</p>}
        <TextScramble className={className + " text-4xl font-bold mb-4"}>
          {text}
        </TextScramble>
      </div>
    </>
  );
}
