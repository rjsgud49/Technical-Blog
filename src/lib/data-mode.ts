/** 프론트 데이터 소스: localStorage 또는 Nest API */
export function isApiMode() {
  return (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "local") === "api";
}
