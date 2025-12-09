# 바닐라 JavaScript 버전 설치 가이드

## 완성된 구조

```
digital-album/
├── server.js                 # Express.js 서버
├── package-vanilla.json      # 의존성 설정
├── prisma/                   # 기존 DB 스키마 (재사용)
│   └── schema.prisma
├── public/
│   ├── viewer.html          # 뷰어 (iPad mini 1세대용)
│   ├── admin.html           # 관리자 (PC용)
│   └── uploads/             # 업로드된 이미지
└── .env.local               # 환경 변수
```

## 설치 및 실행

### 1단계: package.json 교체

```bash
cd /Users/sungmukchoi/cursor_workspace/digital-album

# 기존 package.json 백업
mv package.json package-next.json.backup

# 바닐라 버전 사용
cp package-vanilla.json package.json
```

### 2단계: 의존성 설치

```bash
# 기존 node_modules 삭제
rm -rf node_modules package-lock.json

# 새로 설치
npm install
```

### 3단계: Prisma 생성

```bash
# Prisma Client 생성 (기존 스키마 사용)
npx prisma generate
```

### 4단계: 데이터베이스 확인

```bash
# PostgreSQL이 실행 중인지 확인
npm run db:up

# 또는 Docker로 실행 중이라면 그대로 사용
```

### 5단계: 서버 실행

```bash
# 개발 모드
node server.js

# 또는
npm start
```

서버가 실행되면:
```
===========================================
Digital Album Server (Vanilla JS)
===========================================
Server: http://0.0.0.0:8754
Viewer: http://0.0.0.0:8754/
Admin:  http://0.0.0.0:8754/admin
===========================================
```

## 사용 방법

### iPad mini 1세대에서

```
http://[NAS_IP]:8754/
```

- ✅ 자동으로 이미지 슬라이드쇼 시작
- ✅ 10분마다 새 이미지 확인
- ✅ 백그라운드에서도 작동

### PC에서 (관리자)

```
http://[NAS_IP]:8754/admin
```

**기능**:
1. 이미지 업로드 (드래그 앤 드롭 지원)
2. 이미지 삭제
3. 슬라이드 시간 설정
4. 전환 효과 설정

## 초기 설정

### 1. 첫 이미지 업로드

1. PC에서 `http://[NAS_IP]:8754/admin` 접속
2. "클릭하거나 파일을 드래그하세요" 영역 클릭
3. JPG/PNG 이미지 선택
4. 업로드 완료 대기

### 2. 슬라이드쇼 설정

1. 관리자 페이지 하단 "슬라이드쇼 설정"
2. 슬라이드 시간 조정 (기본 10초)
3. "설정 저장" 클릭

### 3. iPad에서 확인

1. iPad mini 1세대에서 Safari 실행
2. `http://[NAS_IP]:8754/` 접속
3. 슬라이드쇼 자동 시작 확인

## 문제 해결

### 서버가 시작되지 않음

```bash
# 포트 3000 확인
lsof -i :8754

# 다른 프로세스가 사용 중이면 종료
kill -9 [PID]
```

### 데이터베이스 연결 오류

```bash
# .env.local 확인
cat .env.local

# DATABASE_URL이 올바른지 확인
# PostgreSQL이 실행 중인지 확인
docker ps
```

### 이미지가 업로드되지 않음

```bash
# public/uploads 폴더 권한 확인
mkdir -p public/uploads
chmod 755 public/uploads
```

### iPad에서 빈 화면

1. Safari 캐시 삭제
   ```
   설정 > Safari > 방문 기록 및 웹사이트 데이터 지우기
   ```

2. 서버 로그 확인
   ```bash
   # 서버 실행 중인 터미널에서 로그 확인
   ```

3. 브라우저 콘솔 확인
   - iPad를 Mac에 연결
   - Mac Safari > 개발 > [iPad] > [viewer.html]
   - 콘솔에서 에러 확인

## Docker 배포

### Dockerfile 수정

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 의존성 복사
COPY package.json ./
COPY prisma ./prisma/

# 설치
RUN npm install
RUN npx prisma generate

# 소스 복사
COPY server.js ./
COPY public ./public/

# 포트 노출
EXPOSE 3000

# 실행
CMD ["node", "server.js"]
```

### docker-compose.yml 수정

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: digital-album-db
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: photoframe
    volumes:
      - ./local-db-data:/var/lib/postgresql/data
    restart: always

  app:
    build: .
    container_name: digital-album-app
    ports:
      - "3000:8754"
    environment:
      DATABASE_URL: postgres://user:password@postgres:4578/photoframe
    volumes:
      - ./public/uploads:/app/public/uploads
    depends_on:
      - postgres
    restart: always
```

### Docker로 실행

```bash
# 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app
```

## 성능 최적화

### 1. 이미지 크기 제한

이미 server.js에서 1920px로 제한되어 있습니다.

### 2. 메모리 관리

iPad mini 1세대는 512MB RAM만 있으므로:
- 이미지 수: 20개 이하 권장
- 파일 크기: 각 500KB 이하 권장

### 3. 캐싱

브라우저 캐싱으로 이미지 재로딩 방지.

## 기능 제한

### 지원되는 기능
✅ 이미지 자동 전환
✅ Fade 효과
✅ 전체 화면
✅ 이미지 업로드/삭제
✅ 슬라이드 시간 설정
✅ 자동 갱신 (10분마다)

### 지원되지 않는 기능
❌ 복잡한 전환 효과
❌ 이미지 순서 변경 (displayOrder 고정)
❌ 사용자 인증
❌ 여러 앨범 관리

## 향후 개선 가능 사항

1. 이미지 순서 드래그 앤 드롭
2. 앨범 기능
3. 간단한 인증 (비밀번호)
4. 이미지 일괄 업로드
5. 슬라이드쇼 일시정지 버튼

## 비교

| 기능 | Next.js 버전 | 바닐라 JS 버전 |
|------|-------------|---------------|
| **iPad mini 1세대** | ❌ | ✅ |
| **관리자 기능** | 풍부 | 기본 |
| **개발 복잡도** | 높음 | 낮음 |
| **유지보수** | 어려움 | 쉬움 |
| **성능** | 무거움 | 가벼움 |
| **메모리 사용** | 많음 | 적음 |

## 요약

바닐라 JavaScript 버전은:
- ✅ iPad mini 1세대에서 확실히 작동
- ✅ 매우 가볍고 빠름
- ✅ 기본 기능 충분
- ⚠️ 고급 기능 제한적

디지털 액자로서 필요한 핵심 기능은 모두 포함되어 있습니다!

