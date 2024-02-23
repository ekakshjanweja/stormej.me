"use client";

import React from "react";
import AdminBar from "./admin";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import {
  atomOneLight,
  nightOwl,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useTheme } from "next-themes";

const Code = (props: any) => {
  const codeContent =
    typeof props.children === "string"
      ? props.children
      : props.children.props.children;
  const className = props.children.props.className || "";
  const matches = className.match(/language-(?<lang>.*)/);
  const language = matches?.groups?.lang || "";

  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div className="text-sm flex flex-col gap-0 my-4">
      <AdminBar code={codeContent} language={language} />
      <SyntaxHighlighter
        className="rounded-md"
        style={isDark ? nightOwl : atomOneLight}
        language={language}
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
