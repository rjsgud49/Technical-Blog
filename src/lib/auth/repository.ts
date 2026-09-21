/**
 * 인증 repository — Nest API 서버 검증만 사용.
 * 클라이언트에 계정/비밀번호를 두지 않음.
 */
import type { AuthRepository } from "@/types/auth";
import { apiAuthRepository } from "@/lib/auth/api-auth";

export function getAuthRepository(): AuthRepository {
  return apiAuthRepository;
}
