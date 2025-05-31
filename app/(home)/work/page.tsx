import Card from "@/components/card";
import { TextScramble } from "@/components/ui/text-scramble";
import { work } from "@/lib/constants/work";

export default function Work() {
  return (
    <main>
      {/* Page Header */}
      <div className="mb-16 lg:mb-20">
        <TextScramble
          as="h1"
          className="text-3xl lg:text-4xl font-bold text-foreground"
        >
          work
        </TextScramble>
        <p className="text-muted-foreground mt-2 text-sm lg:text-base">
          my professional journey
        </p>
      </div>

      {/* Work Experience List */}
      <div className="space-y-2">
        {work.map((item, index) => (
          <div
            key={item.id}
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
              href={`/work/${item.id}`}
              type="work"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
