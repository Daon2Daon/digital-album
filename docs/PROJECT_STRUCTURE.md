# 📂 프로젝트 구조

## 개요

이 문서는 디지털 액자 프로젝트의 전체 파일 구조와 각 파일의 역할을 설명합니다.

---

## 🏗️ 전체 구조

```
digital-album/
├── 📄 server.js                      # Express.js 메인 서버
├── 📦 package.json                   # 프로젝트 의존성 및 스크립트
├── 🐳 docker-compose.yml             # Docker Compose 설정
├── 🔒 .env.local                     # 환경 변수 (비공개)
├── 🔒 .env.local.example             # 환경 변수 템플릿
├── 📝 .gitignore                     # Git 무시 파일 목록
│
├── 📚 문서/
│   ├── README.md                     # 프로젝트 개요 및 시작 가이드
│   ├── QUICK_START.md                # 빠른 시작 가이드
│   ├── HIDE_ADDRESS_BAR.md           # 전체 화면 설정 (3단계)
│   ├── FULLSCREEN_GUIDE.md           # 표시 모드 가이드
│   ├── FULLSCREEN_SETUP.md           # 상세 전체 화면 가이드
│   ├── VANILLA_SETUP_GUIDE.md        # 전체 설치 가이드
│   └── PROJECT_STRUCTURE.md          # 이 파일
│
├── 🗄️ prisma/
│   ├── schema.prisma                 # Prisma 스키마 (DB 모델)
│   ├── seed.ts                       # 데이터베이스 시드
│   ├── prisma.config.ts              # Prisma 설정
│   └── migrations/                   # 데이터베이스 마이그레이션
│       ├── 20251117054853_npm_run_db_seed/
│       └── 20251208062408_add_display_mode/
│
├── 🌐 public/
│   ├── viewer.html                   # 뷰어 페이지 (iPad용)
│   ├── admin.html                    # 관리자 페이지 (PC용)
│   ├── icon-generator.html           # 아이콘 생성기
│   ├── manifest.json                 # 웹앱 매니페스트
│   └── uploads/                      # 업로드된 이미지
│       ├── .gitkeep
│       └── *.jpg
│
└── 📖 docs/
    ├── README.md                     # 문서 인덱스
    ├── database-setup.md             # DB 설정 가이드
    └── fullscreen-mode-guide.md      # 기술 문서
```

---

## 📄 핵심 파일 설명

### server.js
**역할**: Express.js 메인 서버 파일

**주요 기능**:
- 정적 파일 서빙 (`public/`)
- API 엔드포인트:
  - `/api/viewer/images` - 뷰어용 이미지 목록
  - `/api/admin/images` - 관리자용 이미지 목록
  - `/api/admin/upload` - 이미지 업로드
  - `/api/admin/settings` - 설정 관리
- Prisma를 통한 데이터베이스 연동
- Sharp를 통한 이미지 리사이징
- Formidable을 통한 파일 업로드

**실행**: `node server.js` 또는 `npm start`

---

### package.json
**역할**: 프로젝트 의존성 및 스크립트 정의

**주요 의존성**:
- `express` - 웹 서버
- `@prisma/client` - ORM
- `sharp` - 이미지 처리
- `formidable` - 파일 업로드
- `dotenv` - 환경 변수
- `bcryptjs` - 비밀번호 해싱

**주요 스크립트**:
- `npm start` - 서버 시작
- `npm run dev` - 개발 모드 (nodemon)
- `npm run db:setup` - DB 초기 설정
- `npm run db:studio` - Prisma Studio
- `npm run db:migrate` - 마이그레이션

---

### docker-compose.yml
**역할**: PostgreSQL 데이터베이스 컨테이너 설정

**설정**:
- PostgreSQL 15 Alpine
- 포트: 5433 (호스트) → 5432 (컨테이너)
- 볼륨: `./local-db-data`
- Health check 포함

**실행**:
- `docker-compose up -d` - 시작
- `docker-compose down` - 중지

---

### .env.local
**역할**: 환경 변수 (비공개, Git 제외)

**주요 변수**:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5433/DAlbumDB?schema=public"
PORT=3000
```

**생성**: `.env.local.example` 복사 후 수정

---

## 🌐 Public 폴더

### viewer.html
**역할**: iPad mini 1세대용 뷰어 페이지

**기술**:
- Vanilla JavaScript (ES5 완전 호환)
- XMLHttpRequest (iOS 9.3.6 지원)
- CSS `background-size` (전체 화면)
- Web App Manifest 연동

**특징**:
- 주소창 숨김 가능 (홈 화면 추가 시)
- 자동 슬라이드쇼
- Fade 전환 효과
- 표시 모드 (cover/contain)
- 자동 갱신 (10분)
- 에러 복구

**접속**: `http://[IP]:3000/`

---

### admin.html
**역할**: PC/최신 기기용 관리자 페이지

**기술**:
- 모던 JavaScript (ES6+)
- Fetch API
- FormData (파일 업로드)

**기능**:
- 이미지 업로드 (드래그 앤 드롭)
- 이미지 삭제
- 설정 관리:
  - 슬라이드 시간
  - 전환 효과
  - 전환 속도
  - 표시 모드
- 실시간 미리보기

**접속**: `http://localhost:3000/admin`

---

### icon-generator.html
**역할**: 홈 화면 아이콘 생성 도구

**기능**:
- 텍스트 기반 아이콘 생성
- 3가지 스타일 (텍스트/액자/사진)
- 실시간 미리보기
- 152×152, 192×192 다운로드

