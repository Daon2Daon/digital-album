# 데이터베이스 설정 가이드

## 빠른 시작

### 1. .env.local 파일 생성

```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local
```

### 2. 데이터베이스 시작 및 설정

```bash
# 한 번에 실행 (권장)
npm run dev:setup

# 또는 단계별로
npm run db:up          # 데이터베이스 시작
npm run db:generate    # Prisma Client 생성
npm run db:migrate     # 마이그레이션 실행
npm run db:seed        # 초기 데이터 생성
npm run dev            # 개발 서버 실행
```

## DATABASE_URL 설정

### 로컬 개발 환경 (Docker Compose)

`.env.local` 파일에 다음을 설정:

```env
DATABASE_URL="postgresql://mook:dalbum%4010061912@localhost:4578/DAlbumDB?schema=public"
```

**설명:**
- 사용자명: `mook` (docker-compose.yml에서 설정)
- 비밀번호: `dalbum@10061912` (URL 인코딩: `@` → `%40`)
- 호스트: `localhost`
- 포트: `5432`
- 데이터베이스명: `DAlbumDB`

## 유용한 명령어

```bash
# 데이터베이스 관리
npm run db:up          # 데이터베이스 시작
npm run db:down        # 데이터베이스 중지
npm run db:logs        # 데이터베이스 로그 확인
npm run db:studio      # Prisma Studio 실행 (GUI)

# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
npm run db:reset
```

## 문제 해결

### 연결 오류

```bash
# 데이터베이스 컨테이너 상태 확인
docker ps | grep postgres

# 데이터베이스 로그 확인
npm run db:logs

# 연결 테스트
npm run db:studio
```

### 포트 충돌

로컬 PostgreSQL이 이미 실행 중인 경우:

1. 기존 PostgreSQL 중지
2. 또는 docker-compose.yml에서 포트 변경 (예: `5433:4578`)

### 데이터베이스 초기화

모든 데이터를 삭제하고 처음부터 시작:

```bash
npm run db:reset
```

## Prisma Studio

데이터베이스를 시각적으로 확인하고 편집:

```bash
npm run db:studio
```

브라우저에서 `http://localhost:5555`로 접속합니다.
