import type { Difficulty } from "@/types/content";

const styles: Record<Difficulty, string> = {
  basic: "bg-success-50 text-success-700",
  intermediate: "bg-warning-50 text-warning-700",
  advanced: "bg-error-50 text-error-700",
};

const labels: Record<Difficulty, string> = {
  basic: "하",
  intermediate: "중",
  advanced: "상",
};

interface DifficultyBadgeProps {
  level: Difficulty;
  size?: "sm" | "md";
}

export function DifficultyBadge({ level, size = "sm" }: DifficultyBadgeProps) {
  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-medium ${styles[level]} ${sizeClass}`}
    >
      {labels[level]}
    </span>
  );
}
