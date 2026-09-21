import type { ContentRepository } from "@/types/lesson";
import { localContentRepository } from "@/lib/content/local";

/**
 * 콘텐츠 소스 진입점.
 * 나중에 CONTENT_SOURCE=api | db 로 바꾸면 구현체만 교체하면 됩니다.
 */
export function getContentRepository(): ContentRepository {
  const source = process.env.CONTENT_SOURCE ?? "local";

  switch (source) {
    case "local":
    default:
      return localContentRepository;
  }
}
