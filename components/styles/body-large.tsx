export default function BodyLarge({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <>
      <p
        className={
          className +
          " font-light leading-6 text-foreground opacity-85 text-base"
        }
      >
        {text}
      </p>
    </>
  );
}
