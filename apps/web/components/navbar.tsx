"use client";

import { X as CloseIcon, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { track } from "@/lib/analytics";
import { resume } from "@/lib/constants/links";
import { TROVE_ENABLED } from "@/lib/trove-config";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/work", label: "work" },
	{ href: "/projects", label: "projects" },
	{ href: "/blog", label: "blog" },
	...(TROVE_ENABLED ? [{ href: "/trove", label: "trove" }] : []),
];

export function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const { setTheme } = useTheme();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen((prev) => {
			track("mobile_menu_toggled", { open: !prev });
			return !prev;
		});
	};
	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	useEffect(() => {
		closeMobileMenu();
	}, [closeMobileMenu]);

	useEffect(() => {
		document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isMobileMenuOpen]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isMobileMenuOpen) {
				const target = event.target as HTMLElement;
				const mobileMenu = document.getElementById("mobile-menu");
				const menuButton = document.getElementById("mobile-menu-button");
				if (
					mobileMenu &&
					!mobileMenu.contains(target) &&
					menuButton &&
					!menuButton.contains(target)
				) {
					closeMobileMenu();
				}
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isMobileMenuOpen, closeMobileMenu]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isMobileMenuOpen) {
				closeMobileMenu();
				return;
			}
			if (pathname?.startsWith("/vault")) {
				return;
			}
			if (
				!(
					isMobileMenuOpen ||
					event.ctrlKey ||
					event.altKey ||
					event.shiftKey ||
					event.metaKey
				)
			) {
				const key = event.key.toLowerCase();
				const shortcutMap: Record<string, string> = {
					b: "navigate_blog",
					g: "navigate_gear",
					h: "navigate_home",
					p: "navigate_projects",
					w: "navigate_work",
					// No shortcut to a section that isn't there. The `v` case below is
					// unreachable without this entry, since an unmapped key returns.
					...(TROVE_ENABLED ? { v: "navigate_trove" } : {}),
					r: "open_resume",
					t: "toggle_theme",
				};
				const action = shortcutMap[key];
				if (!action) {
					return;
				}
				track("keyboard_shortcut_used", { action, key });
				switch (key) {
					case "h":
						router.push("/");
						break;
					case "w":
						router.push("/work");
						break;
					case "p":
						router.push("/projects");
						break;
					case "b":
						router.push("/blog");
						break;
					case "g":
						router.push("/gear");
						break;
					case "v":
						router.push("/trove");
						break;
					case "t": {
						const currentTheme = document.documentElement.classList.contains(
							"dark"
						)
							? "dark"
							: "light";
						const next = currentTheme === "dark" ? "light" : "dark";
						track("theme_toggled", { source: "keyboard", to: next });
						setTheme(next);
						break;
					}
					case "r":
						window.open(resume, "_blank");
						break;
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [router, setTheme, isMobileMenuOpen, pathname, closeMobileMenu]);

	return (
		<>
			<nav
				className={cn(
					"sticky top-0 z-50 mb-10 px-4 py-5",
					"flex items-center justify-between",
					"bg-background/85 backdrop-blur-md"
				)}
			>
				<Link
					className={cn(
						"font-normal text-[15px] text-foreground tracking-tight",
						"hover-dim",
						"rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
					)}
					href="/"
				>
					ekaksh janweja
				</Link>

				<div className="hidden items-center gap-8 md:flex">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"font-normal text-[15px] text-foreground transition-opacity duration-150",
									isActive ? "opacity-100" : "opacity-60 hover:opacity-100",
									"rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
								)}
								href={item.href}
								key={item.href}
								onClick={() =>
									track("nav_link_clicked", {
										href: item.href,
										label: item.label,
										surface: "desktop",
									})
								}
							>
								{item.label}
							</Link>
						);
					})}
					<ModeToggle />
				</div>

				<div className="flex items-center gap-3 md:hidden">
					<ModeToggle />
					<button
						aria-label="Toggle mobile menu"
						className="hover-dim -mr-2 rounded p-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						id="mobile-menu-button"
						onClick={toggleMobileMenu}
					>
						{isMobileMenuOpen ? (
							<CloseIcon className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>
			</nav>

			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md md:hidden"
					id="mobile-menu"
				>
					<div className="flex justify-end p-4">
						<button
							aria-label="Close mobile menu"
							className="hover-dim p-2 text-foreground"
							onClick={closeMobileMenu}
						>
							<CloseIcon className="h-5 w-5" />
						</button>
					</div>
					<div className="mx-auto flex max-w-sm flex-col gap-5 p-6 pt-4">
						{navItems.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									aria-current={isActive ? "page" : undefined}
									className={cn(
										"font-normal text-base text-foreground transition-opacity duration-150",
										isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
									)}
									href={item.href}
									key={item.href}
									onClick={() => {
										track("nav_link_clicked", {
											href: item.href,
											label: item.label,
											surface: "mobile",
										});
										closeMobileMenu();
									}}
								>
									{item.label}
								</Link>
							);
						})}
					</div>
				</div>
			)}
		</>
	);
}
