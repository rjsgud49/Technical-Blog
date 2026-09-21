import Link from "next/link";
import { DEFAULT_FIELD, fieldPath } from "@/lib/field-path";

interface TermLinkProps {
  slug: string;
  children: React.ReactNode;
  className?: string;
}

/** 핵심 용어 → 단어사전 본문 앵커 */
export function TermLink({ slug, children, className }: TermLinkProps) {
  return (
    <Link
      href={`${fieldPath(DEFAULT_FIELD, "/glossary")}?section=${encodeURIComponent(slug)}`}
      className={
        className ??
        "font-medium text-primary-600 underline decoration-primary-200 underline-offset-2 transition-colors duration-150 hover:text-primary-700 hover:decoration-primary-400"
      }
    >
      {children}
    </Link>
  );
}
