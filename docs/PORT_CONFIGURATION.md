# 🔌 포트 설정

## 사용 포트

이 프로젝트는 다음 포트를 사용합니다:

| 서비스 | 포트 | 설명 |
|--------|------|------|
| **웹 애플리케이션** | **8754** | Express 서버 (뷰어 + 관리자) |
| **PostgreSQL** | **4578** | 데이터베이스 (외부 접속용) |
| **PostgreSQL (내부)** | 5432 | Docker 컨테이너 간 통신 |

---

## 접속 URL

### 로컬 개발
```
뷰어:    http://localhost:8754/
관리자:  http://localhost:8754/admin
```

### Synology NAS 배포
```
뷰어:    http://[NAS_IP]:8754/
관리자:  http://[NAS_IP]:8754/admin
```

### iPad 접속
```
http://[SERVER_IP]:8754/
```

---

## 환경 변수 설정

### .env (프로덕션)
```bash
# 애플리케이션 포트
APP_PORT=8754

# 데이터베이스 포트 (외부 접속)
DB_PORT=4578

# Prisma 연결 URL
DATABASE_URL="postgresql://mook:password@postgres:5432/DAlbumDB?schema=public"
```

### .env.local (로컬 개발)
```bash
# 애플리케이션 포트
PORT=8754

# Prisma 연결 URL (로컬 Docker)
DATABASE_URL="postgresql://mook:password@localhost:4578/DAlbumDB?schema=public"
```

---

## Docker 설정

### docker-compose.yml (프로덕션)
```yaml
services:
  postgres:
    ports:
      - "4578:5432"  # 외부:내부
  
  app:
    environment:
      PORT: 8754
    ports:
      - "8754:8754"  # 외부:내부
```

### docker-compose.dev.yml (로컬)
```yaml
services:
  postgres:
    ports:
      - "4578:5432"  # 로컬:컨테이너
```

---

## 포트 충돌 해결

### 포트 8754가 이미 사용 중인 경우

#### 1. 사용 중인 프로세스 확인
```bash
lsof -i :8754
```

#### 2. 프로세스 종료
```bash
kill -9 <PID>
```

#### 3. 또는 다른 포트 사용
`.env` 파일 수정:
```bash
APP_PORT=8755
```

### 포트 4578이 이미 사용 중인 경우

#### 1. 사용 중인 프로세스 확인
```bash
lsof -i :4578
```

#### 2. 프로세스 종료
```bash
kill -9 <PID>
```

#### 3. 또는 다른 포트 사용
`.env` 파일 수정:
```bash
DB_PORT=4579
DATABASE_URL="postgresql://mook:password@localhost:4579/DAlbumDB?schema=public"
```

`docker-compose.yml` 수정:
```yaml
postgres:
  ports:
    - "4579:5432"
```

---

## 방화벽 설정

### Synology NAS

**제어판 > 보안 > 방화벽**:

1. **포트 8754 허용** (웹 애플리케이션)
   - 프로토콜: TCP
   - 포트: 8754
   - 소스 IP: 허용할 IP 또는 모두

2. **포트 4578 차단** (데이터베이스)
   - 외부 접속 차단 (보안)
   - 내부 Docker 네트워크만 허용

### macOS (로컬 개발)

일반적으로 방화벽 설정 불필요 (localhost)

---

## 포트 테스트

### 웹 애플리케이션 (8754)
```bash
# 서버 실행 확인
curl http://localhost:8754/api/viewer/images

# 또는 브라우저에서
open http://localhost:8754/
```

### 데이터베이스 (4578)
```bash
# PostgreSQL 연결 확인
psql -h localhost -p 4578 -U mook -d DAlbumDB

# 또는 Prisma Studio
npx prisma studio
```

---

## 포트 변경 체크리스트

포트를 변경해야 하는 경우, 다음 파일들을 모두 수정해야 합니다:

### 애플리케이션 포트 (8754) 변경 시
- [ ] `.env` - `APP_PORT`
- [ ] `.env.local` - `PORT`
- [ ] `docker-compose.yml` - `app.ports`
- [ ] `docker-compose.yml` - `app.environment.PORT`
- [ ] `Dockerfile` - `EXPOSE`
- [ ] `Dockerfile` - `HEALTHCHECK` URL
- [ ] `server.js` - 기본 포트 (fallback)

### 데이터베이스 포트 (4578) 변경 시
- [ ] `.env` - `DB_PORT`
- [ ] `.env` - `DATABASE_URL`
- [ ] `.env.local` - `DATABASE_URL`
- [ ] `docker-compose.yml` - `postgres.ports`
- [ ] `docker-compose.dev.yml` - `postgres.ports`

---

## 자주 묻는 질문

### Q1: 왜 포트 8754와 4578을 사용하나요?
A: 사용자가 지정한 포트입니다. 일반적인 포트 충돌을 피하기 위한 선택입니다.

### Q2: 포트 5432는 무엇인가요?
A: PostgreSQL의 기본 내부 포트입니다. Docker 컨테이너 간 통신에 사용되며, 외부에서는 4578로 매핑됩니다.

### Q3: iPad에서 접속할 때 포트를 입력해야 하나요?
A: 네, `http://[SERVER_IP]:8754/` 형식으로 포트를 포함해야 합니다.

### Q4: HTTPS를 사용할 수 있나요?
A: 가능합니다. Synology NAS의 Reverse Proxy를 사용하면 HTTPS(443)로 접속하고 내부적으로 8754로 포워딩할 수 있습니다.

### Q5: 포트를 80으로 변경할 수 있나요?
A: 가능하지만 권장하지 않습니다. 포트 80은 관리자 권한이 필요하며, 다른 웹 서비스와 충돌할 수 있습니다.

---

## 참고 문서

- [SYNOLOGY_DEPLOYMENT.md](./SYNOLOGY_DEPLOYMENT.md) - Synology NAS 배포
- [QUICK_START.md](./QUICK_START.md) - 빠른 시작
- [database-setup.md](./database-setup.md) - 데이터베이스 설정

---

**포트 설정이 완료되었습니다!** 🔌✨



