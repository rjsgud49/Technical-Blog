"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * ?section=slug 또는 #slug 로 들어온 경우 해당 섹션으로 스크롤하고
 * URL을 path#slug 형태로 정리합니다. (redirect는 해시를 못 넣어서 쿼리로 우회)
 */
export function ScrollToSection({ ready = true }: { ready?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    const fromQuery = searchParams.get("section");
    const fromHash =
      typeof window !== "undefined"
        ? window.location.hash.replace(/^#/, "")
        : "";
    const id = fromQuery || fromHash;
    if (!id) return;

    const run = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (fromQuery) {
        router.replace(`${pathname}#${id}`, { scroll: false });
      }
      return true;
    };

    if (run()) return;
    const t = window.setTimeout(run, 80);
    return () => window.clearTimeout(t);
  }, [ready, searchParams, pathname, router]);

  return null;
}
