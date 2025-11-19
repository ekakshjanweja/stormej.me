"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useTheme } from "next-themes";

import {
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
type BundledLanguage =
  | "1c"
  | "1c-query"
  | "abap"
  | "actionscript-3"
  | "ada"
  | "adoc"
  | "angular-html"
  | "angular-ts"
  | "apache"
  | "apex"
  | "apl"
  | "applescript"
  | "ara"
  | "asciidoc"
  | "asm"
  | "astro"
  | "awk"
  | "ballerina"
  | "bash"
  | "bat"
  | "batch"
  | "be"
  | "beancount"
  | "berry"
  | "bibtex"
  | "bicep"
  | "blade"
  | "bsl"
  | "c"
  | "c#"
  | "c++"
  | "cadence"
  | "cairo"
  | "cdc"
  | "cjs"
  | "clarity"
  | "clj"
  | "clojure"
  | "closure-templates"
  | "cmake"
  | "cmd"
  | "cobol"
  | "codeowners"
  | "codeql"
  | "coffee"
  | "coffeescript"
  | "common-lisp"
  | "console"
  | "coq"
  | "cpp"
  | "cql"
  | "crystal"
  | "cs"
  | "csharp"
  | "css"
  | "csv"
  | "cts"
  | "cue"
  | "cypher"
  | "d"
  | "dart"
  | "dax"
  | "desktop"
  | "diff"
  | "docker"
  | "dockerfile"
  | "dotenv"
  | "dream-maker"
  | "edge"
  | "elisp"
  | "elixir"
  | "elm"
  | "emacs-lisp"
  | "erb"
  | "erl"
  | "erlang"
  | "f"
  | "f#"
  | "f03"
  | "f08"
  | "f18"
  | "f77"
  | "f90"
  | "f95"
  | "fennel"
  | "fish"
  | "fluent"
  | "for"
  | "fortran-fixed-form"
  | "fortran-free-form"
  | "fs"
  | "fsharp"
  | "fsl"
  | "ftl"
  | "gdresource"
  | "gdscript"
  | "gdshader"
  | "genie"
  | "gherkin"
  | "git-commit"
  | "git-rebase"
  | "gjs"
  | "gleam"
  | "glimmer-js"
  | "glimmer-ts"
  | "glsl"
  | "gnuplot"
  | "go"
  | "gql"
  | "graphql"
  | "groovy"
  | "gts"
  | "hack"
  | "haml"
  | "handlebars"
  | "haskell"
  | "haxe"
  | "hbs"
  | "hcl"
  | "hjson"
  | "hlsl"
  | "hs"
  | "html"
  | "html-derivative"
  | "http"
  | "hurl"
  | "hxml"
  | "hy"
  | "imba"
  | "ini"
  | "jade"
  | "java"
  | "javascript"
  | "jinja"
  | "jison"
  | "jl"
  | "js"
  | "json"
  | "json5"
  | "jsonc"
  | "jsonl"
  | "jsonnet"
  | "jssm"
  | "jsx"
  | "julia"
  | "kdl"
  | "kotlin"
  | "kql"
  | "kt"
  | "kts"
  | "kusto"
  | "latex"
  | "lean"
  | "lean4"
  | "less"
  | "liquid"
  | "lisp"
  | "lit"
  | "llvm"
  | "log"
  | "logo"
  | "lua"
  | "luau"
  | "make"
  | "makefile"
  | "markdown"
  | "marko"
  | "matlab"
  | "md"
  | "mdc"
  | "mdx"
  | "mediawiki"
  | "mermaid"
  | "mips"
  | "mipsasm"
  | "mjs"
  | "mmd"
  | "mojo"
  | "move"
  | "mts"
  | "nar"
  | "narrat"
  | "nextflow"
  | "nf"
  | "nginx"
  | "nim"
  | "nix"
  | "nu"
  | "nushell"
  | "objc"
  | "objective-c"
  | "objective-cpp"
  | "ocaml"
  | "pascal"
  | "perl"
  | "perl6"
  | "php"
  | "pkl"
  | "plsql"
  | "po"
  | "polar"
  | "postcss"
  | "pot"
  | "potx"
  | "powerquery"
  | "powershell"
  | "prisma"
  | "prolog"
  | "properties"
  | "proto"
  | "protobuf"
  | "ps"
  | "ps1"
  | "pug"
  | "puppet"
  | "purescript"
  | "py"
  | "python"
  | "ql"
  | "qml"
  | "qmldir"
  | "qss"
  | "r"
  | "racket"
  | "raku"
  | "razor"
  | "rb"
  | "reg"
  | "regex"
  | "regexp"
  | "rel"
  | "riscv"
  | "rosmsg"
  | "rs"
  | "rst"
  | "ruby"
  | "rust"
  | "sas"
  | "sass"
  | "scala"
  | "scheme"
  | "scss"
  | "sdbl"
  | "sh"
  | "shader"
  | "shaderlab"
  | "shell"
  | "shellscript"
  | "shellsession"
  | "smalltalk"
  | "solidity"
  | "soy"
  | "sparql"
  | "spl"
  | "splunk"
  | "sql"
  | "ssh-config"
  | "stata"
  | "styl"
  | "stylus"
  | "svelte"
  | "swift"
  | "system-verilog"
  | "systemd"
  | "talon"
  | "talonscript"
  | "tasl"
  | "tcl"
  | "templ"
  | "terraform"
  | "tex"
  | "tf"
  | "tfvars"
  | "toml"
  | "ts"
  | "ts-tags"
  | "tsp"
  | "tsv"
  | "tsx"
  | "turtle"
  | "twig"
  | "typ"
  | "typescript"
  | "typespec"
  | "typst"
  | "v"
  | "vala"
  | "vb"
  | "verilog"
  | "vhdl"
  | "vim"
  | "viml"
  | "vimscript"
  | "vue"
  | "vue-html"
  | "vue-vine"
  | "vy"
  | "vyper"
  | "wasm"
  | "wenyan"
  | "wgsl"
  | "wiki"
  | "wikitext"
  | "wit"
  | "wl"
  | "wolfram"
  | "xml"
  | "xsl"
  | "yaml"
  | "yml"
  | "zenscript"
  | "zig"
  | "zsh"
  | "文言";
