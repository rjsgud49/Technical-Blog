import { redirect } from "next/navigation";
import { fieldHome, DEFAULT_FIELD } from "@/lib/field-path";

/** 루트 → /react */
export default function StudyRootPage() {
  redirect(fieldHome(DEFAULT_FIELD));
}