**접속**: `http://localhost:3000/icon-generator.html`

---

### manifest.json
**역할**: PWA 웹앱 매니페스트

**설정**:
- 풀스크린 모드
- 검은색 테마
- 아이콘 경로
- 시작 URL

**적용**: `viewer.html`에서 자동 로드

---

### uploads/
**역할**: 업로드된 이미지 저장 폴더

**구조**:
- UUID 기반 파일명 (예: `c1a9d1c1-d3c1-47d1-b79d-7ca8cc8b5632.jpg`)
- Sharp로 1920px 리사이징
- `.gitkeep`으로 폴더 유지

**권한**: 읽기/쓰기 필요

---

## 🗄️ Prisma 폴더

### schema.prisma
**역할**: 데이터베이스 스키마 정의

**모델**:
1. **User** (사용자)
   - id, username, password, createdAt, updatedAt

2. **Image** (이미지)
   - id, originalName, filename, url
   - displayOrder, size, width, height
   - createdAt

3. **Settings** (설정)
   - id, slideDuration, transitionEffect
   - transitionSpeed, displayMode
   - updatedAt

**수정 후**: `npx prisma migrate dev`

---

### migrations/
**역할**: 데이터베이스 마이그레이션 이력

**구조**:
```
migrations/
├── 20251117054853_npm_run_db_seed/
│   └── migration.sql
├── 20251208062408_add_display_mode/
│   └── migration.sql
└── migration_lock.toml
```

**적용**: `npx prisma migrate deploy`

---

### seed.ts
**역할**: 초기 데이터 생성

**내용**:
- 기본 설정 (slideDuration: 10000, etc.)
- 샘플 이미지 (선택)

**실행**: `npx prisma db seed`

---

## 📚 문서 폴더

### 사용자 문서 (루트)

| 문서 | 대상 | 내용 |
|------|------|------|
| `README.md` | 모든 사용자 | 프로젝트 개요 및 시작 |
| `QUICK_START.md` | 신규 사용자 | 빠른 시작 가이드 |
| `HIDE_ADDRESS_BAR.md` | iPad 사용자 | 전체 화면 설정 (3단계) |
| `FULLSCREEN_GUIDE.md` | iPad 사용자 | 표시 모드 가이드 |
| `FULLSCREEN_SETUP.md` | iPad 사용자 | 상세 전체 화면 가이드 |
| `VANILLA_SETUP_GUIDE.md` | 개발자 | 전체 설치 가이드 |
| `PROJECT_STRUCTURE.md` | 개발자 | 이 문서 |

### 기술 문서 (docs/)

| 문서 | 대상 | 내용 |
|------|------|------|
| `database-setup.md` | 개발자 | DB 설정 및 관리 |
| `fullscreen-mode-guide.md` | 개발자 | 전체 화면 기술 문서 |

---

## 🔄 데이터 흐름

### 이미지 업로드
```
PC 브라우저 (admin.html)
    ↓ FormData
Express server.js (/api/admin/upload)
    ↓ Formidable 파싱
Sharp 리사이징 (1920px)
    ↓ 파일 저장
public/uploads/
    ↓ Prisma 저장
PostgreSQL (Image 테이블)
```

### 뷰어 표시
```
iPad Safari (viewer.html)
    ↓ XMLHttpRequest
Express server.js (/api/viewer/images)
    ↓ Prisma 조회
PostgreSQL (Image, Settings)
    ↓ JSON 응답
viewer.html (슬라이드쇼)
```

### 설정 변경
```
PC 브라우저 (admin.html)
    ↓ Fetch PUT
Express server.js (/api/admin/settings)
    ↓ Prisma 업데이트
PostgreSQL (Settings 테이블)
    ↓ 자동 갱신
viewer.html (10분 또는 수동)
```

---

## 🔐 보안

### 비공개 파일
- `.env.local` - 환경 변수
- `local-db-data/` - PostgreSQL 데이터
- `public/uploads/*` - 업로드된 이미지

### Git 제외 (.gitignore)
- `node_modules/`
- `.env.local`
- `local-db-data/`
- `public/uploads/*` (`.gitkeep` 제외)

---

## 🚀 배포

### 로컬 개발
```bash
npm install
docker-compose up -d
npx prisma migrate deploy
npm run dev
```

### 프로덕션
```bash
npm install --production
docker-compose up -d
npx prisma migrate deploy
npx prisma generate
NODE_ENV=production node server.js
```

### Docker (서버도)
```dockerfile
# Dockerfile 예시
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 📊 파일 크기 최적화

### 현재 크기
- `server.js`: ~10KB
- `viewer.html`: ~15KB
- `admin.html`: ~20KB
- `package.json`: ~1KB

### 최적화 팁
- 이미지: 1920px 이하, 500KB 이하
- 총 이미지 수: 20개 이하 (512MB RAM)
- 압축: gzip 사용 권장

---

## 🔧 유지보수

### 정기 작업
- [ ] 데이터베이스 백업 (매주)
- [ ] 이미지 폴더 정리 (매월)
- [ ] 의존성 업데이트 (분기별)
- [ ] 로그 정리 (필요 시)

### 업데이트
```bash
# 의존성 업데이트
npm update

# Prisma 업데이트
npm update @prisma/client prisma
npx prisma generate
```

---

## 📖 추가 리소스

### 공식 문서
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Sharp](https://sharp.pixelplumbing.com/)

### 커뮤니티
- GitHub Issues
- 문서 기여

---

**프로젝트 구조에 대한 질문은 이슈로 남겨주세요!**

