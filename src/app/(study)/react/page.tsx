import { FieldHomeView } from "@/components/content/FieldHomeView";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { DEFAULT_FIELD } from "@/lib/field-path";

/** 카테고리 카드는 DB(관리자 순서·이름)를 그대로 따른다 */
export default function HomePage() {
  return (
    <FieldHomeView fieldSlug={DEFAULT_FIELD}>
      <div className="mt-4 flex flex-wrap gap-2">
        <DifficultyBadge level="basic" size="md" />
        <DifficultyBadge level="intermediate" size="md" />
        <DifficultyBadge level="advanced" size="md" />
      </div>
    </FieldHomeView>
  );
}
