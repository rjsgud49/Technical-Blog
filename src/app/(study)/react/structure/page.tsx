import type { Metadata } from "next";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "React 구조",
};

export default function StructurePage() {
  return <ManagedCategoryView slug="structure" fieldSlug={DEFAULT_FIELD} />;
}
