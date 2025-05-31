import HeadlineMedium from "@/components/styles/headline-medium";
import HeadlineSmall from "@/components/styles/headline-small";

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
      <section className="mb-16 lg:mb-20">
        <HeadlineMedium text={"gear"}/>
        <p className="text-muted-foreground text-base max-w-2xl">
          The tools and equipment that power my daily work and creative projects
        </p>
      </section>

      {/* Gear Grid */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {gear.map(({ label, value }, index) => (
            <div
              key={label}
              className="group relative p-6 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-300 ease-in-out hover:border-border hover:shadow-lg"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </h3>
                <p className="text-lg font-semibold text-foreground group-hover:text-highlight transition-colors duration-300">
                  {value}
                </p>
              </div>

              {/* Subtle hover effect border */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-highlight/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <section className="text-center pt-8 border-t border-border/30">
        <HeadlineSmall
          text="always evolving, always improving"
          className="text-muted-foreground/80"
        />
        <p className="text-sm text-muted-foreground mt-2">
          this setup changes as i discover new tools and workflows
        </p>
      </section>
    </main>
  );
}
