import { redirect } from "next/navigation";
import { DEFAULT_FIELD, fieldHome } from "@/lib/field-path";

/** 레거시 URL → 홈 (카테고리에서 작성) */
export default function LegacyNewPostPage() {
  redirect(fieldHome(DEFAULT_FIELD));
}
