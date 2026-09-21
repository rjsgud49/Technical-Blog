import { notFound } from "next/navigation";
import { FieldHomeView } from "@/components/content/FieldHomeView";
import {
  DEFAULT_FIELD,
  isReservedFieldSlug,
  normalizeFieldSlug,
} from "@/lib/field-path";

interface PageProps {
  params: Promise<{ field: string }>;
}

/** 커스텀 학습 분야 홈 — /vue, /typescript 등 (react는 정적 라우트) */
export default async function FieldHomePage({ params }: PageProps) {
  const { field: raw } = await params;
  const field = normalizeFieldSlug(raw);
  if (!field || field === DEFAULT_FIELD || isReservedFieldSlug(field)) {
    notFound();
  }
  return <FieldHomeView fieldSlug={field} />;
}
