"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowUpRight,
  FileText,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";

import { VaultFileUpload } from "@/components/vault-file-upload";
import { Button } from "@/components/ui/button";

type AdminFile = {
  key: string;
  size: number;
  uploaded: string;
  publicUrl: string;
};

type LoginResponse = {
  token: string;
  resumeKey: string;
  publicUrl: string;
};

const getWorkerUrl = () => {
  if (process.env.NEXT_PUBLIC_WORKER_URL) {
    return process.env.NEXT_PUBLIC_WORKER_URL.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8787";
  }

  return "https://www.stormej.me";
};

const normalizeKey = (key: string) => key.trim();

const isValidKey = (key: string) =>
  key.length > 0 &&
  !key.includes("/") &&
  !key.includes("..") &&
  /\.[a-z0-9]+$/i.test(key);

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
  token: string,
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
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );
    request.send(file);
  });

const inputClassName =
  "rounded-md border border-border/60 bg-background px-3 py-2.5 text-[14px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40";

export default function VaultPage() {
  const workerUrl = useMemo(getWorkerUrl, []);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
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

  const setMessage = (message: string) => {
    setStatus(message);
    setError(null);
  };

  const setFailure = (message: string) => {
    setError(message);
    setStatus(null);
  };

  const requireToken = () => {
    if (!token) {
      throw new Error("log in before managing files.");
    }
    return token;
  };

  const readError = async (response: Response) => {
    const text = await response.text();
    try {
      const json = JSON.parse(text) as { error?: string };
      return json.error ?? text;
    } catch {
      return text;
    }
  };

  const fetchFiles = async (authToken = token) => {
    if (!authToken) return;

    const response = await fetch(`${workerUrl}/admin/files`, {
      headers: { Authorization: `Bearer ${authToken}` },
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
    setRenameKeys((current) => {
      const next: Record<string, string> = {};
      for (const file of data.files) {
        next[file.key] = current[file.key] ?? file.key;
      }
      return next;
    });
  };

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`${workerUrl}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      if (!response.ok) {
        throw new Error("wrong credentials. respectfully leave.");
      }

      const data = (await response.json()) as LoginResponse;
      setToken(data.token);
      setResumeKey(data.resumeKey);
      setNewFileKey(data.resumeKey);
      setMessage("welcome to the abyss.");
      await fetchFiles(data.token);
    } catch (loginError) {
      setFailure(
        loginError instanceof Error ? loginError.message : "login failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (
    key: string,
    file: File,
    onProgress: (progress: number) => void
  ) => {
    const authToken = requireToken();
    const normalizedKey = normalizeKey(key);

    if (!isValidKey(normalizedKey)) {
      throw new Error("file key must be a single filename with an extension.");
    }

    await uploadWithProgress(
      `${workerUrl}/admin/files/${encodeURIComponent(normalizedKey)}`,
      authToken,
      file,
      onProgress
    );
    setMessage(`uploaded ${normalizedKey}.`);
    await fetchFiles(authToken);
  };

  const renameFile = async (currentKey: string) => {
    const authToken = requireToken();
    const nextKey = normalizeKey(renameKeys[currentKey] ?? currentKey);

    if (!isValidKey(nextKey)) {
      setFailure("new key must be a single filename with an extension.");
      return;
    }

    const response = await fetch(
      `${workerUrl}/admin/files/${encodeURIComponent(currentKey)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: nextKey }),
      }
    );

    if (!response.ok) {
      setFailure(await readError(response));
      return;
    }

    setMessage(
      currentKey === nextKey ? "nothing changed." : `renamed to ${nextKey}.`
    );
    await fetchFiles(authToken);
  };

  const deleteFile = async (key: string) => {
    const authToken = requireToken();
    if (!window.confirm(`delete ${key}?`)) return;

    const response = await fetch(
      `${workerUrl}/admin/files/${encodeURIComponent(key)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (!response.ok) {
      setFailure(await readError(response));
      return;
    }

    setMessage(`deleted ${key}.`);
    await fetchFiles(authToken);
  };

  if (!token) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center py-12">
        <div className="flex w-full max-w-[40ch] flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-5">
            <p className="section-label">the vault™</p>
            <h1 className="hero-lede text-[clamp(24px,4vw,32px)]">
              where all the chaos lives. resumes, screenshots, random docs,
              mildly{" "}
              <span className="font-serif italic text-[var(--text-highlight)]">
                important
              </span>{" "}
              things, probably a few cursed files too.
            </h1>
            <p className="text-[14px] leading-6 text-muted-foreground">
              if you somehow landed here without access, respectfully pretend
              you didn&apos;t.
            </p>
            <p className="meta-tag normal-case tracking-[0.08em]">
              admins only.
            </p>
          </div>

          <form
            className="flex w-full flex-col gap-4 text-left"
            onSubmit={login}
          >
            <label className="flex flex-col gap-1.5">
              <span className="meta-tag normal-case">username</span>
              <input
                value={id}
                onChange={(event) => setId(event.target.value)}
                className={inputClassName}
                autoComplete="username"
                placeholder="who goes there"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="meta-tag normal-case">password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClassName}
                type="password"
                autoComplete="current-password"
                placeholder="the secret word"
              />
            </label>
            <Button
              type="submit"
              disabled={isLoading}
              className="group mt-2 inline-flex items-center justify-center gap-2 self-center rounded-full bg-foreground px-5 py-3 text-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:py-2.5"
            >
              <span className="tabular-nums">
                {isLoading ? "opening..." : "enter the abyss"}
              </span>
              <ArrowUpRight
                className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Button>
          </form>

          {error && (
            <p className="meta-tag normal-case text-destructive">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 py-2">
      <section>
        <p className="section-label">the vault™</p>
        <h1 className="hero-lede mt-5 text-[clamp(26px,4vw,34px)] max-w-[58ch]">
          where all the chaos lives. resumes, screenshots, random docs, mildly{" "}
          <span className="font-serif italic text-[var(--text-highlight)]">
            important
          </span>{" "}
          things, probably a few cursed files too.
        </h1>
        <p className="mt-6 max-w-[58ch] text-[14px] leading-6 text-muted-foreground">
          if you somehow landed here without access, respectfully pretend you
          didn&apos;t.
        </p>
        <p className="meta-tag mt-3 normal-case tracking-[0.08em]">
          admins only.
        </p>
      </section>

      <section data-cursor-anchor="resume">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="section-label">canonical resume</h2>
          <button
            type="button"
            onClick={() =>
              fetchFiles().catch((err) => setFailure(err.message))
            }
            className="meta-tag hover-dim inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
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
              last uploaded{" "}
              {new Date(currentResume.uploaded).toLocaleString()} ·{" "}
              {formatBytes(currentResume.size)}
            </p>
          ) : (
            <p className="meta-tag normal-case">
              no <span className="font-mono">{resumeKey}</span> yet.
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href={publicResumeUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 text-[13px] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
            >
              <FileText className="size-3.5 shrink-0" aria-hidden />
              <span className="tabular-nums">open resume</span>
              <ArrowUpRight
                className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                aria-hidden
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
        <p className="mb-5 text-[13px] leading-5 text-muted-foreground">
          type a key, drop a file. existing keys get overwritten without
          ceremony.
        </p>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="meta-tag normal-case">file key</span>
            <input
              value={newFileKey}
              onChange={(event) => setNewFileKey(event.target.value)}
              className={`${inputClassName} font-mono text-sm`}
              placeholder="resume.pdf"
            />
          </label>
          <VaultFileUpload
            targetKey={normalizeKey(newFileKey) || "new-file"}
            description="pdfs and images. one filename like resume.pdf or sunset.jpg."
            uploadButtonLabel="upload to vault"
            successMessage="filed away."
            onUpload={(file, onProgress) =>
              uploadFile(newFileKey, file, onProgress)
            }
          />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="section-label">the vault</h2>
          <span className="meta-tag whitespace-nowrap">
            {sortedFiles.length === 0
              ? "(empty)"
              : `(${sortedFiles.length})`}
          </span>
        </div>
        {sortedFiles.length === 0 ? (
          <p className="meta-tag normal-case">nothing here yet.</p>
        ) : (
          <ul className="flex flex-col">
            {sortedFiles.map((file) => (
              <li
                key={file.key}
                className="group/file border-t border-border/60 py-5 first:border-t-0 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="break-all font-mono text-[13px] text-foreground">
                        {file.key}
                      </span>
                      {file.key === resumeKey && (
                        <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
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
                      href={file.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-3 py-1.5 text-[12px] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                    >
                      <span className="tabular-nums">open</span>
                      <ArrowUpRight
                        className="size-3 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                        aria-hidden
                      />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        deleteFile(file.key).catch((err) =>
                          setFailure(err.message)
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-background px-3 py-1.5 text-[12px] text-destructive transition-all duration-200 hover:-translate-y-0.5 hover:border-destructive/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20 focus-visible:ring-offset-2"
                    >
                      <Trash2 className="size-3 shrink-0" aria-hidden />
                      <span>delete</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={renameKeys[file.key] ?? file.key}
                    onChange={(event) =>
                      setRenameKeys((current) => ({
                        ...current,
                        [file.key]: event.target.value,
                      }))
                    }
                    className={`${inputClassName} min-w-0 flex-1 py-2 font-mono text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      renameFile(file.key).catch((err) =>
                        setFailure(err.message)
                      )
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/40 bg-background px-4 py-2 text-[12px] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                  >
                    <Pencil className="size-3 shrink-0" aria-hidden />
                    <span>rename</span>
                  </button>
                </div>

                <details className="mt-4 group/replace">
                  <summary className="meta-tag inline-flex cursor-pointer items-center gap-1.5 normal-case hover:text-foreground">
                    <span className="transition-transform group-open/replace:rotate-45">
                      <Plus className="size-3" />
                    </span>
                    replace this file
                  </summary>
                  <div className="mt-4">
                    <VaultFileUpload
                      compact
                      targetKey={file.key}
                      description={`drop a new file to overwrite ${file.key}.`}
                      uploadButtonLabel="replace"
                      successMessage={`${file.key} swapped.`}
                      onUpload={(selectedFile, onProgress) =>
                        uploadFile(file.key, selectedFile, onProgress)
                      }
                    />
                  </div>
                </details>
              </li>
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
