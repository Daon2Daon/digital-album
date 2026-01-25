# 🛠️ 로컬 개발 가이드

이 문서는 로컬 환경(macOS)에서 Digital Album을 개발하는 방법을 설명합니다.

---

## 📋 사전 요구사항

### 필수 소프트웨어
- **Node.js 18+** - JavaScript 런타임
- **npm** - 패키지 관리자 (Node.js와 함께 설치됨)
- **Git** - 버전 관리

### 시스템 요구사항
- macOS (개발 환경)
- RAM: 최소 4GB
- 디스크 여유 공간: 최소 1GB

---

## 🚀 빠른 시작

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
```

**.env.local 내용 (기본값 사용 가능):**
```bash
# Application
PORT=8754

# Database (SQLite)
DATABASE_URL="file:./prisma/dev.db"
```

### 3단계: 의존성 설치

```bash
# npm 패키지 설치
npm install

# Prisma Client 생성
npx prisma generate
```

### 4단계: 데이터베이스 설정

```bash
# 마이그레이션 실행 (데이터베이스 생성)
npx prisma migrate deploy

# 선택: 초기 데이터 생성 (기본 설정)
npx prisma db seed
```

### 5단계: 서버 시작

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 또는 일반 실행
npm start
```

**출력 예시:**
```
========================================
Digital Album Server (Vanilla JS)
========================================
Server: http://0.0.0.0:8754
Viewer: http://0.0.0.0:8754/
Admin:  http://0.0.0.0:8754/admin
========================================
```

### 6단계: 브라우저에서 확인

1. **뷰어 페이지:** http://localhost:8754/
2. **관리자 페이지:** http://localhost:8754/admin

---

## 🧪 개발 워크플로우

### 코드 수정 및 테스트

```bash
# 1. 개발 서버 실행 (자동 재시작)
npm run dev

# 2. 코드 수정
# server.js, public/*.html 등 편집

# 3. 브라우저에서 자동 새로고침
# nodemon이 파일 변경을 감지하고 자동 재시작

# 4. 테스트
# 브라우저에서 기능 확인
```

### 데이터베이스 관리

```bash
# Prisma Studio 실행 (DB GUI)
npx prisma studio
# 브라우저에서 http://localhost:5555 자동 오픈

# 스키마 변경 후 마이그레이션 생성
npx prisma migrate dev --name description_of_change

# 마이그레이션 적용
npx prisma migrate deploy

# 데이터베이스 초기화 (주의!)
npx prisma migrate reset
```

### 이미지 업로드 테스트

**관리자 페이지에서:**
1. http://localhost:8754/admin 접속
2. 상단 업로드 영역 클릭 또는 드래그 앤 드롭
3. JPG/PNG 이미지 선택
4. 업로드 완료 확인

**확인 사항:**
- 이미지가 목록에 표시됨
- `public/uploads/` 폴더에 파일 생성됨
- 썸네일이 정상적으로 보임

---

## 📦 배포 준비

### GitHub에 푸시

로컬에서 개발이 완료되면 GitHub에 푸시합니다:

```bash
# 변경사항 확인
git status
git diff

# 스테이징
git add .

# 커밋
git commit -m "feat: 새로운 기능 추가"

# 푸시
git push origin main
```

### 자동 배포

GitHub에 푸시하면:
1. **GitHub Actions**가 자동으로 Docker 이미지 빌드
2. **GHCR**에 새 이미지 푸시
3. **Watchtower**가 5분 내 새 이미지 감지
4. **Portainer**에서 자동으로 재배포

전체 과정이 자동화되어 있어 별도 배포 작업 불필요!

---

## 🛠️ 유용한 명령어

### npm 스크립트

```bash
# 서버 시작 (일반)
npm start

# 서버 시작 (개발 모드, 자동 재시작)
npm run dev

# 데이터베이스 설정
npm run db:setup

# Prisma Studio (DB GUI)
npm run db:studio

# 마이그레이션 실행
npm run db:migrate

# 데이터베이스 초기화
npm run db:reset
```

### Prisma 명령어

