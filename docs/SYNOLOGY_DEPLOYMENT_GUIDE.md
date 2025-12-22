# 🏠 Synology NAS 배포 가이드

이 문서는 Synology NAS의 Container Manager 앱을 통해 Digital Album을 배포하는 방법을 상세히 설명합니다.

---

## 📋 사전 요구사항

### Synology NAS
- **DSM 버전:** 7.0 이상
- **RAM:** 최소 2GB (권장 4GB)
- **저장 공간:** 최소 3GB 여유 공간
- **패키지:** Container Manager 설치 필요

### 네트워크
- **고정 IP 또는 DHCP 예약:** 안정적인 접속을 위해 권장
- **포트:** 8754 (웹 애플리케이션)
- **방화벽:** 필요한 포트 개방

### 로컬 PC
- SSH 클라이언트 (권장: macOS 터미널, Windows Terminal, PuTTY)
- 파일 전송: File Station 또는 SFTP 클라이언트

---

## 🔧 1단계: Container Manager 설치

### 1.1 패키지 센터에서 설치

1. DSM에 로그인
2. **패키지 센터** 열기
3. 검색창에 "**Container Manager**" 입력
4. **설치** 버튼 클릭
5. 설치 완료 대기 (약 1-2분)

### 1.2 Container Manager 실행 확인

1. **메인 메뉴**에서 **Container Manager** 앱 실행
2. 정상 실행 확인

---

## 📦 2단계: 프로젝트 파일 업로드

### 2.1 NAS에 폴더 생성

**File Station 사용:**

1. **File Station** 앱 열기
2. `/docker` 폴더로 이동 (없으면 생성)
3. `digital-album` 폴더 생성

**권장 경로:**
```
/volume1/docker/digital-album/
```

### 2.2 필수 파일 업로드

다음 파일들을 `/volume1/docker/digital-album/` 경로에 업로드하세요:

#### ✅ 필수 파일 및 폴더
```
digital-album/
├── server.js                    # 메인 서버 파일
├── package.json                 # npm 의존성
├── package-lock.json            # npm lock 파일 (npm ci 필수)
├── Dockerfile                   # Docker 이미지 빌드 설정
├── docker-compose.yml           # 프로덕션 배포 설정
├── entrypoint.sh                # 컨테이너 시작 스크립트 (필수!)
├── prisma/                      # 전체 폴더
│   ├── schema.prisma
│   ├── seed.ts
│   ├── fix-display-order.ts
│   └── migrations/              # 전체 폴더
└── public/                      # 전체 폴더
    ├── admin.html
    ├── viewer.html
    ├── manifest.json
    ├── icon-generator.html
    └── uploads/                 # 빈 폴더 (이미지는 제외)
```

#### ❌ 업로드하지 말 것
- `node_modules/` - 컨테이너 내에서 자동 설치
- `local-db-data/` - 로컬 개발용
- `docs/` - 문서 폴더
- `.git/` - Git 버전 관리
- `docker-compose.dev.yml` - 개발용 설정
- `public/uploads/` 내 기존 이미지 - 새로 업로드할 예정

**업로드 방법:**
- File Station에서 드래그 앤 드롭
- 또는 SFTP 클라이언트 사용 (FileZilla, Cyberduck 등)

#### ⚠️ 중요: 배포 전 필수 파일 체크리스트

빌드 에러를 방지하기 위해 다음 파일들이 **반드시** 포함되어 있는지 확인하세요:

```bash
# SSH로 NAS에 접속 후 확인
cd /volume1/docker/digital-album
ls -la
```

**필수 파일 확인:**
- ✅ `entrypoint.sh` - **반드시 필요!** (빌드 에러의 주요 원인)
- ✅ `package-lock.json` - **반드시 필요!** (npm ci 필수)
- ✅ `server.js`
- ✅ `package.json`
- ✅ `Dockerfile`
- ✅ `docker-compose.yml`
- ✅ `prisma/` 폴더 전체
- ✅ `public/` 폴더 전체

**파일이 누락된 경우:**
로컬에서 누락된 파일을 다시 업로드하세요:
```bash
# 로컬에서 (macOS/Linux)
scp entrypoint.sh package-lock.json mook@[NAS_IP]:/volume1/docker/digital-album/
```

---

## 🔐 3단계: 환경 변수 설정

### 3.1 .env 파일 생성

File Station에서 `/volume1/docker/digital-album/` 경로에 `.env` 파일을 생성합니다.

