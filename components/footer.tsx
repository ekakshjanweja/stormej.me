export default function Footer() {
  return (
    <footer className="mt-24 py-8 flex items-center justify-between">
      <span className="display-accent text-[18px] font-medium text-foreground">
        stormej
      </span>
      <span className="meta-tag">
        © {new Date().getFullYear()} · new delhi
      </span>
    </footer>
  );
}
