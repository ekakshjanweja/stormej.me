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
    <div>
      <AdminBar code={codeContent} language={language} />
      <SyntaxHighlighter
        className="rounded-lg"
        style={anOldHope}
        language={language}
        wrapLongLines={true}
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
