"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { codeToHtml, bundledLanguagesInfo } from "shiki";
import type { BundledLanguage, BundledTheme } from "shiki";

const LANGUAGE_REGEX = /language-([a-z0-9+#-]+)/i;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Get file extension from Shiki's bundled language info
function getFileExtension(language: string): string {
  if (!language) return ".txt";

  const langInfo = bundledLanguagesInfo.find(
    (info) =>
      info.id === language.toLowerCase() ||
      info.aliases?.some(
        (alias) => alias.toLowerCase() === language.toLowerCase(),
      ),
  );

  if (langInfo) {
    // If language has aliases, use the first one (typically the primary file extension)
    // Otherwise, use the language ID itself
    const extension = langInfo.aliases?.[0] || langInfo.id;
    return `.${extension}`;
  }

  // Fallback: use the language string as-is with a dot prefix
  return `.${language}`;
}

const Code = (props: any) => {
  const { resolvedTheme } = useTheme();
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const codeContent =
    typeof props.children === "string"
      ? props.children
      : props.children.props.children;
  const className = props.children.props?.className || "";
  const matches = className.match(LANGUAGE_REGEX);
  const language = matches ? matches[1].toLowerCase() : "";
  const fileExtension = getFileExtension(language);

  const theme = useMemo<BundledTheme>(() => {
    return resolvedTheme === "dark" ? "vitesse-dark" : "vitesse-light";
  }, [resolvedTheme]);

  useEffect(() => {
    const highlightCode = async () => {
      if (!codeContent) {
        setHighlightedCode("");
        setIsLoading(false);
        return;
      }

      if (!language) {
        setHighlightedCode(
          `<pre class="language-plaintext"><code>${escapeHtml(codeContent)}</code></pre>`,
        );
        setIsLoading(false);
        return;
      }

      try {
        const html = await codeToHtml(codeContent, {
          lang: language as BundledLanguage,
          theme: theme,
          transformers: [],
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error("Error highlighting code:", error);
        // Fallback to plain text if highlighting fails
        setHighlightedCode(
          `<pre class="language-plaintext"><code>${escapeHtml(codeContent)}</code></pre>`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    highlightCode();
  }, [codeContent, language, theme]);

  if (isLoading) {
    return (
      <div className="group relative my-8 overflow-hidden rounded-xl border border-border/15 bg-muted/30 shadow-sm ring-1 ring-border/10 backdrop-blur-sm transition-colors duration-300 hover:border-border/30 hover:bg-card/55">
        <AdminBar code={codeContent} fileExtension={fileExtension} />
        <div className="border-t border-border/10 px-4 py-4 md:px-5 md:py-5">
          <div className="animate-pulse">
            <div className="mb-2 h-3.5 w-3/4 rounded bg-muted"></div>
            <div className="mb-2 h-3.5 w-2/3 rounded bg-muted"></div>
            <div className="h-3.5 w-1/2 rounded bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative my-8 overflow-hidden rounded-xl border border-border/15 bg-muted/30 shadow-sm ring-1 ring-border/10 backdrop-blur-sm transition-colors duration-300 hover:border-border/30 hover:bg-card/55">
      <AdminBar code={codeContent} fileExtension={fileExtension} />
      <div
        className="shiki-container custom-scrollbar overflow-x-auto border-t border-border/10 [&_code]:text-[12.5px] [&_code]:leading-6 md:[&_code]:text-[13px] [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!px-4 [&_pre]:!py-4 md:[&_pre]:!px-5 md:[&_pre]:!py-5 [&_pre]:!overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </div>
  );
};

export default Code;

function AdminBar({
  code,
  fileExtension,
}: {
  code: string;
  fileExtension: string;
}) {
  const [copied, setCopied] = useState(false);
  const displayExtension = (fileExtension || ".txt").replace(/^\./, "");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-muted/65 via-muted/45 to-muted/25 px-3 py-2.5 md:px-4">
      <span className="inline-flex items-center rounded-md border border-border/30 bg-background/65 px-2 py-1 font-mono text-[11px] font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
        {displayExtension}
      </span>
      <button
        onClick={copyToClipboard}
        className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-200 hover:border-border/40 hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
        aria-label="Copy code"
      >
        {copied ? (
          <>
            <CheckIcon className="h-3.5 w-3.5" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <CopyIcon className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
