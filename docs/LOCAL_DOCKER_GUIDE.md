# 🐳 로컬 Docker 테스트 가이드

이 문서는 로컬 환경에서 Docker를 사용하여 프로젝트를 테스트하는 방법을 설명합니다.

---

## 📋 사전 요구사항

### 필수 소프트웨어
- **Docker Desktop** (최신 버전 권장)
  - macOS: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
  - Windows: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- **Node.js 18+** (로컬 개발 시)
- **Git** (소스 코드 복제용)

### 시스템 요구사항
- RAM: 최소 4GB (권장 8GB)
- 디스크 여유 공간: 최소 2GB

---

## 🚀 방법 1: 로컬 개발 (권장)

이 방법은 **데이터베이스만 Docker로 실행**하고, 애플리케이션은 로컬에서 직접 실행합니다.
빠른 개발 사이클과 쉬운 디버깅이 가능합니다.

### 1단계: 프로젝트 클론

```bash
# 저장소 클론
git clone <repository-url>
cd digital-album
```

### 2단계: 환경 변수 설정

```bash
# 환경 변수 템플릿 복사
cp .env.local.example .env.local

# .env.local 파일 편집 (선택사항)
# 기본값으로도 작동합니다
```

**.env.local 예시:**
```bash
# Application
PORT=8754

# Database (로컬 Docker)
DATABASE_URL="postgresql://mook:dalbum%4010061912@localhost:4578/DAlbumDB?schema=public"
```

> **참고:** `%40`는 URL 인코딩된 `@` 기호입니다.

### 3단계: Docker로 PostgreSQL 시작

```bash
# PostgreSQL 컨테이너 시작 (백그라운드)
docker-compose -f docker-compose.dev.yml up -d

# 컨테이너 상태 확인
docker-compose -f docker-compose.dev.yml ps
```

**출력 예시:**
```
NAME                 SERVICE    STATUS    PORTS
digital-album-db    postgres   Up        0.0.0.0:4578->5432/tcp
```

### 4단계: npm 의존성 설치

```bash
# 의존성 설치
npm install

# Prisma Client 생성
npx prisma generate
```

### 5단계: 데이터베이스 마이그레이션

```bash
# 마이그레이션 실행
npx prisma migrate deploy

# 선택: 초기 데이터 생성 (샘플 설정)
npx prisma db seed
```

### 6단계: 서버 시작

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 또는 일반 실행
npm start
```

**출력 예시:**
```
===========================================
Digital Album Server (Vanilla JS)
===========================================
Server: http://0.0.0.0:8754
Viewer: http://0.0.0.0:8754/
Admin:  http://0.0.0.0:8754/admin
===========================================
```

### 7단계: 브라우저에서 확인

1. **관리자 페이지:** http://localhost:8754/admin
2. **뷰어 페이지:** http://localhost:8754/

---

## 🐳 방법 2: 완전한 Docker 환경

이 방법은 **애플리케이션과 데이터베이스 모두 Docker로 실행**합니다.
프로덕션 환경과 동일한 구성으로 테스트할 수 있습니다.

### 1단계: 프로젝트 클론

```bash
git clone <repository-url>
cd digital-album
```

### 2단계: 환경 변수 설정

```bash
# 환경 변수 템플릿 복사
cp .env.example .env

# .env 파일 편집 (비밀번호 변경 필수!)
```

**.env 예시:**
```bash
# Database
DB_USER=mook
DB_PASSWORD=your_secure_password_here  # 반드시 변경!
DB_NAME=DAlbumDB
DB_PORT=4578

# Application
APP_PORT=8754
NODE_ENV=production

# Prisma
DATABASE_URL="postgresql://mook:your_secure_password_here@postgres:5432/DAlbumDB?schema=public"
```

### 3단계: Docker Compose로 빌드 및 실행

```bash
# 백그라운드에서 빌드 및 실행
docker-compose up -d --build

