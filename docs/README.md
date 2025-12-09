# 📚 디지털 액자 문서

## 개요

이 디렉터리에는 디지털 액자 프로젝트의 모든 문서가 포함되어 있습니다.

---

## 📖 문서 목록

### 시작 가이드

#### [QUICK_START.md](./QUICK_START.md) ⭐️
- 빠른 시작 가이드
- 즉시 테스트 방법
- 문제 해결
- 현재 이미지 정보

#### [HIDE_ADDRESS_BAR.md](./HIDE_ADDRESS_BAR.md) 📱
- iPad 전체 화면 설정 (3단계)
- 홈 화면에 추가 방법
- 완벽한 전체 화면 경험

---

### 표시 모드

#### [FULLSCREEN_GUIDE.md](./FULLSCREEN_GUIDE.md) 🖼️
- 표시 모드 가이드 (Cover vs Contain)
- 사용자 중심 설명
- 추천 설정
- 이미지 준비 팁

#### [FULLSCREEN_SETUP.md](./FULLSCREEN_SETUP.md) 🔧
- 상세 전체 화면 가이드
- 아이콘 커스터마이징
- Guided Access 설정
- 고급 최적화

#### [fullscreen-mode-guide.md](./fullscreen-mode-guide.md) 💻
- 기술 문서
- CSS 구현 상세
- 브라우저 호환성
- 개발자용 고급 설정

---

### 설치 및 배포

#### [VANILLA_SETUP_GUIDE.md](./VANILLA_SETUP_GUIDE.md) 🛠️
- 전체 설치 가이드
- 로컬 개발 환경
- 단계별 설치
- 초기 설정

#### [SYNOLOGY_DEPLOYMENT.md](./SYNOLOGY_DEPLOYMENT.md) 🐳 ⭐️
- **Synology NAS 배포 가이드**
- Docker 설치 및 설정
- 환경 변수 구성
- 관리 명령어
- 모니터링 및 백업
- 보안 설정

#### [database-setup.md](./database-setup.md) 🗄️
- PostgreSQL 설정
- Prisma 마이그레이션
- 백업 및 복원
- Docker 데이터베이스 관리

#### [PORT_CONFIGURATION.md](./PORT_CONFIGURATION.md) 🔌
- 포트 설정 상세 가이드
- 포트 충돌 해결
- 방화벽 설정
- 포트 변경 체크리스트

---

### 프로젝트 정보

#### [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 📂
- 프로젝트 전체 구조
- 파일별 역할 설명
- 데이터 흐름
- 배포 가이드

#### [CLEANUP_REPORT.md](./CLEANUP_REPORT.md) 🧹
- 프로젝트 정리 보고서
- Before/After 비교
- 삭제된 파일 목록
- 개선 효과

#### [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) 🎉
- 최종 요약
- 프로젝트 완성도
- 즉시 사용 가능 확인
- 다음 단계

---

## 🗂️ 문서 구조

```
docs/
├── README.md                          # 이 파일
│
├── 시작 가이드/
│   ├── QUICK_START.md                 # 빠른 시작 ⭐️
│   └── HIDE_ADDRESS_BAR.md            # 전체 화면 (3단계) 📱
│
├── 표시 모드/
│   ├── FULLSCREEN_GUIDE.md            # 사용자 가이드 🖼️
│   ├── FULLSCREEN_SETUP.md            # 상세 가이드 🔧
│   └── fullscreen-mode-guide.md       # 기술 문서 💻
│
├── 설치 및 배포/
│   ├── VANILLA_SETUP_GUIDE.md         # 전체 설치 🛠️
│   ├── SYNOLOGY_DEPLOYMENT.md         # Synology NAS 🐳 ⭐️
│   └── database-setup.md              # 데이터베이스 🗄️
│
└── 프로젝트 정보/
    ├── PROJECT_STRUCTURE.md           # 프로젝트 구조 📂
    ├── CLEANUP_REPORT.md              # 정리 보고서 🧹
    └── FINAL_SUMMARY.md               # 최종 요약 🎉
```

---

## 🎯 상황별 문서 선택

### 처음 시작하는 경우
1. [../README.md](../README.md) - 프로젝트 개요
2. [QUICK_START.md](./QUICK_START.md) - 빠른 설치 및 실행

### iPad 전체 화면 설정
1. [HIDE_ADDRESS_BAR.md](./HIDE_ADDRESS_BAR.md) - 3단계 가이드 📱

### 표시 모드 변경
1. [FULLSCREEN_GUIDE.md](./FULLSCREEN_GUIDE.md) - 사용자 가이드
2. [fullscreen-mode-guide.md](./fullscreen-mode-guide.md) - 기술 문서

### Synology NAS 배포 ⭐️
1. [SYNOLOGY_DEPLOYMENT.md](./SYNOLOGY_DEPLOYMENT.md) - 전체 배포 가이드

### 로컬 개발
1. [VANILLA_SETUP_GUIDE.md](./VANILLA_SETUP_GUIDE.md) - 전체 설치
2. [database-setup.md](./database-setup.md) - DB 설정

### 프로젝트 구조 이해
1. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 상세 구조

---

## 📋 문서 요약

| 문서 | 대상 | 난이도 | 시간 |
|------|------|--------|------|
| **QUICK_START.md** | 모든 사용자 | ⭐ 쉬움 | 5분 |
| **HIDE_ADDRESS_BAR.md** | iPad 사용자 | ⭐ 쉬움 | 2분 |
| **FULLSCREEN_GUIDE.md** | iPad 사용자 | ⭐ 쉬움 | 5분 |
| **FULLSCREEN_SETUP.md** | iPad 사용자 | ⭐⭐ 보통 | 10분 |
| **SYNOLOGY_DEPLOYMENT.md** | 시스템 관리자 | ⭐⭐⭐ 어려움 | 30분 |
| **VANILLA_SETUP_GUIDE.md** | 개발자 | ⭐⭐ 보통 | 15분 |
| **database-setup.md** | 개발자 | ⭐⭐ 보통 | 10분 |
| **fullscreen-mode-guide.md** | 개발자 | ⭐⭐⭐ 어려움 | 20분 |
| **PROJECT_STRUCTURE.md** | 개발자 | ⭐⭐ 보통 | 15분 |

---

## 💡 추가 리소스

### 온라인 도구
- **아이콘 생성기**: `http://localhost:3000/icon-generator.html`
- **Prisma Studio**: `npx prisma studio`
- **관리자 페이지**: `http://localhost:3000/admin`

### API 문서
- 뷰어 API: `GET /api/viewer/images`
- 관리자 API: `GET /api/admin/images`

### GitHub
- Issues: 문제 보고 및 질문
- Pull Requests: 기여 환영

---

## 🔄 문서 업데이트

### 최근 업데이트
- **2025-12-08**: Synology NAS 배포 가이드 추가
- **2025-12-08**: 문서 구조 개선 (docs 폴더로 이동)
- **2025-12-08**: Docker 설정 최적화

### 업데이트 예정
- [ ] API 상세 문서
- [ ] 성능 튜닝 가이드
- [ ] 앨범 기능 문서 (계획 중)

---

## 🤝 기여

문서 개선 제안:
1. GitHub Issues로 제안
2. Pull Request 제출
3. 오타 및 오류 보고

---

## 📧 문의

- **일반 문의**: GitHub Issues
- **버그 리포트**: GitHub Issues
- **기능 요청**: GitHub Issues

---

**모든 문서를 읽어주셔서 감사합니다!** 📚✨
