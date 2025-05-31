import Card from "@/components/card";
import { TextScramble } from "@/components/ui/text-scramble";
import { projects } from "@/lib/constants/projects";

export default function Project() {
  return (
    <main>
      {/* Page Header */}
      <div className="mb-16 lg:mb-20">
        <TextScramble
          as="h1"
          className="text-3xl lg:text-4xl font-bold text-foreground"
        >
          projects
        </TextScramble>
        <p className="text-muted-foreground mt-2 text-sm lg:text-base">
          a collection of things i've built
        </p>
      </div>

      {/* Projects List */}
      <div className="space-y-2">
        {projects.map((item, index) => (
          <div
            key={item.title}
            className="animate-in slide-in-from-bottom-4 duration-700"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <Card
              title={item.title}
              role={item.role}
              date={item.date}
              description={item.description}
              href={item.shouldViewMore ? `/projects/${item.title}` : item.href}
              type="project"
              shouldViewMore={item.shouldViewMore}
              externalHref={item.href}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
