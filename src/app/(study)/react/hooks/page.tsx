import type { Metadata } from "next";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "Hooks",
};

export default function HooksPage() {
  return <ManagedCategoryView slug="hooks" fieldSlug={DEFAULT_FIELD} />;
}
