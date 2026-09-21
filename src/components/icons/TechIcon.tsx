import {
  getTechStackItem,
  resolveTechIconUrl,
  type TechStackItem,
} from "@/data/tech-stack";

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

export type TechIconSize = keyof typeof sizeMap | number;

interface TechIconProps {
  /** tech-stack.ts 카탈로그 id (예: "react", "typescript") */
  id: string;
  size?: TechIconSize;
  className?: string;
  /** true면 이름 텍스트도 옆에 표시 */
  withLabel?: boolean;
  title?: string;
}

function resolveSize(size: TechIconSize): number {
  return typeof size === "number" ? size : sizeMap[size];
}

/**
 * 기술 스택 아이콘.
 * @example
 * <TechIcon id="react" />
 * <TechIcon id="typescript" size="lg" withLabel />
 */
export function TechIcon({
  id,
  size = "md",
  className = "",
  withLabel = false,
  title,
}: TechIconProps) {
  const item = getTechStackItem(id);

  if (!item) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[TechIcon] unknown id: "${id}"`);
    }
    return (
      <span
        className={`inline-flex items-center justify-center rounded bg-neutral-100 text-[10px] text-neutral-400 ${className}`}
        style={{ width: resolveSize(size), height: resolveSize(size) }}
        title={title ?? id}
        aria-label={id}
      >
        ?
      </span>
    );
  }

  const px = resolveSize(size);
  const src = resolveTechIconUrl(item);

  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- CDN SVG, next/image 불필요
    <img
      src={src}
      alt=""
      width={px}
      height={px}
      className="block object-contain"
      loading="lazy"
      decoding="async"
    />
  );

  if (!withLabel) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        style={{ width: px, height: px }}
        title={title ?? item.name}
        aria-label={item.name}
      >
        {image}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      title={title ?? item.name}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center"
        style={{ width: px, height: px }}
      >
        {image}
      </span>
      <span className="whitespace-nowrap text-sm font-medium text-neutral-800">
        {item.name}
      </span>
    </span>
  );
}

interface TechIconFromItemProps {
  item: TechStackItem;
  size?: TechIconSize;
  className?: string;
}

/** 카탈로그 객체를 직접 넘길 때 */
export function TechIconFromItem({
  item,
  size = "md",
  className = "",
}: TechIconFromItemProps) {
  return <TechIcon id={item.id} size={size} className={className} />;
}
