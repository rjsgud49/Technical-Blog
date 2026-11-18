import type { ContentRepository } from "@/types/lesson";
import { localContentRepository } from "@/lib/content/local";

/** React 시드 강의(코드 내장) 저장소 */
export function getContentRepository(): ContentRepository {
  return localContentRepository;
}
