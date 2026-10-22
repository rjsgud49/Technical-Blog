import type { Lesson } from "@/types/lesson";
import { historyLesson } from "./history";
import { structureLesson } from "./structure";
import { useStateLesson } from "./hooks/use-state";
import { useEffectLesson } from "./hooks/use-effect";
import { useRefLesson } from "./hooks/use-ref";
import { useMemoLesson } from "./hooks/use-memo";
import { useContextLesson } from "./hooks/use-context";
import { useReducerLesson } from "./hooks/use-reducer";
import { customHooksLesson } from "./hooks/custom-hooks";
import { useTransitionLesson } from "./hooks/use-transition";
import { useIdLesson } from "./hooks/use-id";
import { useSyncExternalStoreLesson } from "./hooks/use-sync-external-store";
import { compoundLesson } from "./patterns/compound";
import { renderPropsLesson } from "./patterns/render-props";
import { hocLesson } from "./patterns/hoc";
import { controlledLesson } from "./patterns/controlled";
import { colocationLesson } from "./patterns/colocation";
import { containerLesson } from "./patterns/container";
import { errorBoundaryLesson } from "./patterns/error-boundary";
import { compositionLesson } from "./patterns/composition";

export const lessons: Lesson[] = [
  historyLesson,
  structureLesson,
  useStateLesson,
  useEffectLesson,
  useRefLesson,
  useMemoLesson,
  useContextLesson,
  useReducerLesson,
  customHooksLesson,
  useTransitionLesson,
  useIdLesson,
  useSyncExternalStoreLesson,
  compoundLesson,
  renderPropsLesson,
  hocLesson,
  controlledLesson,
  colocationLesson,
  containerLesson,
  errorBoundaryLesson,
  compositionLesson,
];

export function getLessonById(id: string): Lesson | null {
  return lessons.find((lesson) => lesson.id === id) ?? null;
}

export function getLessonBySlug(slug: string): Lesson | null {
  return lessons.find((lesson) => lesson.slug === slug) ?? null;
}

export function listLessonsByCategory(
  category: Lesson["category"],
): Lesson[] {
  return lessons.filter((lesson) => lesson.category === category);
}
