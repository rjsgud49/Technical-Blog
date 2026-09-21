import { redirect } from "next/navigation";
import { DEFAULT_FIELD, fieldHome } from "@/lib/field-path";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** 레거시 수정 URL → 홈 (글 보기에서 ?edit=1 사용) */
export default async function LegacyEditPostPage({ params }: PageProps) {
  await params;
  redirect(fieldHome(DEFAULT_FIELD));
}
