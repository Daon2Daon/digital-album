# 🚀 Synology NAS 배포 가이드

## 개요

이 가이드는 Synology NAS에서 Docker를 사용하여 디지털 액자 프로젝트를 배포하는 방법을 설명합니다.

---

## 📋 사전 요구사항

### Synology NAS
- DSM 7.0 이상
- Docker 패키지 설치
- 최소 2GB RAM 권장
- 충분한 저장 공간 (이미지용)

### 네트워크
- 고정 IP 또는 DHCP 예약
- 포트 3000 (앱) 및 5432 (DB) 사용 가능

---

## 🔧 1단계: Docker 설치 (Synology)

### 패키지 센터에서 설치

1. **패키지 센터** 열기
2. **Docker** 검색
3. **설치** 클릭
4. 설치 완료 대기

### Docker 확인

1. **Docker** 앱 열기
2. 정상 실행 확인

---

## 📦 2단계: 프로젝트 파일 업로드

### File Station 사용

1. **File Station** 열기
2. **docker** 폴더 생성 (없으면)
3. **digital-album** 폴더 생성
4. 다음 파일들 업로드:
   ```
   digital-album/
   ├── server.js
   ├── package.json
   ├── Dockerfile
   ├── docker-compose.yml
   ├── .env
   ├── prisma/
   └── public/
   ```

### 권장 경로
```
/volume1/docker/digital-album/
```

---

## 🔐 3단계: 환경 변수 설정

### .env 파일 생성

File Station에서 `.env` 파일 생성 (`.env.example` 참고):

```bash
# Database
DB_USER=mook
DB_PASSWORD=your_secure_password_here
DB_NAME=DAlbumDB
DB_PORT=5432

# Application
APP_PORT=3000
NODE_ENV=production

# Prisma
DATABASE_URL="postgresql://mook:your_secure_password_here@postgres:4578/DAlbumDB?schema=public"
```

**중요**: `DB_PASSWORD`를 안전한 비밀번호로 변경하세요!

---

## 🐳 4단계: Docker Compose 배포

### 방법 1: SSH 사용 (권장)

1. **SSH 활성화**:
   ```
   제어판 > 터미널 및 SNMP > SSH 서비스 활성화
   ```

2. **SSH 접속**:
   ```bash
   ssh admin@[NAS_IP]
   ```

3. **프로젝트 폴더로 이동**:
   ```bash
   cd /volume1/docker/digital-album
   ```

4. **Docker Compose 실행**:
   ```bash
   sudo docker-compose up -d
   ```

5. **상태 확인**:
   ```bash
   sudo docker-compose ps
   sudo docker-compose logs -f
   ```

### 방법 2: Docker 앱 사용

1. **Docker** 앱 열기
2. **프로젝트** 탭
3. **생성** 클릭
4. **docker-compose.yml** 파일 선택
5. **프로젝트 이름**: `digital-album`
6. **실행** 클릭

