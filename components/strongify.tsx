interface StrongifyProps {
  text: string;
}

export const Strongify = ({ text }: StrongifyProps) => {
  return <strong className="text-foreground font-medium px-1">{text}</strong>;
};
