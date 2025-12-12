# 📂 프로젝트 구조 및 개요

## 프로젝트 소개

**Digital Album**은 iPad mini 1세대 (iOS 9.3.6)를 디지털 액자로 활용하기 위한 웹 애플리케이션입니다.

### 주요 특징
- ✅ **완전한 전체 화면 지원** - 주소창, 탭바, 툴바 완전 숨김
- ✅ **구형 기기 완벽 호환** - iOS 9.3.6 완벽 지원 (Vanilla JavaScript ES5)
- ✅ **자동 슬라이드쇼** - 설정 가능한 시간 간격으로 이미지 전환
- ✅ **관리자 페이지** - PC에서 이미지 업로드 및 설정 관리
- ✅ **Docker 배포** - Synology NAS에서 간편한 배포

---

## 기술 스택

### Backend
- **Node.js 18+** - JavaScript 런타임
- **Express.js** - 웹 서버 프레임워크
- **Prisma** - ORM (Object-Relational Mapping)
- **PostgreSQL 15** - 데이터베이스
- **Sharp** - 이미지 리사이징 라이브러리
- **Formidable** - 멀티파트 파일 업로드 처리

### Frontend
- **Vanilla JavaScript (ES5)** - iOS 9.3.6 완벽 호환
- **HTML5 & CSS3** - 최소 의존성의 순수 웹 기술
- **Web App Manifest** - PWA 기능으로 홈 화면 추가 지원

### DevOps
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 오케스트레이션
- **Synology NAS Container Manager** - 배포 플랫폼

---

## 프로젝트 구조

```
digital-album/
├── 📄 server.js                          # Express 서버 (메인 애플리케이션)
├── 📦 package.json                       # npm 의존성 및 스크립트 정의
├── 🐳 Dockerfile                         # Docker 이미지 빌드 설정
├── 🐳 docker-compose.yml                 # 프로덕션 배포 설정
├── 🐳 docker-compose.dev.yml             # 로컬 개발 환경 설정
├── 🔒 .env.example                       # 환경 변수 템플릿
├── 🔒 .env.local.example                 # 로컬 환경 변수 템플릿
│
├── 📂 prisma/                           # 데이터베이스 관련
│   ├── schema.prisma                    # DB 스키마 정의
│   ├── seed.ts                          # 초기 데이터 생성 스크립트
│   ├── fix-display-order.ts             # 표시 순서 수정 유틸리티
│   └── migrations/                      # DB 마이그레이션 히스토리
│
├── 📂 public/                           # 정적 파일
│   ├── viewer.html                      # 뷰어 페이지 (iPad용)
│   ├── admin.html                       # 관리자 페이지 (PC용)
│   ├── icon-generator.html              # 홈 화면 아이콘 생성 도구
│   ├── manifest.json                    # PWA 매니페스트
│   └── uploads/                         # 업로드된 이미지 저장소
│       └── .gitkeep
│
└── 📂 docs/                             # 프로젝트 문서
    ├── PROJECT_OVERVIEW.md              # 이 문서
    ├── LOCAL_DOCKER_GUIDE.md            # 로컬 Docker 테스트 가이드
    └── SYNOLOGY_DEPLOYMENT_GUIDE.md     # Synology NAS 배포 가이드
```

---

## 핵심 파일 설명

### server.js
Express.js 기반의 메인 서버 애플리케이션입니다.

**주요 기능:**
- 정적 파일 서빙 (`public/` 폴더)
- RESTful API 엔드포인트 제공
- Prisma를 통한 데이터베이스 연동
- 이미지 업로드 및 리사이징 처리
- CORS 설정

**API 엔드포인트:**
- `GET /api/viewer/images` - 뷰어용 이미지 목록 및 설정
- `GET /api/admin/images` - 관리자용 이미지 목록
- `POST /api/admin/upload` - 이미지 업로드
- `DELETE /api/admin/images/:id` - 이미지 삭제
- `GET /api/admin/settings` - 설정 조회
- `PUT /api/admin/settings` - 설정 업데이트

### package.json
프로젝트 의존성 및 npm 스크립트를 정의합니다.

**주요 스크립트:**
```bash
npm start              # 서버 시작
npm run dev            # 개발 모드 (nodemon)
npm run db:setup       # DB 초기 설정
npm run db:studio      # Prisma Studio (DB GUI)
npm run db:migrate     # 마이그레이션 실행
npm run db:reset       # DB 초기화
```

