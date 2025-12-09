# 🖼️ Digital Album (디지털 액자)

iPad mini 1세대 (iOS 9.3.6)를 위한 완벽한 디지털 액자 솔루션

---

## ✨ 주요 기능

### 뷰어 (iPad mini 1세대)
- ✅ **완전 전체 화면** - 주소창, 탭바, 툴바 모두 숨김
- ✅ **자동 슬라이드쇼** - 설정 가능한 시간 간격
- ✅ **부드러운 전환 효과** - Fade 애니메이션
- ✅ **두 가지 표시 모드**:
  - 전체 화면 채우기 (Cover)
  - 이미지 전체 보기 (Contain)
- ✅ **홈 화면 웹앱** - 아이콘 터치로 즉시 실행
- ✅ **자동 갱신** - 10분마다 새 이미지 확인
- ✅ **오류 복구** - 네트워크 문제 시 자동 재시도

### 관리자 (PC/최신 기기)
- ✅ **이미지 업로드** - 드래그 앤 드롭 지원
- ✅ **자동 리사이징** - 1920px로 최적화
- ✅ **이미지 관리** - 순서 변경, 삭제
- ✅ **설정 관리**:
  - 슬라이드 시간 (1-60초)
  - 전환 효과 (Fade/None)
  - 전환 속도 (0.1-5초)
  - 표시 모드 (Cover/Contain)
- ✅ **실시간 미리보기**

---

## 🚀 빠른 시작

### 필요 사항
- Node.js 18+
- PostgreSQL 15 (Docker로 자동 설치)
- iPad mini 1세대 (iOS 9.3.6)

### 로컬 개발

```bash
# 1. 저장소 클론
git clone <repository-url>
cd digital-album

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집 (DATABASE_URL 등)

# 3. 의존성 설치
npm install

# 4. 데이터베이스 시작 (Docker)
docker-compose -f docker-compose.dev.yml up -d

# 5. 데이터베이스 마이그레이션
npx prisma migrate deploy
npx prisma generate

# 6. 서버 시작
node server.js
```

### Docker 배포 (Synology NAS)

```bash
# 1. 프로젝트 폴더로 이동
cd digital-album

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 3. Docker Compose 실행
docker-compose up -d

# 4. 상태 확인
docker-compose ps
docker-compose logs -f
```

자세한 내용: **[docs/SYNOLOGY_DEPLOYMENT.md](./docs/SYNOLOGY_DEPLOYMENT.md)**

---

## 📱 iPad 전체 화면 설정 (3단계)

### 1단계: Safari로 접속
```
http://[SERVER_IP]:8754/
```

### 2단계: 홈 화면에 추가
1. Safari 공유 버튼(↗️) 탭
2. "홈 화면에 추가" 선택
3. "추가" 탭

### 3단계: 실행
- 홈 화면에서 "디지털 액자" 아이콘 탭
- 완전 전체 화면으로 실행!

**결과**: 주소창, 탭바, 툴바 모두 사라진 완전한 전체 화면

자세한 내용: **[docs/HIDE_ADDRESS_BAR.md](./docs/HIDE_ADDRESS_BAR.md)**

---

## 📚 문서

### 사용자 가이드
- **[QUICK_START.md](./docs/QUICK_START.md)** - 빠른 시작 및 문제 해결
- **[HIDE_ADDRESS_BAR.md](./docs/HIDE_ADDRESS_BAR.md)** - 전체 화면 설정 (3단계)
- **[FULLSCREEN_GUIDE.md](./docs/FULLSCREEN_GUIDE.md)** - 표시 모드 가이드
- **[FULLSCREEN_SETUP.md](./docs/FULLSCREEN_SETUP.md)** - 상세 전체 화면 가이드