**File Station에서:**
1. `digital-album` 폴더 선택
2. **만들기** → **텍스트 파일**
3. 파일 이름: `.env`
4. 다음 내용 입력:

```bash
# Application
APP_PORT=8754
NODE_ENV=production

# Prisma (SQLite)
DATABASE_URL="file:/app/prisma/database.db"
```

> **참고:** SQLite는 파일 기반 데이터베이스로 별도의 사용자명/비밀번호가 필요하지 않습니다.

### 3.2 환경 변수 설명

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `APP_PORT` | 8754 | 웹 애플리케이션 포트 |
| `NODE_ENV` | production | Node.js 환경 |
| `DATABASE_URL` | (자동 구성) | Prisma SQLite 연결 문자열 |

---

## 🐳 4단계: Container Manager로 배포

Synology NAS에서는 **두 가지 방법**으로 배포할 수 있습니다.

### 방법 A: SSH를 통한 배포 (권장 ⭐️)

SSH를 사용하면 더 많은 제어와 로그 확인이 가능합니다.

#### 4.1 SSH 활성화

1. **제어판** → **터미널 및 SNMP**
2. **SSH 서비스 활성화** 체크
3. 포트: 22 (기본값)
4. **적용**

#### 4.2 SSH 접속

**macOS/Linux:**
```bash
ssh admin@[NAS_IP]
# 예: ssh admin@192.168.1.100
```

**Windows:**
```powershell
# PowerShell 또는 Windows Terminal
ssh admin@[NAS_IP]
```

비밀번호 입력 후 접속 성공

#### 4.3 프로젝트 폴더로 이동

```bash
cd /volume1/docker/digital-album

# 파일 확인
ls -la
```

**출력 예시:**
```
drwxr-xr-x  4 admin  users   4096 Dec 12 10:00 .
drwxr-xr-x  3 admin  users   4096 Dec 12 09:00 ..
-rw-r--r--  1 admin  users    256 Dec 12 10:00 .env
-rw-r--r--  1 admin  users   1234 Dec 12 10:00 Dockerfile
-rw-r--r--  1 admin  users   2048 Dec 12 10:00 docker-compose.yml
...
```

#### 4.4 기존 컨테이너 정리 (필요한 경우)

**기존 컨테이너가 있는 경우 충돌이 발생할 수 있습니다.** 다음 명령어로 정리하세요:

```bash
# 기존 컨테이너 확인
sudo docker ps -a | grep digital-album

# 기존 컨테이너 중지 및 삭제
sudo docker stop digital-album-app 2>/dev/null || true
sudo docker rm digital-album-app 2>/dev/null || true

# 또는 docker-compose로 정리 (프로젝트 폴더에서)
cd /volume1/docker/digital-album
sudo docker-compose down
```

**컨테이너 이름 충돌 에러가 발생한 경우:**
```
Error: Conflict. The container name "/digital-album-app" is already in use
```

**해결:**
```bash
# 기존 컨테이너 강제 삭제
sudo docker rm -f digital-album-app

# 그 후 다시 빌드
sudo docker-compose up -d --build
```

#### 4.5 Docker Compose 실행

```bash
# 백그라운드에서 빌드 및 실행
sudo docker-compose up -d --build
```

**빌드 과정 (약 5-10분 소요):**
1. ✓ Node.js 베이스 이미지 다운로드
2. ✓ npm 의존성 설치 (`npm ci --omit=dev`)
3. ✓ Prisma Client 생성
4. ✓ 애플리케이션 이미지 빌드
5. ✓ 컨테이너 시작 및 entrypoint.sh 실행
6. ✓ Prisma 마이그레이션 자동 적용

#### 4.6 상태 확인

```bash
# 컨테이너 목록
sudo docker-compose ps
```

**정상 출력:**
```
NAME                   SERVICE    STATUS    PORTS
digital-album-app      app        Up        0.0.0.0:8754->8754/tcp
digital-album-db       postgres   Up        0.0.0.0:4578->5432/tcp
```

#### 4.7 로그 확인

```bash
# 실시간 로그 (Ctrl+C로 종료)
sudo docker-compose logs -f

# 또는 최근 50줄만
sudo docker-compose logs --tail=50
```

**정상 로그 예시:**
```
digital-album-app  | ========================================
digital-album-app  | Digital Album Server (Vanilla JS)
digital-album-app  | ========================================
digital-album-app  | Server: http://0.0.0.0:8754
digital-album-app  | ========================================
```

