"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useCallback, useRef } from "react";

const MIN_WIDTH = 80;

type Corner = "nw" | "ne" | "sw" | "se";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function ResizableImageView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const width = (node.attrs.width as number | null) || null;
  const alt = (node.attrs.alt as string | null) || "";
  const src = (node.attrs.src as string) || "";

  const onResizeStart = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>, corner: Corner) => {
      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const current =
        imgRef.current?.getBoundingClientRect().width || width || 320;
      const sign = corner === "se" || corner === "ne" ? 1 : -1;
      const parent = wrapRef.current?.closest(".ProseMirror");
      const max =
        parent instanceof HTMLElement
          ? Math.max(MIN_WIDTH, parent.clientWidth - 24)
          : 960;

      const onMove = (ev: PointerEvent) => {
        const next = Math.round(
          clamp(current + sign * (ev.clientX - startX), MIN_WIDTH, max),
        );
        updateAttributes({ width: next });
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [updateAttributes, width],
  );

  return (
    <NodeViewWrapper
      className="article-image-wrap"
      data-selected={selected ? "true" : undefined}
    >
      <div ref={wrapRef} className="article-image-box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="article-image"
          width={width ?? undefined}
          style={{
            width: width ? `${width}px` : undefined,
            height: "auto",
            maxWidth: "100%",
          }}
          draggable={false}
        />
        {selected && (
          <>
            {(["nw", "ne", "sw", "se"] as const).map((corner) => (
              <span
                key={corner}
                role="slider"
                aria-label="사진 크기 조절"
                aria-valuemin={MIN_WIDTH}
                aria-valuenow={width ?? undefined}
                tabIndex={0}
                className={`article-image-handle article-image-handle-${corner}`}
                onPointerDown={(e) => onResizeStart(e, corner)}
              />
            ))}
            <span className="article-image-size" aria-hidden>
              {width ? `${width}px` : "원본"}
            </span>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
