# 🏠 Synology NAS 배포 가이드 (Portainer + Watchtower)

이 문서는 Synology NAS에서 **Portainer**와 **Watchtower**를 활용하여 Digital Album을 배포하고 자동 업데이트하는 방법을 설명합니다.

---

## 📋 사전 요구사항

### Synology NAS
- **DSM 버전:** 7.0 이상
- **RAM:** 최소 2GB (권장 4GB)
- **저장 공간:** 최소 3GB 여유 공간

### 필수 설치
- **Portainer** - 컨테이너 관리 플랫폼
- **Watchtower** - 자동 업데이트 도구

### 네트워크
- **고정 IP 또는 DHCP 예약** 권장
- **포트:** 원하는 포트 (예: 20005)
- **방화벽:** 필요한 포트 개방

---

## 🎯 배포 개요

### 자동화된 CI/CD 워크플로우

```
로컬 개발 (macOS)
    ↓ git push
GitHub Repository
    ↓ GitHub Actions
GitHub Container Registry (GHCR)
    ↓ Watchtower 감지
Portainer Stack
    ↓ 자동 재배포
Synology NAS 실행 ✅
```

**장점:**
- ✅ GitHub에 푸시하면 자동으로 이미지 빌드
- ✅ Watchtower가 새 이미지를 자동 감지
- ✅ 무중단으로 자동 업데이트
- ✅ SSH 접속 불필요
- ✅ GUI에서 모든 관리 가능

---

## 🔧 1단계: Portainer 설치

### 1.1 Portainer 컨테이너 실행

**방법 1: SSH를 통한 설치 (권장)**

```bash
# SSH로 NAS 접속
ssh admin@[NAS_IP]

# Portainer 설치
sudo docker run -d \
  --name=portainer \
  --restart=always \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

**방법 2: DSM Container Manager를 통한 설치**

1. **Container Manager** 앱 열기
2. **컨테이너** → **생성**
3. 다음 설정 입력:
   - 이미지: `portainer/portainer-ce:latest`
   - 컨테이너 이름: `portainer`
   - 포트: `9000:9000`
   - 볼륨:
     - `/var/run/docker.sock` → `/var/run/docker.sock`
     - 새 볼륨 생성 → `/data`
   - 재시작 정책: `always`

### 1.2 Portainer 접속

브라우저에서:
```
http://[NAS_IP]:9000
```

**최초 설정:**
1. 관리자 계정 생성
2. "Get Started" 클릭
3. "Local" 환경 선택

---

## 🔄 2단계: Watchtower 설치

Watchtower는 컨테이너의 이미지 업데이트를 자동으로 감지하고 재배포합니다.

### 2.1 Portainer에서 Watchtower 생성

**Portainer UI:**
1. **Containers** → **Add Container**
2. 다음 설정 입력:

**기본 설정:**
- Name: `watchtower`
- Image: `containrrr/watchtower:latest`

**Network:**
- Network: `bridge`

**Volumes:**
- `/var/run/docker.sock` → `/var/run/docker.sock`

**Restart Policy:**
- Always

**Command & logging:**
- Command: `--interval 300 --cleanup --label-enable`
  - `--interval 300`: 5분마다 체크
  - `--cleanup`: 오래된 이미지 자동 삭제
  - `--label-enable`: 라벨이 있는 컨테이너만 업데이트

**환경 변수 (선택):**
```bash
WATCHTOWER_NOTIFICATIONS=shoutrrr
WATCHTOWER_NOTIFICATION_URL=generic+https://your-notification-url  # 알림 원하는 경우
```

3. **Deploy the container**

### 2.2 SSH를 통한 Watchtower 설치 (대안)

```bash
sudo docker run -d \
  --name watchtower \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower:latest \
  --interval 300 \
  --cleanup \
  --label-enable