---

### 방법 B: Container Manager GUI 사용

GUI를 선호하는 경우 이 방법을 사용하세요.

#### 4.1 Container Manager 열기

1. DSM 메인 메뉴에서 **Container Manager** 실행
2. 좌측 메뉴에서 **프로젝트** 선택

#### 4.2 프로젝트 생성

1. **생성** 버튼 클릭
2. **프로젝트 이름:** `digital-album`
3. **경로:** `/docker/digital-album` 선택
4. **소스:** `docker-compose.yml 파일 사용` 선택
5. **파일 선택:** `docker-compose.yml` 선택
6. **설정 확인** 화면에서 내용 검토
7. **완료** 클릭

#### 4.3 프로젝트 시작

1. 프로젝트 목록에서 `digital-album` 선택
2. **작업** → **빌드** (처음 한 번만)
3. 빌드 완료 후 **작업** → **시작**

#### 4.4 상태 확인

1. **컨테이너** 탭으로 이동
2. `digital-album-app`와 `digital-album-db` 상태 확인
3. 두 컨테이너 모두 **실행 중** 상태여야 함

#### 4.5 로그 확인

1. 컨테이너 선택
2. **세부 정보** 버튼 클릭
3. **로그** 탭 선택

---

## 🌐 5단계: 접속 확인

### 5.1 웹 브라우저에서 확인

**뷰어 페이지:**
```
http://[NAS_IP]:8754/
```

**관리자 페이지:**
```
http://[NAS_IP]:8754/admin
```

예시: NAS IP가 192.168.1.100인 경우
- 뷰어: http://192.168.1.100:8754/
- 관리자: http://192.168.1.100:8754/admin

### 5.2 API 테스트

**로컬 PC에서:**
```bash
curl http://[NAS_IP]:8754/api/viewer/images
```

**정상 응답:**
```json
{
  "success": true,
  "images": [],
  "settings": {
    "slideDuration": 10000,
    "transitionEffect": "fade",
    "transitionSpeed": 1.0,
    "displayMode": "cover"
  }
}
```

---

## 📱 6단계: iPad 설정

### 6.1 Safari로 접속

iPad에서:
```
http://[NAS_IP]:8754/
```

### 6.2 홈 화면에 추가

1. Safari 하단 **공유 버튼 (↗️)** 탭
2. "**홈 화면에 추가**" 선택
3. 이름 확인: "디지털 액자"
4. "**추가**" 탭

### 6.3 전체 화면으로 실행

1. 홈 화면에서 "디지털 액자" 아이콘 탭
2. 완전 전체 화면으로 실행!
3. 주소창, 탭바, 툴바 모두 숨겨짐

---

## 🔒 7단계: 보안 설정 (권장)

### 7.1 방화벽 설정

**제어판 → 보안 → 방화벽:**

1. **규칙 편집**
2. **생성** 클릭
3. **포트 8754 허용:**
   - 프로토콜: TCP
   - 포트: 8754
   - 소스 IP: 특정 IP 또는 서브넷 (권장)
   - 동작: 허용

4. **포트 4578 차단:**
   - 프로토콜: TCP
   - 포트: 4578
   - 소스 IP: 모두
   - 동작: 거부

> **보안 팁:** PostgreSQL 포트(4578)는 외부에서 접근할 필요가 없으므로 차단하세요.

### 7.2 Reverse Proxy 설정 (선택)

HTTPS 접속을 원하는 경우:

**제어판 → 응용 프로그램 포털 → 역방향 프록시:**

1. **생성** 클릭
2. 설정:
   - **소스:**
     - 프로토콜: HTTPS
     - 호스트 이름: your-domain.com
     - 포트: 443
   - **대상:**
     - 프로토콜: HTTP
     - 호스트 이름: localhost
     - 포트: 8754
3. SSL 인증서 선택
4. **저장**

이제 `https://your-domain.com`으로 접속 가능!

### 7.3 자동 백업 설정

**Hyper Backup 패키지 사용:**

1. **패키지 센터**에서 **Hyper Backup** 설치
2. **Hyper Backup** 실행
3. 백업 작업 생성:
   - 데이터 백업 작업
   - 백업 대상: `/volume1/docker/digital-album`
   - 일정: 매일 또는 매주
   - 보관 버전: 최소 7개

---

## 🔧 관리 및 유지보수

