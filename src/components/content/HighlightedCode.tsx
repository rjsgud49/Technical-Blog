"use client";

import { useEffect, useRef } from "react";
import { highlightCodeElement } from "@/lib/admin/lowlight";
import { codeLanguageLabel } from "@/lib/admin/code-languages";

/** 시드/레슨 코드 블록 — 언어 라벨 + 구문 강조 */
export function HighlightedCode({
  code,
  language,
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // React가 텍스트로 채운 뒤 하이라이트
    ref.current.textContent = code;
    highlightCodeElement(ref.current, language);
  }, [code, language]);

  const label = language ? codeLanguageLabel(language) || language : "";

  return (
    <figure className="code-block-figure overflow-hidden rounded-lg border border-neutral-200">
      {title ? (
        <figcaption className="code-block-caption border-b border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700">
          {title}
        </figcaption>
      ) : null}
      <pre
        className="code-fence relative overflow-x-auto bg-neutral-900 p-4 text-sm leading-relaxed text-neutral-100"
        {...(language
          ? {
              "data-language": language,
              "data-lang-label": label,
            }
          : {})}
        {...(title ? { "data-title": title } : {})}
      >
        <code
          ref={ref}
          className={language ? `language-${language} font-mono` : "font-mono"}
        />
      </pre>
    </figure>
  );
}