```bash
# Client 생성
npx prisma generate

# 마이그레이션 생성 (개발)
npx prisma migrate dev --name migration_name

# 마이그레이션 적용 (프로덕션)
npx prisma migrate deploy

# 스키마 검증
npx prisma validate

# 데이터베이스 초기화 (주의!)
npx prisma migrate reset

# Studio (DB GUI) 실행
npx prisma studio

# 스키마 포맷
npx prisma format
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

# 또는 .env.local에서 다른 포트 사용
PORT=8755
```

### 문제 2: Prisma Client 오류

**증상:**
```
Error: @prisma/client did not initialize yet
```

**해결:**
```bash
# Prisma Client 재생성
npx prisma generate

# node_modules 재설치
rm -rf node_modules
npm install
```

### 문제 3: 데이터베이스 연결 실패

**증상:**
```
Error: Can't reach database server
```

**해결:**
```bash
# DATABASE_URL 확인
cat .env.local

# SQLite 파일 확인
ls -la prisma/*.db

# 마이그레이션 재실행
npx prisma migrate deploy
```

### 문제 4: 이미지 업로드 실패

**증상:**
```
Error: EACCES: permission denied, open '/app/public/uploads/...'
```

**해결:**
```bash
# uploads 폴더 생성 및 권한 설정
mkdir -p public/uploads
chmod 755 public/uploads
```

### 문제 5: nodemon이 재시작하지 않음

**해결:**
```bash
# nodemon 재설치
npm install --save-dev nodemon

# 또는 일반 모드로 실행
npm start
```

---

## 🧹 환경 정리

### 개발 데이터 초기화

```bash
# 데이터베이스 초기화
npx prisma migrate reset

# 업로드된 이미지 삭제
rm -rf public/uploads/*
touch public/uploads/.gitkeep

# 개발 DB 파일 삭제
rm -f prisma/dev.db*
```

### node_modules 재설치

```bash
# node_modules 삭제
rm -rf node_modules

# package-lock.json 삭제 (선택)
rm package-lock.json

# 재설치
npm install
```

---

## 📊 성능 확인

### 리소스 사용량

**예상 사용량:**
```
프로세스: node server.js
CPU: 0.1%
메모리: ~50MB
디스크: ~500MB (node_modules 포함)
```

### 디스크 사용량 확인

```bash
# node_modules 크기
du -sh node_modules

# 전체 프로젝트 크기
du -sh .

# uploads 폴더 크기
du -sh public/uploads
```

---

## 🎯 개발 체크리스트

### 최초 설정
- [ ] Node.js 18+ 설치 확인
- [ ] 프로젝트 클론 완료
- [ ] `.env.local` 파일 생성
- [ ] npm 의존성 설치 (`npm install`)
- [ ] Prisma Client 생성 (`npx prisma generate`)
- [ ] 데이터베이스 마이그레이션 (`npx prisma migrate deploy`)
- [ ] 서버 시작 성공 (`npm run dev`)
- [ ] 브라우저 접속 확인 (http://localhost:8754)

### 개발 중
- [ ] nodemon 자동 재시작 동작 확인
- [ ] 코드 변경 후 자동 새로고침 확인
- [ ] 이미지 업로드 테스트
- [ ] 슬라이드쇼 동작 확인
- [ ] API 응답 확인

### 배포 전
- [ ] 모든 기능 테스트 완료
- [ ] 콘솔 에러 없음 확인
- [ ] 코드 커밋 및 푸시
- [ ] GitHub Actions 빌드 성공 확인

---

## 📝 다음 단계

로컬 개발이 완료되면:

1. **GitHub 푸시:** 변경사항을 main 브랜치에 푸시
2. **자동 배포:** GitHub Actions + Watchtower가 자동 배포
3. **Portainer 확인:** Portainer UI에서 배포 상태 확인
4. **iPad 테스트:** iPad에서 뷰어 동작 확인

---

## 📚 관련 문서

- **[SYNOLOGY_DEPLOYMENT_GUIDE.md](./SYNOLOGY_DEPLOYMENT_GUIDE.md)** - Portainer 배포 가이드
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - 프로젝트 구조 및 개요
- **[루트 README.md](../README.md)** - 프로젝트 소개

---

## 📧 문의

개발 관련 문제는 GitHub Issues에 다음 정보와 함께 문의해주세요:

- macOS 버전
- Node.js 버전 (`node --version`)
- npm 버전 (`npm --version`)
- 에러 메시지 전체
- 콘솔 로그

---

**즐거운 개발 되세요!** 🚀
