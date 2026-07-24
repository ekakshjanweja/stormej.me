import Link from "next/link";

const randomMessage = [
	"galat rasta le liya shayad? chalo homepage chalte hain 🏠",
	"bhai aisa koi page nahi hai",
	"not found",
	"try something else",
];

export default function NotFound() {
	const selectedMessage =
		randomMessage[Math.floor(Math.random() * randomMessage.length)];

	return (
		<div className="flex min-h-[80vh] items-center justify-center px-4">
			<div className="max-w-lg space-y-8 text-center">
				{/* Glitchy 404 */}
				<div className="relative">
					<div className="select-none font-bold text-6xl text-foreground sm:text-8xl">
						4<span className="inline-block animate-pulse">0</span>4
					</div>
					<div className="absolute inset-0 animate-ping font-bold text-6xl text-highlight/30 sm:text-8xl">
						4<span className="inline-block">0</span>4
					</div>
				</div>

				{/* Message with typewriter effect */}
				<div className="space-y-4">
					<div className="font-mono text-lg text-muted-foreground">
						<span className="animate-pulse">&gt;</span> {selectedMessage}
					</div>

					{/* Terminal-style navigation */}
					<div className="space-y-2 font-mono text-muted-foreground/80 text-sm">
						<div className="space-y-1 pl-4 text-left">
							<Link
								className="block cursor-pointer transition-colors hover:text-highlight"
								href="/"
							>
								<span className="text-accent">cd</span> home
							</Link>
							<Link
								className="block cursor-pointer transition-colors hover:text-highlight"
								href="/blog"
							>
								<span className="text-accent">cd</span> blog
							</Link>
							<Link
								className="block cursor-pointer transition-colors hover:text-highlight"
								href="/gear"
							>
								<span className="text-accent">cd</span> gear
							</Link>
							<Link
								className="block cursor-pointer transition-colors hover:text-highlight"
								href="/projects"
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
