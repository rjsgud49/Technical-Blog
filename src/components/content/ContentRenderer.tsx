import type { ContentBlock, InlineNode } from "@/types/lesson";
import { TermLink } from "@/components/content/TermLink";
import { HighlightedCode } from "@/components/content/HighlightedCode";

function Inline({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case "text":
            return <span key={i}>{node.value}</span>;
          case "code":
            return (
              <code
                key={i}
                className="rounded-sm bg-neutral-100 px-1 py-0.5 font-mono text-[0.875em] text-neutral-700"
              >
                {node.value}
              </code>
            );
          case "term":
            return (
              <TermLink key={i} slug={node.slug}>
                {node.label ?? node.slug}
              </TermLink>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

const calloutStyles = {
  info: "border-primary-200 bg-primary-50 text-primary-800",
  tip: "border-success-500/20 bg-success-50 text-success-700",
  warn: "border-warning-500/20 bg-warning-50 text-warning-700",
} as const;

const calloutLabel = {
  info: "참고",
  tip: "팁",
  warn: "주의",
} as const;

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="max-w-prose space-y-5">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const Tag = block.level === 2 ? "h2" : "h3";
            return (
              <Tag
                key={index}
                id={block.id}
                className={
                  block.level === 2
                    ? "scroll-mt-24 pt-4 text-2xl font-bold tracking-tight text-neutral-900"
                    : "scroll-mt-24 pt-2 text-lg font-semibold text-neutral-800"
                }
              >
                {block.text}
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p
                key={index}
                className="text-base leading-relaxed text-neutral-700"
              >
                <Inline nodes={block.children} />
              </p>
            );
          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={index}
                className={`space-y-2 pl-5 text-base leading-relaxed text-neutral-700 ${
                  block.ordered ? "list-decimal" : "list-disc"
                }`}
              >
                {block.items.map((item, i) => (
                  <li key={i}>
                    <Inline nodes={item} />
                  </li>
                ))}
              </ListTag>
            );
          }
          case "code":
            return (
              <HighlightedCode
                key={index}
                code={block.code}
                language={block.language}
                title={block.title}
              />
            );
          case "callout":
            return (
              <aside
                key={index}
                className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${calloutStyles[block.variant]}`}
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80">
                  {block.title ?? calloutLabel[block.variant]}
                </p>
                <p>
                  <Inline nodes={block.children} />
                </p>
              </aside>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