### 개발자 가이드
- **[VANILLA_SETUP_GUIDE.md](./docs/VANILLA_SETUP_GUIDE.md)** - 전체 설치 가이드
- **[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - 프로젝트 구조
- **[database-setup.md](./docs/database-setup.md)** - 데이터베이스 설정
- **[fullscreen-mode-guide.md](./docs/fullscreen-mode-guide.md)** - 기술 문서

### 배포 가이드
- **[SYNOLOGY_DEPLOYMENT.md](./docs/SYNOLOGY_DEPLOYMENT.md)** ⭐️ - Synology NAS 배포

---

## 🏗️ 기술 스택

### Backend
- **Express.js** - 웹 서버
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스
- **Sharp** - 이미지 처리
- **Formidable** - 파일 업로드

### Frontend
- **Vanilla JavaScript (ES5)** - iOS 9.3.6 완벽 호환
- **Pure HTML/CSS** - 최소 의존성
- **Web App Manifest** - 홈 화면 추가

### DevOps
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 관리
- **Synology NAS** - 배포 플랫폼

---

## 📂 프로젝트 구조

```
digital-album/
├── server.js                         # Express 서버 (메인)
├── package.json                      # 의존성
├── Dockerfile                        # Docker 이미지
├── docker-compose.yml                # Docker Compose (프로덕션)
├── .env.example                      # 환경 변수 템플릿
│
├── prisma/
│   ├── schema.prisma                 # 데이터베이스 스키마
│   ├── migrations/                   # 마이그레이션
│   └── seed.ts                       # 초기 데이터
│
├── public/
│   ├── viewer.html                   # 뷰어 (iPad용)
│   ├── admin.html                    # 관리자 (PC용)
│   ├── icon-generator.html           # 아이콘 생성기
│   ├── manifest.json                 # 웹앱 매니페스트
│   └── uploads/                      # 업로드된 이미지
│
└── docs/                             # 문서
    ├── QUICK_START.md
    ├── SYNOLOGY_DEPLOYMENT.md        ⭐️
    └── ...
```

---

## 🎨 사용 예시

### 1. 이미지 업로드 (PC)

```
http://localhost:8754/admin 접속
→ 이미지 파일 드래그 앤 드롭
→ 자동으로 1920px 리사이징
→ 업로드 완료
```

### 2. 설정 변경 (PC)

```
관리자 페이지 하단
→ 슬라이드 시간: 10초
→ 전환 효과: Fade
→ 전환 속도: 1초
→ 표시 모드: 전체 화면 채우기
→ "설정 저장" 클릭
```

### 3. iPad에서 즐기기

```
홈 화면 아이콘 탭
→ 전체 화면 실행
→ 자동 슬라이드쇼 시작
→ 10초마다 자동 전환
```

---

## ⚙️ 설정

### 환경 변수 (.env)

```bash
# 데이터베이스
DB_USER=mook
DB_PASSWORD=your_password
DB_NAME=DAlbumDB
DB_PORT=4578

# 애플리케이션
APP_PORT=8754
NODE_ENV=production

# Prisma
DATABASE_URL="postgresql://mook:password@postgres:5432/DAlbumDB?schema=public"
```

### 슬라이드쇼 설정 (관리자 페이지)

- **슬라이드 시간**: 1-60초 (기본 10초)
- **전환 효과**: Fade / None (기본 Fade)
- **전환 속도**: 0.1-5초 (기본 1초)
- **표시 모드**: Cover / Contain (기본 Cover)

---

## 🔧 개발

### 개발 서버 실행

```bash
# 서버 시작 (nodemon)
npm run dev

# 또는 일반 실행
node server.js
```

### 데이터베이스 관리

```bash
# 마이그레이션 생성
npx prisma migrate dev --name description

# Prisma Studio (DB GUI)
npx prisma studio

# 데이터 초기화
npx prisma migrate reset
```

### Docker 관리

```bash
# 컨테이너 시작
docker-compose up -d

# 컨테이너 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 재빌드
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 API 엔드포인트

### 뷰어 API
- `GET /api/viewer/images` - 이미지 목록 및 설정

### 관리자 API
- `GET /api/admin/images` - 이미지 목록 (관리용)
- `POST /api/admin/upload` - 이미지 업로드
- `DELETE /api/admin/images/:id` - 이미지 삭제
- `GET /api/admin/settings` - 설정 조회
- `PUT /api/admin/settings` - 설정 업데이트

---

## 🐛 문제 해결

### 서버가 시작 안 됨
```bash
# 포트 확인
lsof -i :8754

# 프로세스 종료
kill -9 <PID>
```

### 데이터베이스 연결 실패
```bash
# Docker 컨테이너 확인
docker-compose ps

# 컨테이너 재시작
docker-compose restart postgres
```

### iPad에서 이미지 안 보임
1. 서버 실행 확인
2. 네트워크 연결 확인
3. Safari 캐시 삭제
4. 페이지 새로고침

더 많은 문제 해결: **[docs/QUICK_START.md](./docs/QUICK_START.md)**

---

## 📈 성능

| 항목 | 값 |
|------|-----|
| **메모리 사용** | ~10MB |
| **로딩 시간** | < 1초 |
| **파일 크기** | ~20KB |
| **지원 기기** | iPad mini 1세대 (iOS 9.3.6+) |
| **권장 이미지 수** | 20개 이하 |
| **권장 이미지 크기** | 500KB 이하 |

---

## 🎯 로드맵

### 완료 ✅
- [x] 바닐라 JS 구현
- [x] 전체 화면 지원
- [x] 표시 모드 선택
- [x] 자동 슬라이드쇼
- [x] 이미지 업로드
- [x] 설정 관리
- [x] Docker 배포
- [x] Synology NAS 지원

### 계획 중 🔜
- [ ] 이미지별 표시 시간 설정
- [ ] 앨범 기능
- [ ] 간단한 인증
- [ ] 오프라인 지원 (Service Worker)

---

## 📝 라이선스

MIT License

---

## 🤝 기여

이슈 및 PR 환영합니다!

---

## 📧 문의

프로젝트 관련 문의사항은 이슈로 남겨주세요.

---

**완벽한 디지털 액자를 즐기세요!** 🖼️✨
