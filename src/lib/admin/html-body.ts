export function isHtmlBody(body: string) {
  return /<\/?[a-z][\s\S]*>/i.test(body.trim());
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeBasicEntities(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** TipTap이 만든 실제 구조 HTML인지 (마크다운이 <p>에 갇힌 경우 제외) */
function isStructuredEditorHtml(html: string) {
  if (!isHtmlBody(html)) return false;
  // 이미 제목·코드·콜아웃 노드가 있으면 구조화됨
  if (/<(h[1-3]|pre|aside\s[^>]*data-callout|ul|ol)\b/i.test(html)) {
    // 하지만 본문에 ## / ``` / [tip] 원문이 남아 있으면 재변환
    const textOnly = html
      .replace(/<pre[\s\S]*?<\/pre>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "");
    if (/```|\[(?:info|tip|warn)\]|(?:^|>)\s*#{1,3}\s/m.test(textOnly)) {
      return false;
    }
    return true;
  }
  // <p>## 제목</p> 같은 마크다운-인-HTML
  if (/<(?:p|div)[^>]*>\s*#{1,3}\s/i.test(html)) return false;
  if (/<(?:p|div)[^>]*>\s*```/i.test(html)) return false;
  if (/<(?:p|div)[^>]*>\s*\[(?:info|tip|warn)\]/i.test(html)) return false;
  return isHtmlBody(html);
}

function htmlToPlainish(html: string) {
  return decodeBasicEntities(
    html
      .replace(/\r\n/g, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|div|h[1-6]|li|blockquote)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

const CALLOUT_LABEL: Record<"info" | "tip" | "warn", string> = {
  info: "참고",
  tip: "팁",
  warn: "주의",
};

function calloutHtml(variant: "info" | "tip" | "warn", inner: string) {
  const body = inner.trim()
    ? inner
        .split(/\n+/)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("")
    : "<p></p>";
  return `<aside data-callout data-variant="${variant}" class="callout callout-${variant}" data-label="${CALLOUT_LABEL[variant]}">${body}</aside>`;
}

/** 마크다운·숏코드 → TipTap/공개 화면용 HTML */
export function markdownToHtml(text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const parts: string[] = [];
  let para: string[] = [];
  let i = 0;

  const flushPara = () => {
    const t = para.join("\n").trim();
    if (t) parts.push(`<p>${escapeHtml(t).replace(/\n/g, "<br>")}</p>`);
    para = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    // 코드 펜스
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      flushPara();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      parts.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      i += 1;
      continue;
    }

    // [info] / [tip] / [warn] 콜아웃 (다음 빈 줄까지)
    const calloutStart = line.match(/^\[(info|tip|warn)\]\s*(.*)$/i);
    if (calloutStart) {
      flushPara();
      const variant = calloutStart[1].toLowerCase() as "info" | "tip" | "warn";
      const buf: string[] = [];
      if (calloutStart[2].trim()) buf.push(calloutStart[2].trim());
      i += 1;
      while (i < lines.length) {
        const next = lines[i];
        if (
          next.trim() === "" ||
          /^\[(info|tip|warn)\]/i.test(next) ||
          /^#{1,3}\s/.test(next) ||
          /^```/.test(next)
        ) {
          if (next.trim() === "") i += 1;
          break;
        }
        buf.push(next);
        i += 1;
      }
      parts.push(calloutHtml(variant, buf.join("\n")));
      continue;
    }

    if (line.startsWith("### ")) {
      flushPara();
      parts.push(`<h3>${escapeHtml(line.slice(4).trim())}</h3>`);
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      parts.push(`<h2>${escapeHtml(line.slice(3).trim())}</h2>`);
      i += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      flushPara();
      parts.push(`<h2>${escapeHtml(line.slice(2).trim())}</h2>`);
      i += 1;
      continue;
    }

    if (line.trim() === "") {
      flushPara();
      i += 1;
      continue;
    }

    para.push(line);
    i += 1;
  }
  flushPara();
  return parts.join("") || "<p></p>";
}

/**
 * 에디터·저장용 정규화.
 * 마크다운/`[tip]` 원문도 제목·코드박스·색상 박스로 바꿔 본문에서 바로 보이게 함.
 */
export function plainTextToHtml(text: string) {
  if (!text.trim()) return "";
  if (isStructuredEditorHtml(text)) return text;
  if (isHtmlBody(text)) return markdownToHtml(htmlToPlainish(text));
  return markdownToHtml(text);
}
