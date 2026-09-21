"use client";

import { useSyncExternalStore } from "react";
import type { StudyService } from "@/data/services";
import {
  getStudyServicesServerSnapshot,
  getStudyServicesSnapshot,
  subscribeStudyServices,
} from "@/lib/admin/services-store";

export function useStudyServices(): StudyService[] {
  return useSyncExternalStore(
    subscribeStudyServices,
    getStudyServicesSnapshot,
    getStudyServicesServerSnapshot,
  );
}
