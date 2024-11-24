export default function HeadlineSmall({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <>
      <p className={className + " text-xl group-hover:text-highlight"}>
        {text}
      </p>
    </>
  );
}
