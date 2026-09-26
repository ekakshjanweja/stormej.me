// biome-ignore-all lint/suspicious/noUnnecessaryConditions: biome reports the switch cases below as unreachable; they are not
"use client";

import { X as CloseIcon, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { useHeroCopy } from "@/components/design/preview-bridge";
import { ModeToggle } from "@/components/mode-toggle";
import { track } from "@/lib/analytics";
import { cal, mailTo, resume } from "@/lib/constants/links";
import { TROVE_ENABLED } from "@/lib/trove-config";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/work", label: "work", shortcut: "w" },
	{ href: "/projects", label: "projects", shortcut: "p" },
	{ href: "/blog", label: "blog", shortcut: "b" },
	...(TROVE_ENABLED ? [{ href: "/trove", label: "trove", shortcut: "v" }] : []),
];

/** only some navbar designs show it (see app/design.css) */
const homeItem = { href: "/", label: "home", shortcut: "h" };

const focusRing =
	"rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2";

/** Single-key shortcuts. A key missing here is simply not a shortcut. */
const SHORTCUT_ACTIONS: Record<string, string> = {
	b: "navigate_blog",
	g: "navigate_gear",
	h: "navigate_home",
	p: "navigate_projects",
	r: "open_resume",
	t: "toggle_theme",
	w: "navigate_work",
	// no shortcut to a section that isn't there
	...(TROVE_ENABLED ? { v: "navigate_trove" } : {}),
};

const SHORTCUT_PATHS: Record<string, string> = {
	b: "/blog",
	g: "/gear",
	h: "/",
	p: "/projects",
	w: "/work",
	...(TROVE_ENABLED ? { v: "/trove" } : {}),
};

type NavItem = (typeof navItems)[number];

function DesktopNavLink({
	className,
	item,
	isActive,
}: {
	className?: string;
	item: NavItem;
	isActive: boolean;
}) {
	const onClick = useCallback(
		() =>
			track("nav_link_clicked", {
				href: item.href,
				label: item.label,
				surface: "desktop",
			}),
		[item.href, item.label]
	);

	return (
		<Link
			aria-current={isActive ? "page" : undefined}
			className={cn(
				"nav-link font-normal text-[15px] text-foreground transition-opacity duration-150",
				isActive ? "opacity-100" : "opacity-60 hover:opacity-100",
				focusRing,
				className
			)}
			href={item.href}
			onClick={onClick}
		>
			<kbd aria-hidden className="nav-key">
				{item.shortcut}
			</kbd>
			{item.label}
		</Link>
	);
}

function MobileNavLink({
	item,
	isActive,
	onNavigate,
}: {
	item: NavItem;
	isActive: boolean;
	onNavigate: () => void;
}) {
	const onClick = useCallback(() => {
		track("nav_link_clicked", {
			href: item.href,
			label: item.label,
			surface: "mobile",
		});
		onNavigate();
	}, [item.href, item.label, onNavigate]);

	return (
		<Link
			aria-current={isActive ? "page" : undefined}
			className={cn(
				"font-normal text-base text-foreground transition-opacity duration-150",
				isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
			)}
			href={item.href}
			onClick={onClick}
		>
			{item.label}
		</Link>
	);
}

export function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const { setTheme } = useTheme();
	const { cta } = useHeroCopy();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = useCallback(() => {
		setIsMobileMenuOpen((prev) => {
			track("mobile_menu_toggled", { open: !prev });
			return !prev;
		});
	}, []);
	const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

	// navigating away closes the menu
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a value the effect reads
	useEffect(() => {
		closeMobileMenu();
	}, [pathname, closeMobileMenu]);

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

	const runShortcut = useCallback(
		(key: string) => {
			const path = SHORTCUT_PATHS[key];
			if (path) {
				router.push(path);
				return;
			}
			if (key === "t") {
				const isDark = document.documentElement.classList.contains("dark");
				const next = isDark ? "light" : "dark";
				track("theme_toggled", { source: "keyboard", to: next });
				setTheme(next);
				return;
			}
			if (key === "r") {
				window.open(resume, "_blank");
			}
		},
		[router, setTheme]
	);

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
				isMobileMenuOpen ||
				event.ctrlKey ||
				event.altKey ||
				event.shiftKey ||
				event.metaKey
			) {
				return;
			}
			const key = event.key.toLowerCase();
			const action = SHORTCUT_ACTIONS[key];
			if (!action) {
				return;
			}
			track("keyboard_shortcut_used", { action, key });
			runShortcut(key);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isMobileMenuOpen, pathname, closeMobileMenu, runShortcut]);

	// every navbar design shares this markup; app/design.css shows, hides and
	// rearranges the pieces per [data-nav], so previews can restyle it live
	return (
		<>
			<nav
				className={cn(
					"site-nav sticky top-0 z-50 mb-10 px-4 py-5",
					"flex items-center justify-between",
					"bg-background/85 backdrop-blur-md"
				)}
			>
				<Link
					aria-label="ekaksh janweja, home"
					className={cn(
						"nav-brand font-normal text-[15px] text-foreground tracking-tight",
						"hover-dim",
						focusRing
					)}
					href="/"
				>
					<span className="nav-brand-full">ekaksh janweja</span>
					<span className="nav-brand-short">ej</span>
				</Link>

				<div className="nav-links hidden items-center gap-8 md:ml-auto md:flex">
					<DesktopNavLink
						className="nav-home"
						isActive={pathname === homeItem.href}
						item={homeItem}
					/>
					{navItems.map((item) => (
						<DesktopNavLink
							isActive={pathname === item.href}
							item={item}
							key={item.href}
						/>
					))}
				</div>

				<div className="nav-actions flex items-center gap-3 md:ml-8 md:gap-4">
					<Link
						className={cn(
							"nav-contact text-[15px] text-foreground",
							"hover-dim",
							focusRing
						)}
						href={mailTo}
					>
						contact
					</Link>
					<Link
						className={cn("nav-cta text-[13px]", focusRing)}
						href={cal}
						rel="noopener noreferrer"
						target="_blank"
					>
						{cta}
					</Link>
					<span aria-hidden className="nav-sep" />
					<ModeToggle />
					<button
						aria-expanded={isMobileMenuOpen}
						aria-label="Toggle menu"
						className="nav-menu-button hover-dim -mr-2 inline-flex rounded p-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 md:hidden"
						id="mobile-menu-button"
						onClick={toggleMobileMenu}
						type="button"
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
					className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md"
					id="mobile-menu"
				>
					<div className="flex justify-end p-4">
						<button
							aria-label="Close mobile menu"
							className="hover-dim p-2 text-foreground"
							onClick={closeMobileMenu}
							type="button"
						>
							<CloseIcon className="h-5 w-5" />
						</button>
					</div>
					<div className="mx-auto flex max-w-sm flex-col gap-5 p-6 pt-4">
						{navItems.map((item) => (
							<MobileNavLink
								isActive={pathname === item.href}
								item={item}
								key={item.href}
								onNavigate={closeMobileMenu}
							/>
						))}
					</div>
				</div>
			)}
		</>
	);
}
