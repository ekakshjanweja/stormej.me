"use client";

import {
	ArrowUpRight,
	FileText,
	LogOut,
	Pencil,
	Plus,
	RefreshCcw,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import {
	type ChangeEvent,
	type FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { VaultFileUpload } from "@/components/vault-file-upload";

interface AdminFile {
	key: string;
	publicUrl: string;
	size: number;
	uploaded: string;
}

const TRAILING_SLASH = /\/$/;

const getWorkerUrl = () => {
	if (process.env.NEXT_PUBLIC_WORKER_URL) {
		return process.env.NEXT_PUBLIC_WORKER_URL.replace(TRAILING_SLASH, "");
	}

	if (process.env.NODE_ENV === "development") {
		return "http://localhost:8787";
	}

	return "https://www.stormej.me";
};

const FILE_EXTENSION = /\.[a-z0-9]+$/i;

const normalizeKey = (key: string) => key.trim();

const isValidKey = (key: string) =>
	key.length > 0 &&
	!key.includes("/") &&
	!key.includes("..") &&
	FILE_EXTENSION.test(key);

const formatBytes = (bytes: number) => {
	if (bytes === 0) {
		return "0 B";
	}

	const units = ["B", "KB", "MB"];
	const unitIndex = Math.min(
		Math.floor(Math.log(bytes) / Math.log(1024)),
		units.length - 1
	);

	return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${
		units[unitIndex]
	}`;
};

const uploadWithProgress = (
	url: string,
	file: File,
	onProgress: (progress: number) => void
) =>
	new Promise<void>((resolve, reject) => {
		const request = new XMLHttpRequest();

		request.upload.onprogress = (event) => {
			if (!event.lengthComputable) {
				return;
			}

			onProgress(Math.round((event.loaded / event.total) * 100));
		};

		request.onload = () => {
			if (request.status >= 200 && request.status < 300) {
				resolve();
				return;
			}

			reject(new Error(request.responseText || "upload failed."));
		};

		request.onerror = () => reject(new Error("upload failed."));
		request.open("PUT", url);
		request.withCredentials = true;
		request.setRequestHeader(
			"Content-Type",
			file.type || "application/octet-stream"
		);
		request.send(file);
	});

const inputClassName =
	"rounded-md border border-border/60 bg-background px-3 py-2.5 text-[14px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40";

const readError = async (response: Response) => {
	const text = await response.text();
	try {
		const json = JSON.parse(text) as { error?: string };
		return json.error ?? text;
	} catch {
		return text;
	}
};

interface VaultFileRowProps {
	file: AdminFile;
	isResume: boolean;
	onDelete: (key: string) => Promise<void>;
	onFailure: (message: string) => void;
	onRename: (key: string) => Promise<void>;
	onRenameKeyChange: (key: string, value: string) => void;
	onUpload: (
		key: string,
		file: File,
		onProgress: (progress: number) => void
	) => Promise<void>;
	renameKey: string;
}

function VaultFileRow({
	file,
	isResume,
	renameKey,
	onDelete,
	onFailure,
	onRename,
	onRenameKeyChange,
	onUpload,
}: VaultFileRowProps) {
	const remove = useCallback(() => {
		onDelete(file.key).catch((err: Error) => onFailure(err.message));
	}, [file.key, onDelete, onFailure]);

	const rename = useCallback(() => {
		onRename(file.key).catch((err: Error) => onFailure(err.message));
	}, [file.key, onFailure, onRename]);

	const onKeyInput = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			onRenameKeyChange(file.key, event.target.value),
		[file.key, onRenameKeyChange]
	);

	const replace = useCallback(
		(selectedFile: File, onProgress: (progress: number) => void) =>
			onUpload(file.key, selectedFile, onProgress),
		[file.key, onUpload]
	);

	return (
		<li
			className="group/file border-border/60 border-t py-5 first:border-t-0 first:pt-0 last:pb-0"
			key={file.key}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<FileText className="size-4 shrink-0 text-muted-foreground" />
						<span className="break-all font-mono text-[13px] text-foreground">
							{file.key}
						</span>
						{isResume && (
							<span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
								resume
							</span>
						)}
					</div>
					<p className="meta-tag mt-2 normal-case">
						{formatBytes(file.size)} · uploaded{" "}
						{new Date(file.uploaded).toLocaleString()}
					</p>
				</div>

				<div className="flex shrink-0 flex-wrap items-center gap-2">
					<a
						className="group inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-3 py-1.5 text-[12px] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						href={file.publicUrl}
						rel="noreferrer"
						target="_blank"
					>
						<span className="tabular-nums">open</span>
						<ArrowUpRight
							aria-hidden
							className="size-3 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
						/>
					</a>
					<button
						className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-background px-3 py-1.5 text-[12px] text-destructive transition-all duration-200 hover:-translate-y-0.5 hover:border-destructive/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20 focus-visible:ring-offset-2"
						onClick={remove}
						type="button"
					>
						<Trash2 aria-hidden className="size-3 shrink-0" />
						<span>delete</span>
					</button>
				</div>
			</div>

			<div className="mt-4 flex flex-col gap-2 sm:flex-row">
				<input
					className={`${inputClassName} min-w-0 flex-1 py-2 font-mono text-sm`}
					onChange={onKeyInput}
					value={renameKey}
				/>
				<button
					className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/40 bg-background px-4 py-2 text-[12px] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
					onClick={rename}
					type="button"
				>
					<Pencil aria-hidden className="size-3 shrink-0" />
					<span>rename</span>
				</button>
			</div>

			<details className="group/replace mt-4">
				<summary className="meta-tag inline-flex cursor-pointer items-center gap-1.5 normal-case hover:text-foreground">
					<span className="transition-transform group-open/replace:rotate-45">
						<Plus className="size-3" />
					</span>
					replace this file
				</summary>
				<div className="mt-4">
					<VaultFileUpload
						compact
						description={`drop a new file to overwrite ${file.key}.`}
						onUpload={replace}
						successMessage={`${file.key} swapped.`}
						targetKey={file.key}
						uploadButtonLabel="replace"
					/>
				</div>
			</details>
		</li>
	);
}

export default function VaultPage() {
	const workerUrl = useMemo(getWorkerUrl, []);
	const [accessKey, setAccessKey] = useState("");
	const [isUnlocked, setIsUnlocked] = useState(false);
	const [isCheckingGate, setIsCheckingGate] = useState(true);
	const [resumeKey, setResumeKey] = useState("resume.pdf");
	const [files, setFiles] = useState<AdminFile[]>([]);
	const [newFileKey, setNewFileKey] = useState("resume.pdf");
	const [renameKeys, setRenameKeys] = useState<Record<string, string>>({});
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const publicResumeUrl = `${workerUrl}/files/${resumeKey}`;
	const sortedFiles = [...files].sort((a, b) => a.key.localeCompare(b.key));
	const currentResume = files.find((file) => file.key === resumeKey);

	const setMessage = useCallback((message: string) => {
		setStatus(message);
		setError(null);
	}, []);

	const setFailure = useCallback((message: string) => {
		setError(message);
		setStatus(null);
	}, []);

	const fetchFiles = useCallback(async () => {
		const response = await fetch("/admin/files", {
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error(await readError(response));
		}

		const data = (await response.json()) as {
			files: AdminFile[];
			resumeKey: string;
		};
		setFiles(data.files);
		setResumeKey(data.resumeKey);
		setNewFileKey(data.resumeKey);
		setRenameKeys((current) => {
			const next: Record<string, string> = {};
			for (const file of data.files) {
				next[file.key] = current[file.key] ?? file.key;
			}
			return next;
		});
	}, []);

	const refresh = useCallback(() => {
		fetchFiles().catch((listError: Error) => setFailure(listError.message));
	}, [fetchFiles, setFailure]);

	// cookie survives reloads — probe /admin/files to see if the gate is open
	useEffect(() => {
		let cancelled = false;

		const probe = async () => {
			try {
				await fetchFiles();
				if (!cancelled) {
					setIsUnlocked(true);
				}
			} catch {
				if (!cancelled) {
					setIsUnlocked(false);
				}
			} finally {
				if (!cancelled) {
					setIsCheckingGate(false);
				}
			}
		};

		probe().catch(() => {
			if (!cancelled) {
				setIsUnlocked(false);
				setIsCheckingGate(false);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [fetchFiles]);

	const unlock = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			setIsLoading(true);
			setError(null);
			setStatus(null);

			const response = await fetch("/admin/unlock", {
				body: JSON.stringify({ key: accessKey }),
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});

			setIsLoading(false);

			if (!response.ok) {
				setFailure(await readError(response));
				return;
			}

			setIsUnlocked(true);
			setAccessKey("");
			setMessage("welcome to the abyss.");
			await fetchFiles();
		},
		[accessKey, fetchFiles, setFailure, setMessage]
	);

	const logout = useCallback(async () => {
		await fetch("/admin/lock", {
			credentials: "include",
			method: "POST",
		});
		setIsUnlocked(false);
		setFiles([]);
		setMessage("sealed behind you.");
	}, [setMessage]);

	const signOutClicked = useCallback(() => {
		logout().catch((logoutError: Error) => setFailure(logoutError.message));
	}, [logout, setFailure]);

	const uploadFile = useCallback(
		async (key: string, file: File, onProgress: (progress: number) => void) => {
			const normalizedKey = normalizeKey(key);

			if (!isValidKey(normalizedKey)) {
				throw new Error(
					"file key must be a single filename with an extension."
				);
			}

			await uploadWithProgress(
				`/admin/files/${encodeURIComponent(normalizedKey)}`,
				file,
				onProgress
			);
			setMessage(`uploaded ${normalizedKey}.`);
			await fetchFiles();
		},
		[fetchFiles, setMessage]
	);

	const uploadNewFile = useCallback(
		(file: File, onProgress: (progress: number) => void) =>
			uploadFile(newFileKey, file, onProgress),
		[newFileKey, uploadFile]
	);

	const renameFile = useCallback(
		async (currentKey: string) => {
			const nextKey = normalizeKey(renameKeys[currentKey] ?? currentKey);

			if (!isValidKey(nextKey)) {
				setFailure("new key must be a single filename with an extension.");
				return;
			}

			const response = await fetch(
				`/admin/files/${encodeURIComponent(currentKey)}`,
				{
					body: JSON.stringify({ key: nextKey }),
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					method: "PATCH",
				}
			);

			if (!response.ok) {
				setFailure(await readError(response));
				return;
			}

			setMessage(
				currentKey === nextKey ? "nothing changed." : `renamed to ${nextKey}.`
			);
			await fetchFiles();
		},
		[fetchFiles, renameKeys, setFailure, setMessage]
	);

	const deleteFile = useCallback(
		async (key: string) => {
			// biome-ignore lint/suspicious/noAlert: a destructive single-admin action; a modal would be ceremony
			if (!window.confirm(`delete ${key}?`)) {
				return;
			}

			const response = await fetch(`/admin/files/${encodeURIComponent(key)}`, {
				credentials: "include",
				method: "DELETE",
			});

			if (!response.ok) {
				setFailure(await readError(response));
				return;
			}

			setMessage(`deleted ${key}.`);
			await fetchFiles();
		},
		[fetchFiles, setFailure, setMessage]
	);

	const onAccessKeyChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setAccessKey(event.target.value),
		[]
	);

	const onNewFileKeyChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setNewFileKey(event.target.value),
		[]
	);

	const onRenameKeyChange = useCallback((key: string, value: string) => {
		setRenameKeys((current) => ({ ...current, [key]: value }));
	}, []);

	if (isCheckingGate) {
		return (
			<div className="flex min-h-[70vh] w-full items-center justify-center py-12">
				<p className="meta-tag normal-case">checking the locks...</p>
			</div>
		);
	}

	if (!isUnlocked) {
		return (
			<div className="flex min-h-[70vh] w-full items-center justify-center py-12">
				<div className="flex w-full max-w-[40ch] flex-col items-center gap-8 text-center">
					<div className="flex flex-col items-center gap-5">
						<p className="section-label">the vault™</p>
						<h1 className="hero-lede text-[clamp(24px,4vw,32px)]">
							where all the chaos lives. resumes, screenshots, random docs,
							mildly{" "}
							<span className="font-serif text-[var(--text-highlight)] italic">
								important
							</span>{" "}
							things, probably a few cursed files too.
						</h1>
						<p className="text-[14px] text-muted-foreground leading-6">
							locked with a private key only the owner has. if you somehow
							landed here without it, respectfully pretend you didn&apos;t.
						</p>
						<p className="meta-tag normal-case tracking-[0.08em]">
							admins only.
						</p>
					</div>

					<form
						className="flex w-full flex-col gap-4 text-left"
						onSubmit={unlock}
					>
						<label className="flex flex-col gap-1.5">
							<span className="meta-tag normal-case">access key</span>
							<input
								autoComplete="current-password"
								className={inputClassName}
								onChange={onAccessKeyChange}
								placeholder="the key that opens nothing for anyone else"
								spellCheck={false}
								type="password"
								value={accessKey}
							/>
						</label>
						<Button
							className="group mt-2 inline-flex items-center justify-center gap-2 self-center rounded-full bg-foreground px-5 py-3 text-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:py-2.5"
							disabled={isLoading || accessKey.trim().length === 0}
							type="submit"
						>
							<span className="tabular-nums">
								{isLoading ? "opening..." : "enter the abyss"}
							</span>
							<ArrowUpRight
								aria-hidden
								className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
							/>
						</Button>
					</form>

					<p className="meta-tag normal-case tracking-[0.08em]">
						<Link className="hover-dim" href="/privacy">
							privacy
						</Link>
						<span aria-hidden className="mx-2 opacity-40">
							·
						</span>
						<Link className="hover-dim" href="/terms">
							terms
						</Link>
					</p>

					{error && (
						<p className="meta-tag text-destructive normal-case">{error}</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-12 py-2">
			<section>
				<p className="section-label">the vault™</p>
				<h1 className="hero-lede mt-5 max-w-[58ch] text-[clamp(26px,4vw,34px)]">
					where all the chaos lives. resumes, screenshots, random docs, mildly{" "}
					<span className="font-serif text-[var(--text-highlight)] italic">
						important
					</span>{" "}
					things, probably a few cursed files too.
				</h1>
				<p className="mt-6 max-w-[58ch] text-[14px] text-muted-foreground leading-6">
					if you somehow landed here without access, respectfully pretend you
					didn&apos;t.
				</p>
				<div className="mt-3 flex items-baseline justify-between gap-4">
					<p className="meta-tag normal-case tracking-[0.08em]">admins only.</p>
					<button
						className="meta-tag hover-dim inline-flex items-center gap-1.5 rounded normal-case focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						onClick={signOutClicked}
						type="button"
					>
						<LogOut className="size-3" />
						sign out
					</button>
				</div>
			</section>

			<section data-cursor-anchor="resume">
				<div className="mb-4 flex items-baseline justify-between gap-4">
					<h2 className="section-label">canonical resume</h2>
					<button
						className="meta-tag hover-dim inline-flex items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						onClick={refresh}
						type="button"
					>
						<RefreshCcw className="size-3" />
						refresh
					</button>
				</div>
				<div className="flex flex-col gap-3">
					<div className="break-all rounded-md border border-border/60 bg-muted/20 px-3 py-2.5 font-mono text-xs">
						{publicResumeUrl}
					</div>
					{currentResume ? (
						<p className="meta-tag normal-case">
							last uploaded {new Date(currentResume.uploaded).toLocaleString()}{" "}
							· {formatBytes(currentResume.size)}
						</p>
					) : (
						<p className="meta-tag normal-case">
							no <span className="font-mono">{resumeKey}</span> yet.
						</p>
					)}
					<div className="flex flex-wrap gap-3 pt-1">
						<a
							className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 text-[13px] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
							href={publicResumeUrl}
							rel="noreferrer"
							target="_blank"
						>
							<FileText aria-hidden className="size-3.5 shrink-0" />
							<span className="tabular-nums">open resume</span>
							<ArrowUpRight
								aria-hidden
								className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
							/>
						</a>
					</div>
				</div>
			</section>

			<section>
				<div className="mb-4 flex items-baseline justify-between gap-4">
					<h2 className="section-label inline-flex items-baseline gap-2">
						<Plus className="size-3.5 translate-y-0.5" />
						add or replace
					</h2>
					<span className="meta-tag whitespace-nowrap">
						({sortedFiles.length} in vault)
					</span>
				</div>
				<p className="mb-5 text-[13px] text-muted-foreground leading-5">
					type a key, drop a file. existing keys get overwritten without
					ceremony.
				</p>
				<div className="flex flex-col gap-4">
					<label className="flex flex-col gap-1.5">
						<span className="meta-tag normal-case">file key</span>
						<input
							className={`${inputClassName} font-mono text-sm`}
							onChange={onNewFileKeyChange}
							placeholder="resume.pdf"
							value={newFileKey}
						/>
					</label>
					<VaultFileUpload
						description="pdfs and images. one filename like resume.pdf or sunset.jpg."
						onUpload={uploadNewFile}
						successMessage="filed away."
						targetKey={normalizeKey(newFileKey) || "new-file"}
						uploadButtonLabel="upload to vault"
					/>
				</div>
			</section>

			<section>
				<div className="mb-4 flex items-baseline justify-between gap-4">
					<h2 className="section-label">the vault</h2>
					<span className="meta-tag whitespace-nowrap">
						{sortedFiles.length === 0 ? "(empty)" : `(${sortedFiles.length})`}
					</span>
				</div>
				{sortedFiles.length === 0 ? (
					<p className="meta-tag normal-case">nothing here yet.</p>
				) : (
					<ul className="flex flex-col">
						{sortedFiles.map((file) => (
							<VaultFileRow
								file={file}
								isResume={file.key === resumeKey}
								key={file.key}
								onDelete={deleteFile}
								onFailure={setFailure}
								onRename={renameFile}
								onRenameKeyChange={onRenameKeyChange}
								onUpload={uploadFile}
								renameKey={renameKeys[file.key] ?? file.key}
							/>
						))}
					</ul>
				)}
			</section>

			{(status || error) && (
				<div
					className={`rounded-md border px-3 py-2.5 text-[13px] ${
						error
							? "border-destructive/40 text-destructive"
							: "border-foreground/20 text-foreground"
					}`}
				>
					{error ?? status}
				</div>
			)}
		</div>
	);
}