### Dockerfile
프로덕션 배포를 위한 Docker 이미지 빌드 설정입니다.

**특징:**
- Multi-stage build로 이미지 크기 최적화 (~150MB)
- Alpine Linux 기반 경량 이미지
- Non-root user로 보안 강화
- Health check 포함
- dumb-init으로 시그널 처리 개선

### docker-compose.yml
프로덕션 환경의 멀티 컨테이너 구성을 정의합니다.

**서비스:**
- `postgres` - PostgreSQL 15 데이터베이스
- `app` - Express 애플리케이션 서버

**특징:**
- Named volumes로 데이터 영속성 보장
- Health check로 자동 복구
- 자동 재시작 (`restart: unless-stopped`)
- 네트워크 격리

### docker-compose.dev.yml
로컬 개발 환경을 위한 간소화된 구성입니다.

**특징:**
- PostgreSQL만 컨테이너로 실행
- 애플리케이션은 로컬에서 직접 실행 (`node server.js`)
- 빠른 개발 사이클

---

## 데이터베이스 구조

### 스키마 (Prisma)

```prisma
// User - 사용자 정보 (미래 확장용)
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Image - 이미지 정보
model Image {
  id            Int      @id @default(autoincrement())
  originalName  String
  filename      String   @unique
  url           String
  displayOrder  Int      @default(0)
  size          Int
  width         Int?
  height        Int?
  createdAt     DateTime @default(now())
}

// Settings - 슬라이드쇼 설정
model Settings {
  id               Int      @id @default(autoincrement())
  slideDuration    Int      @default(10000)    // 밀리초
  transitionEffect String   @default("fade")
  transitionSpeed  Float    @default(1.0)      // 초
  displayMode      String   @default("cover")  // cover | contain
  updatedAt        DateTime @updatedAt
}
```

---

## 환경 변수

### .env (프로덕션)
```bash
# Database
DB_USER=mook
DB_PASSWORD=your_secure_password
DB_NAME=DAlbumDB
DB_PORT=4578

# Application
APP_PORT=8754
NODE_ENV=production

# Prisma
DATABASE_URL="postgresql://mook:your_secure_password@postgres:5432/DAlbumDB?schema=public"
```

### .env.local (로컬 개발)
```bash
# Application
PORT=8754

# Prisma (로컬 Docker)
DATABASE_URL="postgresql://mook:dalbum%4010061912@localhost:4578/DAlbumDB?schema=public"
```

---

## 포트 구성

| 서비스 | 포트 | 용도 | 노출 |
|--------|------|------|------|
| **웹 애플리케이션** | 8754 | HTTP 서버 | ✅ 외부 |
| **PostgreSQL (외부)** | 4578 | DB 접속 | ⚠️ 로컬만 |
| **PostgreSQL (내부)** | 5432 | 컨테이너 간 통신 | ❌ 내부 |

**접속 URL:**
- 뷰어: `http://[서버IP]:8754/`
- 관리자: `http://[서버IP]:8754/admin`

---

## 데이터 흐름

### 1. 이미지 업로드 프로세스
```
PC 브라우저 (admin.html)
    ↓ POST /api/admin/upload (FormData)
Express Server (server.js)
    ↓ Formidable 파일 파싱
Sharp 이미지 리사이징 (1920px)
    ↓ 파일 저장
public/uploads/[uuid].jpg
    ↓ Prisma ORM
PostgreSQL (Image 테이블)
    ✓ 완료
```

### 2. 뷰어 슬라이드쇼 표시
```
iPad Safari (viewer.html)
    ↓ XMLHttpRequest GET /api/viewer/images
Express Server (server.js)
    ↓ Prisma 쿼리
PostgreSQL (Image + Settings 테이블)
    ↓ JSON 응답
viewer.html
    ↓ JavaScript 처리
자동 슬라이드쇼 재생
    ↓ 10분마다 자동 갱신
```

### 3. 설정 업데이트
```
PC 브라우저 (admin.html)
    ↓ PUT /api/admin/settings (JSON)
Express Server (server.js)
    ↓ Prisma 업데이트
PostgreSQL (Settings 테이블)
    ✓ 저장 완료
    ↓ 
iPad 자동 갱신 (최대 10분 후)
```

---

## 주요 기능 설명

### 뷰어 페이지 (viewer.html)

**대상:** iPad mini 1세대 (iOS 9.3.6)

