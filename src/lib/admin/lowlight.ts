import { common, createLowlight } from "lowlight";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import hljs from "highlight.js/lib/core";

/** TipTap CodeBlockLowlight용 */
export const lowlight = createLowlight(common);

lowlight.register("tsx", typescript);
lowlight.register("jsx", javascript);
lowlight.register("vue", xml);
lowlight.register("dockerfile", dockerfile);
lowlight.registerAlias({
  javascript: ["js"],
  typescript: ["ts"],
});

/** 공개 본문 DOM 하이라이트용 (같은 문법 등록) */
let hljsReady = false;

function ensureHljs() {
  if (hljsReady) return;
  for (const [name, fn] of Object.entries(common)) {
    hljs.registerLanguage(name, fn);
  }
  hljs.registerLanguage("tsx", typescript);
  hljs.registerLanguage("jsx", javascript);
  hljs.registerLanguage("vue", xml);
  hljs.registerLanguage("dockerfile", dockerfile);
  hljsReady = true;
}

function resolveLang(raw: string | null | undefined): string | null {
  if (!raw || raw === "plaintext" || raw === "text") return null;
  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
  };
  return aliases[raw] ?? raw;
}

/** 단일 `<code>` 요소 구문 강조 */
export function highlightCodeElement(
  el: HTMLElement,
  language?: string | null,
) {
  ensureHljs();
  delete el.dataset.hljs;
  const pre = el.closest("pre");
  const fromData = language || pre?.getAttribute("data-language");
  const fromClass = [...el.classList]
    .find((c) => c.startsWith("language-"))
    ?.replace("language-", "");
  const lang = resolveLang(fromData || fromClass || null);
  const source = el.textContent ?? "";

  try {
    if (lang && hljs.getLanguage(lang)) {
      el.innerHTML = hljs.highlight(source, { language: lang }).value;
    } else {
      el.innerHTML = hljs.highlightAuto(source).value;
    }
    el.dataset.hljs = "1";
    el.classList.add("hljs");
  } catch {
    /* 하이라이트 실패 시 원문 유지 */
  }
}

/** `<pre><code>` 블록에 구문 강조 적용 */
export function highlightCodeBlocks(root: HTMLElement) {
  root.querySelectorAll("pre code").forEach((node) => {
    highlightCodeElement(node as HTMLElement);
  });
}
