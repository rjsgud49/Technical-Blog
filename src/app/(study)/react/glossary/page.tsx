import type { Metadata } from "next";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "단어사전",
};

export default function GlossaryPage() {
  return <ManagedCategoryView slug="glossary" fieldSlug={DEFAULT_FIELD} />;
}
