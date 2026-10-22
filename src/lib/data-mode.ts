/** 프론트 데이터 소스: localStorage 또는 Nest API */
export function dataSource(): "api" | "local" {
  const explicit = process.env.NEXT_PUBLIC_DATA_SOURCE;
  if (explicit === "api" || explicit === "local") return explicit;
  // next build 산출물은 서버 DB 분야 목록을 써야 함. Jenkins가 env를 빠뜨려도 분야 전환이 비지 않게.
  return process.env.NODE_ENV === "production" ? "api" : "local";
}

export function isApiMode() {
  return dataSource() === "api";
}