📦 업로드해야 할 파일/폴더
다음 파일과 폴더들을 NAS의 /volume1/docker/digital-album/ 경로에 업로드하세요:
✅ 필수 파일
digital-album/├── server.js                 # 메인 서버 파일├── package.json             # npm 의존성 정의├── Dockerfile               # Docker 이미지 빌드 설정├── docker-compose.yml       # 서비스 구성 (프로덕션용)├── .env                     # 환경 변수 (직접 생성 필요)├── prisma/                  # 데이터베이스 관련│   ├── schema.prisma       # DB 스키마│   ├── seed.ts             # 초기 데이터│   ├── fix-display-order.ts│   └── migrations/         # 마이그레이션 파일들└── public/                  # 정적 파일    ├── admin.html    ├── viewer.html    ├── manifest.json    └── icon-generator.html
추가 파일 (선택)
├── prisma.config.ts         # Prisma 설정└── README.md               # 프로젝트 설명
❌ 업로드하지 말아야 할 것들
❌ node_modules/ - Docker 컨테이너 내에서 자동으로 설치됨
❌ local-db-data/ - 로컬 개발용 데이터베이스 데이터
❌ docs/ - 문서 폴더 (배포에 불필요)
❌ .git/ - Git 버전 관리 (배포에 불필요)
❌ docker-compose.dev.yml - 개발용 설정 (프로덕션에는 불필요)
❌ package-lock.json - 컨테이너 내에서 새로 생성됨
❌ public/uploads/ 의 기존 이미지들 - 새로 업로드할 예정이므로
🔐 중요: .env 파일
.env 파일은 직접 생성해야 합니다:
# DatabaseDB_USER=mookDB_PASSWORD=your_secure_password_here  # 반드시 변경!DB_NAME=DAlbumDBDB_PORT=5432# ApplicationAPP_PORT=3000NODE_ENV=production# PrismaDATABASE_URL="postgresql://mook:your_secure_password_here@postgres:5432/DAlbumDB?schema=public"
📝 요약
최소 필수 파일만으로 구성하면:
server.js
package.json
Dockerfile
docker-compose.yml
.env (직접 생성)
prisma/ 폴더 전체
public/ 폴더 (uploads 제외)
이 파일들만 있으면 Synology NAS에서 Docker Compose를 통해 정상적으로 배포하실 수 있습니다! 🚀

---

## 🌐 5단계: 접속 확인

### 웹 브라우저에서 확인

```
http://[NAS_IP]:8754/
```

### 관리자 페이지

```
http://[NAS_IP]:8754/admin
```

### API 확인

```bash
curl http://[NAS_IP]:8754/api/viewer/images
```

---

## 📱 6단계: iPad 설정

### 1. Safari로 접속
```
http://[NAS_IP]:8754/
```

### 2. 홈 화면에 추가
1. 공유 버튼(↗️) 탭
2. "홈 화면에 추가" 선택
3. "추가" 탭

### 3. 실행
- 홈 화면 아이콘 탭
- 완전 전체 화면으로 실행!

---

## 🔧 관리 명령어

### 컨테이너 관리

```bash
# 시작
sudo docker-compose up -d

# 중지
sudo docker-compose down

# 재시작
sudo docker-compose restart

# 로그 확인
sudo docker-compose logs -f

# 로그 확인 (특정 서비스)
sudo docker-compose logs -f app
sudo docker-compose logs -f postgres
```

### 데이터베이스 관리

```bash
# 마이그레이션
sudo docker-compose exec app npx prisma migrate deploy

# Prisma Studio (DB GUI)
sudo docker-compose exec app npx prisma studio

# 데이터베이스 백업
sudo docker-compose exec postgres pg_dump -U mook DAlbumDB > backup.sql

# 데이터베이스 복원
sudo docker-compose exec -T postgres psql -U mook DAlbumDB < backup.sql
```

### 이미지 관리

```bash
# 업로드된 이미지 확인
sudo docker-compose exec app ls -lh /app/public/uploads

# 이미지 용량 확인
sudo docker-compose exec app du -sh /app/public/uploads
```

---

## 📊 모니터링

### Docker 앱에서 확인

1. **Docker** 앱 열기
2. **컨테이너** 탭
3. `digital-album-app` 및 `digital-album-db` 상태 확인
4. CPU, 메모리 사용량 확인

### 로그 모니터링

```bash
# 실시간 로그
sudo docker-compose logs -f

# 최근 로그 100줄
sudo docker-compose logs --tail=100

# 특정 시간 이후 로그
sudo docker-compose logs --since 30m
```

---

## 🔄 업데이트

### 애플리케이션 업데이트

1. **새 파일 업로드**:
   ```bash
   # File Station으로 업데이트된 파일 업로드
   ```

2. **재빌드 및 재시작**:
   ```bash
   cd /volume1/docker/digital-album
   sudo docker-compose down
   sudo docker-compose build --no-cache
   sudo docker-compose up -d
   ```

### 데이터 유지

Named volumes를 사용하므로 업데이트 시에도 다음 데이터가 유지됩니다:
- ✅ 데이터베이스 (postgres_data)
- ✅ 업로드된 이미지 (uploads_data)

