import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export type CalloutVariant = "info" | "tip" | "warn";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (variant?: CalloutVariant) => ReturnType;
      toggleCallout: (variant?: CalloutVariant) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

const LABELS: Record<CalloutVariant, string> = {
  info: "참고",
  tip: "팁",
  warn: "주의",
};

function findAncestor(
  doc: ProseMirrorNode,
  pos: number,
  typeName: string,
): { pos: number; node: ProseMirrorNode } | null {
  const $pos = doc.resolve(pos);
  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (node.type.name === typeName) {
      return { pos: $pos.before(depth), node };
    }
  }
  return null;
}

/** 부모 노드를 내용만 남기고 제거 */
function unwrapNode(
  tr: CommandProps["tr"],
  pos: number,
  node: ProseMirrorNode,
) {
  tr.replaceWith(pos, pos + node.nodeSize, node.content);
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "paragraph+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "info" satisfies CalloutVariant,
        parseHTML: (element) =>
          (element.getAttribute("data-variant") as CalloutVariant) || "info",
        renderHTML: (attributes) => ({
          "data-variant": attributes.variant as CalloutVariant,
        }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: "aside[data-callout]" },
      { tag: "div[data-callout]" },
      {
        tag: "aside.callout",
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const variant =
            (el.getAttribute("data-variant") as CalloutVariant) ||
            (el.classList.contains("callout-tip")
              ? "tip"
              : el.classList.contains("callout-warn")
                ? "warn"
                : "info");
          return { variant };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const variant = (node.attrs.variant as CalloutVariant) || "info";
    return [
      "aside",
      mergeAttributes(HTMLAttributes, {
        "data-callout": "",
        "data-variant": variant,
        class: `callout callout-${variant}`,
        "data-label": LABELS[variant],
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant: CalloutVariant = "info") =>
        ({ editor, chain }: CommandProps) => {
          const c = chain().focus();
          if (editor.isActive("blockquote")) {
            c.toggleBlockquote();
          }
          if (editor.isActive(this.name)) {
            return c.updateAttributes(this.name, { variant }).run();
          }
          return c.wrapIn(this.name, { variant }).run();
        },

      unsetCallout:
        () =>
        ({ state, dispatch, tr }: CommandProps) => {
          const from =
            state.selection instanceof NodeSelection
              ? state.selection.from
              : state.selection.$from.pos;
          const found = findAncestor(state.doc, from, "callout");
          if (!found) return false;
          if (dispatch) {
            unwrapNode(tr, found.pos, found.node);
            dispatch(tr.scrollIntoView());
          }
          return true;
        },

      toggleCallout:
        (variant: CalloutVariant = "info") =>
        ({ editor, commands }: CommandProps) => {
          if (!editor.isActive(this.name)) {
            return commands.setCallout(variant);
          }
          const current = editor.getAttributes(this.name).variant as
            | CalloutVariant
            | undefined;
          if (current === variant) {
            return commands.unsetCallout();
          }
          return commands.updateAttributes(this.name, { variant });
        },
    };
  },
});