```

---

## 📦 3단계: NAS 폴더 준비

### 3.1 File Station에서 폴더 생성

다음 경로에 폴더들을 생성하세요:

```
/volume1/docker/digital-album/
├── uploads/   # 이미지 파일 저장
└── db/        # SQLite 데이터베이스
```

**File Station에서:**
1. `docker` 폴더로 이동 (없으면 생성)
2. `digital-album` 폴더 생성
3. 그 안에 `uploads`, `db` 폴더 생성

### 3.2 폴더 권한 확인 (선택)

SSH로 접속하여 권한 설정:
```bash
cd /volume1/docker/digital-album
sudo chown -R 1000:1000 uploads db
sudo chmod -R 755 uploads db
```

---

## 🚀 4단계: Portainer Stack 생성

### 4.1 Stack 생성

**Portainer UI:**
1. 좌측 메뉴 **Stacks** 클릭
2. **Add stack** 클릭
3. 다음 정보 입력:

**Name:**
```
digital-album
```

**Build method:**
- "Web editor" 선택

**Web editor에 다음 내용 붙여넣기:**

```yaml
version: '3.9'

services:
  app:
    image: ghcr.io/daon2daon/digital-album:latest
    container_name: ipad-mini-album
    pull_policy: always
    
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
      
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: file:/app/prisma/database.db
      
    ports:
      - "${HOST_PORT:-20005}:3000"
      
    volumes:
      - /volume1/docker/digital-album/uploads:/app/public/uploads
      - /volume1/docker/digital-album/db:/app/prisma
      
    restart: unless-stopped
    
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/viewer/images', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

**Environment variables (선택):**
```
HOST_PORT=20005
```
> 다른 포트를 사용하려면 여기서 변경하세요.

### 4.2 Stack 배포

1. **Deploy the stack** 클릭
2. 배포 진행 상황 확인
3. 완료될 때까지 대기 (약 30초 ~ 1분)

### 4.3 배포 확인

**Portainer UI:**
1. **Stacks** → `digital-album` 클릭
2. 컨테이너 상태가 **running** 확인

**로그 확인:**
1. 컨테이너 이름 클릭 (`ipad-mini-album`)
2. **Logs** 탭 선택
3. 정상 실행 로그 확인:
```
========================================
Digital Album Server (Vanilla JS)
========================================
Server: http://0.0.0.0:3000
========================================
```

---

## 🌐 5단계: 접속 확인

### 5.1 웹 브라우저에서 확인

**뷰어 페이지:**
```
http://[NAS_IP]:20005/
```

**관리자 페이지:**
```
http://[NAS_IP]:20005/admin
```

예시: NAS IP가 192.168.0.100인 경우
- 뷰어: http://192.168.0.100:20005/
- 관리자: http://192.168.0.100:20005/admin

### 5.2 Health Check 확인

**Portainer UI:**
1. **Containers** → `ipad-mini-album`
2. **Stats** 탭에서 Health 상태 확인
3. **healthy** 상태면 정상

---

## 📱 6단계: iPad 설정

### 6.1 Safari로 접속

iPad에서:
```
http://[NAS_IP]:20005/
```

### 6.2 홈 화면에 추가

1. Safari 하단 **공유 버튼 (↗️)** 탭
2. "**홈 화면에 추가**" 선택
3. 이름 확인: "디지털 액자"
4. "**추가**" 탭

### 6.3 전체 화면으로 실행

1. 홈 화면에서 "디지털 액자" 아이콘 탭
2. 완전 전체 화면으로 실행됩니다!

---

## 🔄 7단계: 자동 업데이트 설정 확인

### 7.1 업데이트 워크플로우

```
1. 로컬에서 코드 수정
2. Git commit & push to main
3. GitHub Actions가 자동으로 이미지 빌드
4. 새 이미지를 GHCR에 푸시
5. Watchtower가 5분 이내에 새 이미지 감지
6. 자동으로 컨테이너 재시작 (무중단)
7. 업데이트 완료! ✅
```

### 7.2 업데이트 확인

**Portainer 로그에서:**
1. **Containers** → `watchtower` 선택
2. **Logs** 탭 확인
3. 업데이트 감지 시 다음과 같은 로그 표시:
```
Checking for new images
Found new image for ipad-mini-album
Stopping container ipad-mini-album
Removing container ipad-mini-album
Creating container ipad-mini-album
Starting container ipad-mini-album
```

### 7.3 수동 업데이트 (필요 시)

**Portainer UI:**
1. **Containers** → `ipad-mini-album` 선택
2. **Recreate** 버튼 클릭
3. **Pull latest image** 체크
4. **Recreate** 확인

