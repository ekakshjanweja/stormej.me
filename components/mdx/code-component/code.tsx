import React from "react";
import AdminBar from "./admin";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Code = (props: any) => {
  const codeContent =
    typeof props.children === "string"
      ? props.children
      : props.children.props.children;
  const className = props.children.props.className || "";
  const matches = className.match(/language-(?<lang>.*)/);
  const language = matches?.groups?.lang || "";

  return (
    <div className="text-sm flex flex-col gap-0">
      <AdminBar code={codeContent} language={language} />
      <SyntaxHighlighter
        className="rounded-lg"
        style={nightOwl}
        language={language}
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
