export default function HeadlineMedium({
  text,
  showAsterisk,
  className,
}: {
  text: string;
  showAsterisk?: boolean;
  className?: string;
}) {
  return (
    <>
      <div className={className + " flex text-2xl font-semibold"}>
        {showAsterisk && <p className="text-highlight mr-2">*</p>} <p>{text}</p>
      </div>
    </>
  );
}