---

## 🔒 8단계: 보안 설정 (권장)

### 8.1 방화벽 설정

**제어판 → 보안 → 방화벽:**

1. **규칙 편집**
2. **생성** 클릭
3. **포트 20005 (또는 사용 중인 포트) 허용:**
   - 포트: 20005
   - 프로토콜: TCP
   - 소스 IP: 내부 네트워크 범위 (예: 192.168.0.0/24)
   - 동작: 허용

### 8.2 Portainer HTTPS 설정 (선택)

**Portainer Settings:**
1. **Settings** → **SSL certificate**
2. 인증서 업로드 또는 Let's Encrypt 설정
3. HTTPS로 Portainer 접속: `https://[NAS_IP]:9443`

### 8.3 역방향 프록시 설정 (선택)

**제어판 → 응용 프로그램 포털 → 역방향 프록시:**

Digital Album을 도메인으로 접속하려면:
1. **생성** 클릭
2. 소스: HTTPS, your-domain.com, 443
3. 대상: HTTP, localhost, 20005
4. SSL 인증서 선택

---

## 🔧 관리 및 유지보수

### 9.1 Portainer에서 관리

**컨테이너 제어:**
- **Start/Stop/Restart:** Containers 메뉴에서 클릭
- **로그 확인:** Logs 탭
- **리소스 모니터링:** Stats 탭
- **터미널 접속:** Console 탭

**Stack 관리:**
- **편집:** Stacks → digital-album → Editor
- **재배포:** Update the stack 버튼
- **삭제:** Stop & Remove stack

### 9.2 데이터 백업

**중요 데이터:**
```
/volume1/docker/digital-album/uploads/  # 업로드된 이미지
/volume1/docker/digital-album/db/       # SQLite 데이터베이스
```

**Hyper Backup 설정:**
1. **Hyper Backup** 패키지 설치
2. 백업 작업 생성
3. 대상: `/volume1/docker/digital-album`
4. 일정: 매일 또는 매주

**수동 백업 (SSH):**
```bash
# 백업 폴더 생성
mkdir -p /volume1/backups/digital-album

# 데이터 복사
cp -r /volume1/docker/digital-album/uploads /volume1/backups/digital-album/
cp -r /volume1/docker/digital-album/db /volume1/backups/digital-album/
```

### 9.3 로그 관리

**Portainer에서 로그 확인:**
1. **Containers** → `ipad-mini-album`
2. **Logs** 탭
3. 검색 및 필터링 가능

**로그 다운로드:**
- Download logs 버튼 클릭

### 9.4 리소스 모니터링

**Portainer Dashboard:**
1. **Home** → 환경 선택
2. 전체 컨테이너 상태 확인
3. CPU, 메모리 사용량 그래프

**예상 리소스 사용량:**
```
digital-album: CPU 0.1%, MEM ~50MB
watchtower:    CPU 0.0%, MEM ~10MB
portainer:     CPU 0.1%, MEM ~50MB
```

---

## 🐛 문제 해결

### 문제 1: 컨테이너가 시작되지 않음

**확인:**
1. Portainer → Containers → 상태 확인
2. Logs 탭에서 에러 메시지 확인

**일반적인 원인:**
- 포트 충돌 (20005 포트가 이미 사용 중)
- 볼륨 경로 문제 (폴더가 존재하지 않음)
- 이미지 다운로드 실패

**해결:**
```bash
# SSH로 접속하여 확인
# 포트 충돌 확인
sudo netstat -tlnp | grep 20005

# 폴더 존재 확인
ls -la /volume1/docker/digital-album/

# 폴더가 없다면 생성
sudo mkdir -p /volume1/docker/digital-album/{uploads,db}
```

### 문제 2: 웹 페이지 접속 안 됨

**확인 사항:**
1. 컨테이너 실행 중인지 확인
2. 방화벽 포트 허용 확인
3. NAS IP 주소 정확한지 확인

**Portainer에서 확인:**
1. Container 상태가 "running"인지 확인
2. Health가 "healthy"인지 확인
3. Logs에서 "Server: http://0.0.0.0:3000" 메시지 확인

### 문제 3: 자동 업데이트가 안 됨

