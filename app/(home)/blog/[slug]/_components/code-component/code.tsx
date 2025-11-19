"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { CodeBlock } from "@/components/ui/code-block";

const extractMetaValue = (meta: string | undefined, key: string) => {
  if (!meta) return undefined;
  const regex = new RegExp(`${key}="?(.*?)"?(\\s|$)`);
  return regex.exec(meta)?.[1];
};

const extractHighlightLines = (meta: string | undefined): number[] => {
  if (!meta) return [];
  const highlightMatch = meta.match(/highlightLines?="?\[(.*?)\]"?/);
  if (highlightMatch) {
    try {
      const lines = highlightMatch[1]
        .split(",")
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n));
      return lines;
    } catch {
      return [];
    }
  }
  return [];
};

const Code = (props: any) => {
  const child = props.children;
  const childProps =
    typeof child === "string" ? ({} as Record<string, unknown>) : child?.props;

  const codeContent =
    typeof child === "string"
      ? child
      : ((childProps?.children as string) ?? "");

  const className = (childProps?.className as string) ?? "";
  const matches = className.match(/language-([\w-]+)/);
  const language = (matches?.[1]?.toLowerCase() ?? "plaintext") as string;

  const metastring =
    (childProps?.node?.data?.meta as string | undefined) ??
    (childProps?.metastring as string | undefined);

  const filename =
    extractMetaValue(metastring, "filename") ??
    (language === "plaintext" ? "code.txt" : `snippet.${language}`);

  const highlightLines = extractHighlightLines(metastring);

  return (
    <CodeBlock
      language={language}
      filename={filename}
      highlightLines={highlightLines}
      code={typeof codeContent === "string" ? codeContent : ""}
    />
  );
};

export default Code;