# 실시간 로그 확인
docker-compose logs -f
```

**빌드 과정 (약 2-3분 소요):**
1. Node.js 베이스 이미지 다운로드
2. npm 의존성 설치
3. Prisma Client 생성
4. 애플리케이션 이미지 빌드
5. 컨테이너 시작

### 4단계: 컨테이너 상태 확인

```bash
# 컨테이너 목록
docker-compose ps
```

**출력 예시:**
```
NAME                   SERVICE    STATUS    PORTS
digital-album-app      app        Up        0.0.0.0:8754->8754/tcp
digital-album-db       postgres   Up        0.0.0.0:4578->5432/tcp
```

### 5단계: 브라우저에서 확인

1. **관리자 페이지:** http://localhost:8754/admin
2. **뷰어 페이지:** http://localhost:8754/

---

## 🧪 테스트 시나리오

### 1. 이미지 업로드 테스트

**PC에서:**
1. http://localhost:8754/admin 접속
2. 상단 업로드 영역 클릭 또는 드래그 앤 드롭
3. JPG/PNG 이미지 선택
4. 업로드 완료 확인

**확인:**
- 이미지가 목록에 표시됨
- 썸네일이 정상적으로 보임
- `public/uploads/` 폴더에 파일 생성됨

### 2. 슬라이드쇼 테스트

**뷰어에서:**
1. http://localhost:8754/ 접속
2. 첫 번째 이미지 표시 확인
3. 설정된 시간 후 자동 전환 확인
4. 이미지 순환 재생 확인

### 3. 설정 변경 테스트

**관리자 페이지에서:**
1. 하단 "슬라이드쇼 설정" 섹션 이동
2. 슬라이드 시간을 5초로 변경
3. "설정 저장" 클릭
4. 뷰어 페이지 새로고침
5. 5초마다 이미지 전환 확인

### 4. API 테스트

```bash
# 이미지 목록 조회
curl http://localhost:8754/api/viewer/images

# 설정 조회
curl http://localhost:8754/api/admin/settings
```

**예상 응답:**
```json
{
  "success": true,
  "images": [...],
  "settings": {
    "slideDuration": 10000,
    "transitionEffect": "fade",
    "transitionSpeed": 1.0,
    "displayMode": "cover"
  }
}
```

---

## 🛠️ 유용한 명령어

### Docker 컨테이너 관리

```bash
# 컨테이너 시작
docker-compose up -d

# 컨테이너 중지
docker-compose down

# 컨테이너 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart app

# 로그 확인 (실시간)
docker-compose logs -f

# 앱 로그만 확인
docker-compose logs -f app

# PostgreSQL 로그만 확인
docker-compose logs -f postgres

# 컨테이너 내부 접속
docker-compose exec app sh
docker-compose exec postgres psql -U mook -d DAlbumDB
```

### 데이터베이스 관리

```bash
# Prisma Studio 실행 (DB GUI)
npx prisma studio
# 브라우저에서 http://localhost:5555 자동 오픈

# 마이그레이션 생성
npx prisma migrate dev --name your_migration_name

# 마이그레이션 적용
npx prisma migrate deploy

# 데이터베이스 초기화 (주의!)
npx prisma migrate reset
```

### 개발 도구

```bash
# 서버 재시작 없이 자동 리로드
npm run dev

# Docker 이미지 재빌드 (캐시 무시)
docker-compose build --no-cache

# 사용하지 않는 Docker 리소스 정리
docker system prune -a
```

---

## 🐛 문제 해결

### 문제 1: 포트 충돌

**증상:**
```
Error: listen EADDRINUSE: address already in use :::8754
```

**해결:**
```bash
# 1. 사용 중인 프로세스 확인
lsof -i :8754

# 2. 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용
# .env 파일에서 APP_PORT 변경
```

### 문제 2: 데이터베이스 연결 실패

**증상:**
```
Error: P1001: Can't reach database server
```

**해결:**
```bash
# 1. PostgreSQL 컨테이너 상태 확인
docker-compose ps

# 2. PostgreSQL 로그 확인
docker-compose logs postgres

# 3. 컨테이너 재시작
docker-compose restart postgres

# 4. DATABASE_URL 확인
cat .env.local  # 또는 .env
```

### 문제 3: Docker 빌드 실패

**증상:**
```
ERROR [build X/Y] ...
```

**해결:**
```bash
# 1. Docker 캐시 삭제 후 재빌드
docker-compose build --no-cache