**Watchtower 확인:**
1. Portainer → Containers → `watchtower`
2. 상태가 "running"인지 확인
3. Logs에서 업데이트 체크 로그 확인

**라벨 확인:**
- Stack 설정에서 `com.centurylinklabs.watchtower.enable=true` 라벨 존재 확인

**수동 트리거:**
```bash
# SSH로 Watchtower 재시작
sudo docker restart watchtower

# 또는 즉시 체크 실행
sudo docker exec watchtower watchtower --run-once
```

### 문제 4: 이미지 업로드 실패

**확인:**
1. Portainer Logs에서 에러 확인
2. 업로드 폴더 권한 확인

**해결 (SSH):**
```bash
# 권한 수정
sudo chown -R 1000:1000 /volume1/docker/digital-album/uploads
sudo chmod -R 755 /volume1/docker/digital-album/uploads

# Portainer에서 컨테이너 재시작
```

### 문제 5: 데이터베이스 마이그레이션 실패

**확인:**
```bash
# SSH로 DB 파일 확인
ls -la /volume1/docker/digital-album/db/
```

**해결:**
```bash
# DB 폴더 권한 수정
sudo chown -R 1000:1000 /volume1/docker/digital-album/db
sudo chmod -R 755 /volume1/docker/digital-album/db

# 컨테이너 재생성 (Portainer에서 Recreate)
```

---

## 📊 모니터링 및 알림

### 10.1 Watchtower 알림 설정

Watchtower는 업데이트 시 알림을 보낼 수 있습니다.

**Slack 알림 예시:**

Stack Editor에서 환경 변수 추가:
```yaml
environment:
  WATCHTOWER_NOTIFICATIONS: slack
  WATCHTOWER_NOTIFICATION_SLACK_HOOK_URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
  WATCHTOWER_NOTIFICATION_SLACK_IDENTIFIER: Digital-Album
```

**지원하는 알림 서비스:**
- Slack
- Discord
- Telegram
- Email (SMTP)
- Gotify
- Pushover

### 10.2 Portainer 알림

**Portainer Business Edition 기능:**
- 컨테이너 Down 시 알림
- 리소스 임계값 초과 시 알림

---

## 🎯 배포 체크리스트

### 최초 배포
- [ ] Portainer 설치 완료
- [ ] Watchtower 설치 완료
- [ ] NAS 폴더 생성 (`uploads`, `db`)
- [ ] Portainer Stack 생성 완료
- [ ] 컨테이너 정상 실행 확인
- [ ] 웹 브라우저 접속 성공
- [ ] 관리자 페이지에서 이미지 업로드 테스트
- [ ] iPad 뷰어 접속 확인
- [ ] 슬라이드쇼 동작 확인
- [ ] 방화벽 설정 완료

### 업데이트 확인
- [ ] GitHub에 코드 푸시 완료
- [ ] GitHub Actions 빌드 성공
- [ ] GHCR에 새 이미지 확인
- [ ] Watchtower 로그에서 업데이트 확인
- [ ] 컨테이너 재시작 확인
- [ ] 웹 페이지 정상 작동 확인

---

## 🚀 다음 단계

배포가 완료되면:

1. **이미지 업로드:** 관리자 페이지에서 사진 추가
2. **설정 조정:** 슬라이드 시간, 전환 효과 등 설정
3. **iPad 설정:** 홈 화면 추가 및 전체 화면 실행
4. **백업 설정:** Hyper Backup 설정
5. **모니터링:** 정기적으로 Portainer에서 상태 확인

---

## 📚 관련 문서

- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - 프로젝트 구조 및 개요
- **[LOCAL_DOCKER_GUIDE.md](./LOCAL_DOCKER_GUIDE.md)** - 로컬 테스트 방법
- **[루트 README.md](../README.md)** - 프로젝트 소개

---

## 📧 문의 및 지원

배포 관련 문제는 GitHub Issues에 다음 정보와 함께 문의해주세요:

- DSM 버전
- Portainer 버전
- Watchtower 버전
- 에러 메시지 전체 (Portainer Logs)
- Stack 설정 (docker-compose.yml)

---

**Synology NAS + Portainer + Watchtower로 완벽한 자동화된 디지털 액자를 즐기세요!** 🖼️✨
