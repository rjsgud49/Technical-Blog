# React Structure API

NestJS + TypeORM + MySQL. 프론트(`NEXT_PUBLIC_DATA_SOURCE=api`)와 같은 스키마로 맞춥니다.

## 빠른 시작

```bash
# 루트에서 MySQL
npm run db:up

# API
cd backend
cp .env.example .env   # 필요 시 비밀번호 수정
npm install
npm run start:dev
```

Health: `GET http://localhost:4000/api/health`

## 주요 API

| 영역 | 경로 |
|------|------|
| Auth | `POST /api/auth/login`, `GET /api/auth/me` |
| Categories | `GET/POST /api/categories`, `?field=`, `navLabel`/`fieldSlug` 지원 |
| Posts | `GET/POST /api/posts`, `?field=&category=` |
| Services | `GET/POST /api/services`, `DELETE /api/services/:id` |
| Field homes | `GET/PUT /api/field-homes/:fieldSlug` |

관리자 계정은 `backend/.env`의 `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`로만 시드됩니다. 소스에 비밀번호를 두지 마세요.

## 스키마 메모

- Category / Post: `(field_slug, slug)` unique, `fieldSlug` 기본 `react`
- Category: optional `navLabel`
- `DB_SYNC=true`면 TypeORM이 테이블을 자동 생성/갱신합니다 (로컬 전용)
