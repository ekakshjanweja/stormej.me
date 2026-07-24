import Link from "next/link";

const randomMessage = [
  "galat rasta le liya shayad? chalo homepage chalte hain 🏠",
  "bhai aisa koi page nahi hai",
  "not found",
  "try something else",
];

export default function NotFound() {
  const selectedMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)];
  
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="text-center space-y-8 max-w-lg">
        {/* Glitchy 404 */}
        <div className="relative">
          <div className="text-6xl sm:text-8xl font-bold text-foreground select-none">
            4<span className="inline-block animate-pulse">0</span>4
          </div>
          <div className="absolute inset-0 text-6xl sm:text-8xl font-bold text-highlight/30 animate-ping">
            4<span className="inline-block">0</span>4
          </div>
        </div>

        {/* Message with typewriter effect */}
        <div className="space-y-4">
          <div className="text-muted-foreground text-lg font-mono">
            <span className="animate-pulse">&gt;</span> {selectedMessage}
          </div>
          
          {/* Terminal-style navigation */}
          <div className="font-mono text-sm text-muted-foreground/80 space-y-2">
            <div className="text-left space-y-1 pl-4">
              <Link 
                href="/" 
                className="block hover:text-highlight transition-colors cursor-pointer"
              >
                <span className="text-accent">cd</span> home
              </Link>
              <Link 
                href="/blog" 
                className="block hover:text-highlight transition-colors cursor-pointer"
              >
                <span className="text-accent">cd</span> blog
              </Link>
              <Link 
                href="/gear" 
                className="block hover:text-highlight transition-colors cursor-pointer"
              >
                <span className="text-accent">cd</span> gear
              </Link>
              <Link 
                href="/projects" 
                className="block hover:text-highlight transition-colors cursor-pointer"
              >
                <span className="text-accent">cd</span> projects
              </Link>
            </div>
          </div>
        </div>

        {/* Blinking cursor */}
        <div className="font-mono text-muted-foreground/60">
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}