# 2. 기존 컨테이너 및 볼륨 삭제
docker-compose down -v

# 3. 다시 빌드 및 실행
docker-compose up -d --build
```

### 문제 4: 이미지 업로드 실패

**증상:**
```
Error: EACCES: permission denied, open '/app/public/uploads/...'
```

**해결:**
```bash
# 로컬 개발 환경
mkdir -p public/uploads
chmod 755 public/uploads

# Docker 환경
docker-compose exec app sh -c "mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads"
```

### 문제 5: Prisma Client 오류

**증상:**
```
Error: @prisma/client did not initialize yet
```

**해결:**
```bash
# Prisma Client 재생성
npx prisma generate

# Docker 환경이면 컨테이너 재빌드
docker-compose down
docker-compose up -d --build
```

---

## 🧹 환경 정리

### 로컬 개발 환경 정리

```bash
# PostgreSQL 컨테이너 중지 및 삭제
docker-compose -f docker-compose.dev.yml down

# 볼륨까지 삭제 (데이터 완전 삭제!)
docker-compose -f docker-compose.dev.yml down -v

# 로컬 DB 데이터 폴더 삭제
rm -rf local-db-data/

# node_modules 삭제 (재설치 필요 시)
rm -rf node_modules
```

### Docker 환경 정리

```bash
# 컨테이너 중지 및 삭제
docker-compose down

# 볼륨까지 삭제 (데이터 완전 삭제!)
docker-compose down -v

# 이미지까지 삭제
docker-compose down --rmi all

# Docker 시스템 전체 정리 (주의!)
docker system prune -a --volumes
```

---

## 📊 성능 확인

### 리소스 사용량 모니터링

```bash
# Docker 컨테이너 리소스 사용량
docker stats

# 특정 컨테이너만 확인
docker stats digital-album-app
```

**예상 사용량:**
```
CONTAINER            CPU %   MEM USAGE / LIMIT     MEM %
digital-album-app    0.1%    50MB / 4GB           1.25%
digital-album-db     0.2%    30MB / 4GB           0.75%
```

### 디스크 사용량 확인

```bash
# Docker 전체 디스크 사용량
docker system df

# 볼륨 크기 확인
docker volume ls
docker system df -v
```

---

## 🎯 체크리스트

### 로컬 개발 환경

- [ ] Docker Desktop 실행 중
- [ ] `.env.local` 파일 생성
- [ ] PostgreSQL 컨테이너 실행 (`docker-compose -f docker-compose.dev.yml up -d`)
- [ ] npm 의존성 설치 (`npm install`)
- [ ] Prisma 마이그레이션 (`npx prisma migrate deploy`)
- [ ] 서버 시작 (`npm run dev`)
- [ ] 브라우저 접속 확인 (http://localhost:8754)
- [ ] 이미지 업로드 테스트
- [ ] 슬라이드쇼 동작 확인

### Docker 환경

- [ ] Docker Desktop 실행 중
- [ ] `.env` 파일 생성 (비밀번호 변경!)
- [ ] Docker Compose 빌드 (`docker-compose up -d --build`)
- [ ] 컨테이너 상태 확인 (`docker-compose ps`)
- [ ] 로그 확인 (`docker-compose logs -f`)
- [ ] 브라우저 접속 확인 (http://localhost:8754)
- [ ] 이미지 업로드 테스트
- [ ] 슬라이드쇼 동작 확인

---

## 📝 다음 단계

로컬 테스트가 완료되면:

1. **Synology NAS 배포:** [SYNOLOGY_DEPLOYMENT_GUIDE.md](./SYNOLOGY_DEPLOYMENT_GUIDE.md) 참고
2. **iPad 전체 화면 설정:** 루트 README.md 참고
3. **프로젝트 구조 이해:** [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) 참고

---

## 📧 문의

문제가 해결되지 않으면 GitHub Issues에 다음 정보와 함께 문의해주세요:

- 운영체제 및 버전
- Docker Desktop 버전
- Node.js 버전
- 에러 메시지 전체
- `docker-compose logs` 출력

---

**로컬 환경에서 성공적인 테스트 되시길 바랍니다!** 🚀

