import { ConfigService } from '@nestjs/config';

/** JWT_SECRET은 환경변수 필수 — 소스 기본값으로 로그인 서명하지 않음 */
export function requireJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET')?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be set in backend/.env (min 32 characters). Do not use source defaults.',
    );
  }
  const weak = [
    'dev-secret',
    'dev-change-me-react-structure',
    'secret',
    'changeme',
  ];
  if (weak.includes(secret)) {
    throw new Error(
      'JWT_SECRET is too weak. Set a long random value in backend/.env.',
    );
  }
  return secret;
}
