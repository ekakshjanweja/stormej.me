/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import AdminBar from "./admin";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { anOldHope } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Code = (props: any) => {
  const codeContent =
    typeof props.children === "string"
      ? props.children
      : props.children.props.children;
  const className = props.children.props?.className || "";
  const matches = className.match(/language-(\w+)/);
  const language = matches ? matches[1] : "";

  return (
    <div className="my-6">
      <AdminBar code={codeContent} language={language} />
      <div className="rounded-lg border border-border/10 bg-muted/30 overflow-hidden shadow-sm dark:bg-black dark:border-gray-800">
        <SyntaxHighlighter
          className="rounded-lg !bg-transparent !p-3"
          style={anOldHope}
          language={language}
          wrapLongLines={true}
          customStyle={{
            background: "transparent",
            fontSize: "13px",
            lineHeight: "1.5",
            margin: 0,
            padding: 0,
            color: "#ffffff", // Pure white text for true dark mode
          }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default Code;
