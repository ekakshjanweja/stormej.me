"use client";
import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
function AdminBar({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="bg-muted flex justify-between items-center px-4 py-2 rounded-t-lg">
      <span className="text-foreground text-base">
        {language}
      </span>
      <button
        onClick={copyToClipboard}
        className="text-foreground text-sm  px-2 py-1 rounded-sm h-6 flex items-center"
      >
        {copied ? (
          <div className="flex gap-2 items-center">
            <CheckIcon className="h-4 w-4" />
            Code Copied!
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <CopyIcon className="h-4 w-4" />
          </div>
        )}
      </button>
    </div>
  );
}

export default AdminBar;
