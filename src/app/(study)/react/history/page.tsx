import type { Metadata } from "next";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "React 역사",
};

export default function HistoryPage() {
  return <ManagedCategoryView slug="history" fieldSlug={DEFAULT_FIELD} />;
}
