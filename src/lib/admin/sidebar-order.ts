const STORAGE_KEY = "rs.sidebar.order.v1";

type SidebarOrderMap = Record<string, string[]>;

function readMap(): SidebarOrderMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SidebarOrderMap;
  } catch {
    return {};
  }
}

function writeMap(map: SidebarOrderMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("rs-sidebar-order-changed"));
}

/** 저장된 키 순서로 items를 정렬. 새 항목은 뒤에 붙음 */
export function applySidebarOrder<T extends { key: string }>(
  sectionId: string,
  items: T[],
): T[] {
  const saved = readMap()[sectionId];
  if (!saved?.length) return items;
  const byKey = new Map(items.map((item) => [item.key, item]));
  const ordered: T[] = [];
  for (const key of saved) {
    const hit = byKey.get(key);
    if (hit) {
      ordered.push(hit);
      byKey.delete(key);
    }
  }
  for (const rest of byKey.values()) ordered.push(rest);
  return ordered;
}

export function setSidebarOrder(sectionId: string, keys: string[]) {
  const map = readMap();
  map[sectionId] = keys;
  writeMap(map);
}

export function getSidebarOrder(sectionId: string): string[] | null {
  return readMap()[sectionId] ?? null;
}
