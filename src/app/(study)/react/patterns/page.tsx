import type { Metadata } from "next";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "패턴",
};

export default function PatternsPage() {
  return <ManagedCategoryView slug="patterns" fieldSlug={DEFAULT_FIELD} />;
}