### 컨테이너 관리 명령어

**SSH 접속 후:**

```bash
cd /volume1/docker/digital-album

# 컨테이너 시작
sudo docker-compose up -d

# 컨테이너 중지
sudo docker-compose down

# 컨테이너 재시작
sudo docker-compose restart

# 특정 서비스만 재시작
sudo docker-compose restart app

# 로그 확인 (실시간)
sudo docker-compose logs -f

# 로그 확인 (최근 100줄)
sudo docker-compose logs --tail=100

# 컨테이너 상태 확인
sudo docker-compose ps
```

### 데이터베이스 관리

```bash
# Prisma 마이그레이션 적용
sudo docker-compose exec app npx prisma migrate deploy

# Prisma Studio 실행 (DB GUI)
sudo docker-compose exec app npx prisma studio
# 브라우저에서 http://[NAS_IP]:5555 접속

# 데이터베이스 백업
sudo docker-compose exec postgres pg_dump -U mook DAlbumDB > backup_$(date +%Y%m%d).sql

# 데이터베이스 복원
sudo docker-compose exec -T postgres psql -U mook DAlbumDB < backup_20241212.sql
```

### 이미지 관리

```bash
# 업로드된 이미지 확인
sudo docker-compose exec app ls -lh /app/public/uploads

# 이미지 용량 확인
sudo docker-compose exec app du -sh /app/public/uploads

# 특정 이미지 삭제 (백업 후!)
sudo docker-compose exec app rm /app/public/uploads/[filename].jpg
```

### 애플리케이션 업데이트

```bash
cd /volume1/docker/digital-album

# 1. 새 파일 업로드 (File Station 사용)

# 2. 컨테이너 중지
sudo docker-compose down

# 3. 재빌드 (캐시 무시)
sudo docker-compose build --no-cache

# 4. 재시작
sudo docker-compose up -d

# 5. 로그 확인
sudo docker-compose logs -f
```

> **참고:** Named volumes를 사용하므로 업데이트 시에도 데이터베이스와 이미지는 유지됩니다.

---

## 📊 모니터링

### Container Manager에서 모니터링

1. **Container Manager** 앱 열기
2. **컨테이너** 탭
3. 각 컨테이너 선택 → **세부 정보**
4. **리소스** 탭에서 CPU, 메모리 사용량 확인

**정상 범위:**
- `digital-album-app`: CPU 0-5%, 메모리 50-100MB
- `digital-album-db`: CPU 0-2%, 메모리 30-50MB

### SSH에서 모니터링

```bash
# 실시간 리소스 모니터링
sudo docker stats

# 특정 컨테이너만
sudo docker stats digital-album-app
```

### 디스크 사용량 확인

```bash
# Docker 전체 디스크 사용량
sudo docker system df

# 볼륨 목록
sudo docker volume ls

# 특정 볼륨 크기
sudo du -sh /var/lib/docker/volumes/digital-album_postgres_data
sudo du -sh /var/lib/docker/volumes/digital-album_uploads_data
```

---

## 🐛 문제 해결

### 문제 1: 컨테이너가 시작되지 않음

**확인:**
```bash
sudo docker-compose ps
sudo docker-compose logs
```

**해결:**
```bash
# 1. 컨테이너 재시작
sudo docker-compose restart

# 2. 전체 재빌드
sudo docker-compose down
sudo docker-compose up -d --build

# 3. 로그에서 에러 확인
sudo docker-compose logs --tail=100
```

### 문제 2: 데이터베이스 연결 실패

**증상:** 앱 로그에 "Can't reach database server" 에러

**확인:**
```bash
# PostgreSQL 상태
sudo docker-compose exec postgres pg_isready -U mook

# DATABASE_URL 확인
sudo docker-compose exec app env | grep DATABASE_URL
```

**해결:**
```bash
# PostgreSQL 재시작
sudo docker-compose restart postgres

# 또는 전체 재시작
sudo docker-compose restart
```

### 문제 3: 웹 페이지 접속 안 됨

**확인 사항:**
1. 컨테이너 실행 중인지 확인
2. 방화벽 포트 8754 허용 확인
3. NAS IP 주소 정확한지 확인

**해결:**
```bash
# 1. 컨테이너 상태 확인
sudo docker-compose ps

# 2. 앱 로그 확인
sudo docker-compose logs app

# 3. 포트 리스닝 확인
sudo netstat -tlnp | grep 8754

# 4. 방화벽 규칙 확인 (DSM 제어판)
```