**기술적 특징:**
- ES5 JavaScript (구형 브라우저 완벽 호환)
- XMLHttpRequest (Fetch API 미지원 대응)
- CSS `background-size`로 이미지 표시 모드 구현
- Fade 전환 효과

**기능:**
- 자동 슬라이드쇼
- 전체 화면 표시
- 10분마다 자동 이미지 갱신
- 네트워크 오류 시 자동 재시도
- 표시 모드 설정 (cover/contain)

**전체 화면 설정:**
1. Safari로 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 홈 화면 아이콘으로 실행 → 완전 전체 화면!

### 관리자 페이지 (admin.html)

**대상:** PC 또는 최신 모바일 기기

**기술적 특징:**
- 모던 JavaScript (ES6+)
- Fetch API
- FormData로 파일 업로드
- CSS Grid 레이아웃

**기능:**
- 이미지 업로드 (드래그 앤 드롭 지원)
- 이미지 삭제
- 이미지 순서 변경
- 슬라이드쇼 설정:
  - 슬라이드 시간 (1-60초)
  - 전환 효과 (Fade/None)
  - 전환 속도 (0.1-5초)
  - 표시 모드 (Cover/Contain)
- 실시간 미리보기

### 아이콘 생성기 (icon-generator.html)

**용도:** 홈 화면 아이콘 커스터마이징

**기능:**
- 텍스트 기반 아이콘 생성
- 3가지 스타일 (텍스트/액자/사진)
- 실시간 미리보기
- 152×152, 192×192 크기 다운로드

---

## 보안 고려사항

### 파일 시스템
- `public/uploads/` - 업로드된 이미지 (외부 접근 가능)
- `.env`, `.env.local` - Git에서 제외 (민감 정보)

### Docker
- Non-root user 실행 (node:node)
- 최소 권한 원칙
- Alpine Linux (취약점 최소화)

### 네트워크
- PostgreSQL 포트 외부 노출 차단 권장
- 방화벽에서 8754 포트만 허용

---

## 성능 최적화

### 이미지 처리
- 자동 리사이징: 최대 1920px
- 권장 파일 크기: 500KB 이하
- 지원 형식: JPG, PNG

### 메모리 관리
- iPad mini 1세대: 512MB RAM
- 권장 이미지 수: 20개 이하
- 자동 메모리 정리

### 캐싱
- 정적 파일 브라우저 캐싱
- 이미지 CDN 가능 (선택)

---

## 개발 워크플로우

### 로컬 개발
```bash
# 1. PostgreSQL 시작
docker-compose -f docker-compose.dev.yml up -d

# 2. Prisma 마이그레이션
npx prisma migrate deploy
npx prisma generate

# 3. 서버 시작
npm run dev  # nodemon으로 자동 재시작
```

### 프로덕션 배포
```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 2. Docker Compose 빌드 및 실행
docker-compose up -d

# 3. 상태 확인
docker-compose ps
docker-compose logs -f
```

---

## 문제 해결

### 자주 발생하는 문제

**1. 서버가 시작되지 않음**
```bash
# 포트 사용 확인
lsof -i :8754
# 다른 프로세스가 사용 중이면 종료
```

**2. 데이터베이스 연결 실패**
```bash
# PostgreSQL 컨테이너 확인
docker-compose ps
docker-compose logs postgres
```

**3. 이미지 업로드 실패**
```bash
# uploads 폴더 권한 확인
ls -la public/uploads
chmod 755 public/uploads
```

**4. iPad에서 빈 화면**
- Safari 캐시 삭제
- 서버 로그 확인
- 네트워크 연결 확인

---

## 향후 개선 계획

### 계획 중인 기능
- [ ] 사용자 인증 (간단한 비밀번호)
- [ ] 앨범 기능 (여러 앨범 관리)
- [ ] 이미지별 개별 표시 시간 설정
- [ ] 오프라인 지원 (Service Worker)
- [ ] 이미지 일괄 업로드

### 기술 부채
- 테스트 코드 작성 (Jest, Playwright)
- CI/CD 파이프라인 구축
- 성능 모니터링 도구 연동

---

## 라이선스

MIT License

---

## 관련 문서

- **[LOCAL_DOCKER_GUIDE.md](./LOCAL_DOCKER_GUIDE.md)** - 로컬 Docker 테스트 방법
- **[SYNOLOGY_DEPLOYMENT_GUIDE.md](./SYNOLOGY_DEPLOYMENT_GUIDE.md)** - Synology NAS 배포 방법
- **[프로젝트 루트 README.md](../README.md)** - 프로젝트 소개

