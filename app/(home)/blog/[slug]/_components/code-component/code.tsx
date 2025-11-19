"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { codeToHtml, bundledLanguagesInfo } from "shiki";
import type { BundledLanguage, BundledTheme } from "shiki";

// Get file extension from Shiki's bundled language info
function getFileExtension(language: string): string {
  if (!language) return ".txt";

  const langInfo = bundledLanguagesInfo.find(
    (info) =>
      info.id === language.toLowerCase() ||
      info.aliases?.some(
        (alias) => alias.toLowerCase() === language.toLowerCase()
      )
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
  const matches = className.match(/language-(\w+)/);
  const language = matches ? matches[1] : "";
  const fileExtension = getFileExtension(language);

  const theme = useMemo<BundledTheme>(() => {
    return resolvedTheme === "dark" ? "vitesse-dark" : "vitesse-light";
  }, [resolvedTheme]);

  useEffect(() => {
    const highlightCode = async () => {
      if (!codeContent || !language) {
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
        setHighlightedCode(`<pre><code>${codeContent}</code></pre>`);
      } finally {
        setIsLoading(false);
      }
    };

    highlightCode();
  }, [codeContent, language, theme]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/10 bg-muted/30 overflow-hidden my-8">
        <AdminBar code={codeContent} fileExtension={fileExtension} />
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/10 bg-muted/30 overflow-hidden my-8">
      <AdminBar code={codeContent} fileExtension={fileExtension} />
      <div
        className="shiki-container overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!p-4 [&_pre]:!m-0 [&_pre]:!overflow-x-auto"
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="bg-muted flex justify-between items-center px-4 py-2 border-b border-border/10">
      <span className="text-foreground text-sm font-mono">
        {"snippet" + fileExtension || ".txt"}
      </span>
      <button
        onClick={copyToClipboard}
        className="text-foreground text-sm px-3 py-1.5 rounded-md hover:bg-muted-foreground/10 transition-colors duration-200 flex items-center gap-2"
        aria-label="Copy code"
      >
        {copied ? (
          <>
            <CheckIcon className="h-4 w-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon className="h-4 w-4" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