---

## 🔒 보안 설정

### 1. 방화벽 설정

**제어판 > 보안 > 방화벽**:
- 포트 3000 허용 (필요한 IP만)
- 포트 5432는 외부 차단 (내부 통신만)

### 2. SSL/TLS (선택)

Reverse Proxy 사용 (DSM 내장):

1. **제어판 > 응용 프로그램 포털 > 역방향 프록시**
2. **생성** 클릭
3. **설정**:
   - 소스: https://your-domain.com (포트 443)
   - 대상: http://localhost:8754
4. SSL 인증서 설정

### 3. 자동 백업

**Hyper Backup** 사용:
- 백업 대상: `/volume1/docker/digital-album`
- 주기: 매일 또는 매주
- 보관 버전: 최소 7개

---

## 🐛 문제 해결

### 컨테이너가 시작 안 됨

```bash
# 로그 확인
sudo docker-compose logs

# 컨테이너 상태
sudo docker-compose ps

# 재시작
sudo docker-compose restart
```

### 데이터베이스 연결 실패

```bash
# PostgreSQL 컨테이너 확인
sudo docker-compose exec postgres pg_isready -U mook

# DATABASE_URL 확인
sudo docker-compose exec app env | grep DATABASE_URL
```

### 이미지 업로드 실패

```bash
# 권한 확인
sudo docker-compose exec app ls -la /app/public/uploads

# 디스크 공간 확인
df -h
```

### 포트 충돌

다른 서비스가 포트 3000을 사용 중이면:

1. `.env` 파일 수정:
   ```
   APP_PORT=3001
   ```

2. Docker Compose 재시작:
   ```bash
   sudo docker-compose down
   sudo docker-compose up -d
   ```

---

## 📈 성능 최적화

### 메모리 제한 설정

`docker-compose.yml`에 추가:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### 자동 재시작 설정

이미 적용됨:
```yaml
restart: unless-stopped
```

---

## 🔄 자동 시작

### DSM 부팅 시 자동 시작

Docker 컨테이너는 `restart: unless-stopped` 설정으로 자동 시작됩니다.

### 작업 스케줄러 (선택)

**제어판 > 작업 스케줄러**:

1. **생성 > 예약된 작업 > 사용자 정의 스크립트**
2. **일반**:
   - 작업 이름: Digital Album Startup
   - 사용자: root
3. **스케줄**:
   - 부팅 시
4. **작업 설정**:
   ```bash
   cd /volume1/docker/digital-album
   docker-compose up -d
   ```

---

## 📊 용량 관리

### 디스크 사용량 확인

```bash
# Docker 볼륨 확인
sudo docker volume ls

# 볼륨 크기 확인
sudo docker system df -v

# 이미지 정리 (사용하지 않는)
sudo docker image prune -a

# 전체 정리
sudo docker system prune -a --volumes
```

### 권장 용량

| 항목 | 최소 | 권장 |
|------|------|------|
| 시스템 | 2GB | 4GB |
| 이미지 (20개) | 10MB | 50MB |
| 데이터베이스 | 100MB | 500MB |
| 전체 | 2.2GB | 5GB |

---

## 🎯 체크리스트

### 배포 전
- [ ] Docker 설치 완료
- [ ] 프로젝트 파일 업로드
- [ ] .env 파일 설정
- [ ] 포트 확인 (3000, 5432)

### 배포 후
- [ ] 컨테이너 정상 실행
- [ ] 웹 접속 확인
- [ ] API 응답 확인
- [ ] 이미지 업로드 테스트
- [ ] iPad 전체 화면 테스트

### 운영 중
- [ ] 정기 백업 설정
- [ ] 로그 모니터링
- [ ] 디스크 용량 확인
- [ ] 보안 업데이트

---

## 📞 문의

배포 관련 문제는 GitHub Issues로 남겨주세요.

---

**Synology NAS에서 완벽한 디지털 액자를 즐기세요!** 🖼️✨