### 문제 4: 이미지 업로드 실패

**증상:** 관리자 페이지에서 업로드 에러

**확인:**
```bash
# uploads 폴더 권한 확인
sudo docker-compose exec app ls -la /app/public/uploads

# 디스크 공간 확인
df -h
```

**해결:**
```bash
# uploads 폴더 권한 수정
sudo docker-compose exec app chown -R node:node /app/public/uploads

# 컨테이너 재시작
sudo docker-compose restart app
```

### 문제 5: 컨테이너 이름 충돌

**증상:** "The container name '/digital-album-app' is already in use" 에러

**원인:** 기존에 실행 중이거나 중지된 컨테이너가 남아있음

**해결:**
```bash
# 기존 컨테이너 확인
sudo docker ps -a | grep digital-album-app

# 기존 컨테이너 강제 삭제
sudo docker rm -f digital-album-app

# 또는 docker-compose로 정리
cd /volume1/docker/digital-album
sudo docker-compose down

# 재시도
sudo docker-compose up -d --build
```

### 문제 6: 포트 충돌

**증상:** "address already in use" 에러

**확인:**
```bash
# 포트 8754 사용 중인 프로세스 확인
sudo netstat -tlnp | grep 8754
```

**해결:**
```bash
# 다른 포트로 변경
# .env 파일 수정
APP_PORT=8755

# docker-compose.yml도 수정 필요
# ports:
#   - "8755:8755"

# 재시작
sudo docker-compose down
sudo docker-compose up -d
```

---

## 🔄 자동 시작 설정

### DSM 부팅 시 자동 시작

**docker-compose.yml에 이미 설정됨:**
```yaml
restart: unless-stopped
```

이 설정으로 NAS 재부팅 시 자동으로 컨테이너가 시작됩니다.

### 작업 스케줄러로 추가 보장 (선택)

**제어판 → 작업 스케줄러:**

1. **생성** → **예약된 작업** → **사용자 정의 스크립트**
2. 일반 설정:
   - 작업 이름: `Digital Album Startup`
   - 사용자: `root`
3. 스케줄:
   - **부팅 시** 선택
4. 작업 설정:
```bash
cd /volume1/docker/digital-album
docker-compose up -d
```
5. **확인** 클릭

---

## 📈 용량 관리

### 권장 용량

| 항목 | 최소 | 권장 |
|------|------|------|
| 시스템 (Docker 이미지) | 500MB | 1GB |
| 데이터베이스 | 100MB | 500MB |
| 이미지 (20개 기준) | 10MB | 50MB |
| 전체 | 610MB | 1.5GB |

### 정리 명령어

```bash
# 사용하지 않는 Docker 이미지 삭제
sudo docker image prune -a

# 사용하지 않는 볼륨 삭제
sudo docker volume prune

# 전체 정리 (주의!)
sudo docker system prune -a --volumes
```

---

## 🎯 배포 체크리스트

### 배포 전
- [ ] Container Manager 설치 완료
- [ ] 프로젝트 파일 업로드 완료
- [ ] `.env` 파일 생성 및 비밀번호 변경
- [ ] SSH 활성화 (SSH 방법 사용 시)

### 배포 중
- [ ] Docker Compose 빌드 완료
- [ ] 컨테이너 정상 실행 확인
- [ ] 로그에 에러 없음

### 배포 후
- [ ] 웹 브라우저 접속 성공
- [ ] API 응답 정상
- [ ] 관리자 페이지에서 이미지 업로드 테스트
- [ ] iPad에서 뷰어 접속 확인
- [ ] 슬라이드쇼 동작 확인
- [ ] 방화벽 설정 완료
- [ ] 백업 설정 완료

---

## 📧 문의 및 지원

배포 관련 문제는 GitHub Issues에 다음 정보와 함께 문의해주세요:

- DSM 버전
- Container Manager 버전
- 에러 메시지 전체
- `docker-compose logs` 출력
- 네트워크 환경 (로컬/외부 접속)

---

## 📚 관련 문서

- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - 프로젝트 구조 및 개요
- **[LOCAL_DOCKER_GUIDE.md](./LOCAL_DOCKER_GUIDE.md)** - 로컬 Docker 테스트
- **[루트 README.md](../README.md)** - 프로젝트 소개

---

**Synology NAS에서 완벽한 디지털 액자를 즐기세요!** 🖼️✨

