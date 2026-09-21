"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FieldHomeInfo } from "@/lib/admin/field-home-store";
import {
  getFieldHomeServerSnapshot,
  getFieldHomeSnapshot,
  subscribeFieldHome,
} from "@/lib/admin/field-home-store";

export function useFieldHome(fieldSlug: string): FieldHomeInfo {
  const subscribe = useCallback(
    (onChange: () => void) => subscribeFieldHome(onChange),
    [],
  );
  const getSnapshot = useCallback(
    () => getFieldHomeSnapshot(fieldSlug),
    [fieldSlug],
  );
  const getServerSnapshot = useCallback(
    () => getFieldHomeServerSnapshot(fieldSlug),
    [fieldSlug],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
