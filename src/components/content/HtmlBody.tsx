"use client";

import { useEffect, useRef } from "react";
import { isHtmlBody } from "@/lib/admin/html-body";
import { highlightCodeBlocks } from "@/lib/admin/lowlight";

/** 저장된 HTML 본문 렌더 (작성자 WYSIWYG 결과) + 코드 구문 강조 */
export function HtmlBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    highlightCodeBlocks(ref.current);
  }, [html]);

  if (!html?.trim()) {
    return (
      <p className="text-sm text-neutral-400">(본문이 비어 있습니다.)</p>
    );
  }

  if (!isHtmlBody(html)) {
    return (
      <div className="max-w-prose whitespace-pre-wrap text-base leading-relaxed text-neutral-700">
        {html}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="prose-content max-w-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
