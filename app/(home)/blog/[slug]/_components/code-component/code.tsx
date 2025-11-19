"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useTheme } from "next-themes";

import {
  BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from "@/components/kibo-ui/code-block";

const extractMetaValue = (meta: string | undefined, key: string) => {
  if (!meta) return undefined;
  const regex = new RegExp(`${key}="?(.*?)"?(\\s|$)`);
  return regex.exec(meta)?.[1];
};

const Code = (props: any) => {
  const { resolvedTheme } = useTheme();
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

  const data = [
    {
      language,
      filename,
      code: typeof codeContent === "string" ? codeContent : "",
    },
  ];

  return (
    <div className="my-6">
      <CodeBlock data={data} defaultValue={language}>
        <CodeBlockHeader className="flex items-center justify-end gap-4">
          <CodeBlockSelect>
            <CodeBlockSelectTrigger>
              <CodeBlockSelectValue />
            </CodeBlockSelectTrigger>
            <CodeBlockSelectContent>
              {(item: { language: string }) => (
                <CodeBlockSelectItem key={item.language} value={item.language}>
                  {item.language}
                </CodeBlockSelectItem>
              )}
            </CodeBlockSelectContent>
          </CodeBlockSelect>
          <CodeBlockCopyButton />
        </CodeBlockHeader>
        <CodeBlockBody>
          {(item: { language: string; code: string }) => (
            <CodeBlockItem key={item.language} value={item.language}>
              <CodeBlockContent
                language={item.language as BundledLanguage}
                themes={{
                  light:
                    resolvedTheme === "dark" ? "vitesse-dark" : "vitesse-light",
                  dark:
                    resolvedTheme === "dark" ? "vitesse-dark" : "vitesse-light",
                }}
              >
                {item.code}
              </CodeBlockContent>
            </CodeBlockItem>
          )}
        </CodeBlockBody>
      </CodeBlock>
    </div>
  );
};

export default Code;
