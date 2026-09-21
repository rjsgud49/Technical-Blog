"use client";

import {
  NodeViewContent,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { useCallback, useState } from "react";
import { CODE_LANGUAGES, codeLanguageLabel } from "@/lib/admin/code-languages";

/** 에디터 코드박스: 제목 헤더 · 언어 선택 · 복사 + lowlight 구문 강조 */
export function CodeBlockView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const language = (node.attrs.language as string | null) || "";
  const title = (node.attrs.title as string | null) || "";
  const [copied, setCopied] = useState(false);

  const onLanguageChange = useCallback(
    (value: string) => {
      updateAttributes({ language: value || null });
    },
    [updateAttributes],
  );

  const onTitleChange = useCallback(
    (value: string) => {
      updateAttributes({ title: value });
    },
    [updateAttributes],
  );

  const onTitleBlur = useCallback(
    (value: string) => {
      updateAttributes({ title: value.trim() ? value.trim() : null });
    },
    [updateAttributes],
  );

  const onCopy = useCallback(async () => {
    const text = node.textContent;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [node.textContent]);

  return (
    <NodeViewWrapper
      className={`code-block-node my-3 overflow-hidden rounded-lg border border-neutral-200 ${
        selected ? "ring-2 ring-primary-400/60" : ""
      }`}
      data-language={language || undefined}
      data-lang-label={language ? codeLanguageLabel(language) : undefined}
      data-title={title || undefined}
    >
      <div
        contentEditable={false}
        className="border-b border-neutral-200 bg-neutral-100 px-3 py-2"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={(e) => onTitleBlur(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="코드 제목 (예: 문서 제목 동기화)"
          className="w-full bg-transparent text-sm font-medium text-neutral-700 outline-none placeholder:font-normal placeholder:text-neutral-400"
        />
      </div>

      <div className="relative bg-neutral-900">
        <div
          contentEditable={false}
          className="absolute top-2 right-2 z-10 flex items-center gap-1"
        >
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            title="언어 / 기술스택"
            className="max-w-[8.5rem] cursor-pointer appearance-none rounded-md border border-neutral-600 bg-neutral-800/95 py-1 pr-6 pl-2 text-[11px] font-medium text-neutral-200 shadow-sm outline-none hover:border-neutral-500 focus:border-primary-400"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%9ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.35rem center",
            }}
          >
            {CODE_LANGUAGES.map((lang) => (
              <option key={lang.id || "none"} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onCopy}
            onMouseDown={(e) => e.preventDefault()}
            title={copied ? "복사됨" : "코드 복사"}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-600 bg-neutral-800/95 text-neutral-300 hover:border-neutral-500 hover:text-white"
            aria-label="코드 복사"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>

        <pre className="code-block-pre !m-0 !border-0 !bg-transparent !p-0">
          <NodeViewContent
            as={"code" as "div"}
            className={`hljs block whitespace-pre px-4 pt-10 pb-4 text-[0.8125rem] leading-relaxed text-neutral-100 ${
              language ? `language-${language}` : ""
            }`}
          />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="9"
        y="9"
        width="13"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
