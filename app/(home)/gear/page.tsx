const gear = [
  { label: "laptop", value: "m4 macbook pro base/g14'21" },
  { label: "keyboard", value: "aula f75 pro" },
  { label: "mouse", value: "logitech g304" },
  { label: "pc", value: "7600-4060-32gb_ddr5" },
  { label: "monitor", value: "gigabyte g24f2" },
  { label: "headphones", value: "soundcore q20i" },
  { label: "mic", value: "fifine at6" },
  { label: "webcam", value: "lenovo 300" },
  { label: "mobile", value: "pixel 6a" },
  { label: "typing 30s", value: "86wpm" },
];

export default function Gear() {
  return (
    <main>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          gear
        </h1>
      </div>

      {/* Gear Grid */}
      <div className="flex flex-col gap-6">
        {gear.map(({ label, value }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-lg border border-border/10 bg-muted/30 hover:border-border/30 hover:bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out cursor-pointer p-4 hover:shadow-sm hover:shadow-primary/5"
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary/95 transition-colors duration-200">
                  {label}
                </h3>
                <p className="text-sm text-muted-foreground font-medium transition-colors duration-200">
                  {value}
                </p>
              </div>
            </div>

            {/* Subtle border animation */}
            <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-primary/20 transition-all duration-500" />
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div className="mt-16 pt-8 border-t border-border/30 text-center">
        <p className="text-sm text-muted-foreground/60">
          always evolving, always improving
        </p>
        <p className="text-sm text-muted-foreground/40 mt-1">
          this setup changes as i discover new tools and workflows
        </p>
      </div>
    </main>
  );
}
