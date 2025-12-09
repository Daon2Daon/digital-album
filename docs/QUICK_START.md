# 🚀 빠른 시작 가이드

## ✅ 현재 상태

- ✅ 서버 실행 중: `http://0.0.0.0:8754`
- ✅ 이미지 3개 준비됨
- ✅ API 정상 작동 확인
- ✅ iPad mini 1세대 (iOS 9.3.6) 완전 호환

---

## 📱 즉시 테스트

### 1. PC에서 관리자 페이지 접속

```
http://localhost:8754/admin
```

**확인 사항**:
- ✅ 이미지 목록 3개 표시되는가?
- ✅ "CarlLarsson.jpg", "bernard buffet.jpeg", "ErnstEck.jpg"
- ✅ 각 이미지 썸네일 보이는가?

### 2. iPad mini 1세대에서 뷰어 접속

```
http://[NAS_IP]:8754/
```

**기대 결과**:
- ✅ 첫 번째 이미지 (CarlLarsson.jpg) 표시
- ✅ 10초 후 자동으로 다음 이미지로 전환
- ✅ 3개 이미지 순환 재생

---

## 🎯 주요 기능

### 뷰어 (iPad mini 1세대)

**URL**: `http://[NAS_IP]:8754/`

**기능**:
- 자동 슬라이드쇼 (기본 10초)
- Fade 전환 효과
- 전체 화면 표시
- 10분마다 자동 갱신
- 에러 시 자동 재시도

### 관리자 (PC/최신 기기)

**URL**: `http://[NAS_IP]:8754/admin`

**기능**:
- 이미지 업로드 (드래그 앤 드롭)
- 이미지 삭제
- 슬라이드 시간 설정
- 전환 효과 설정

---

## 🔧 문제 해결

### 관리자 페이지에서 이미지 목록이 안 보이면

1. **브라우저 콘솔 확인** (F12)
   - 빨간색 에러가 있는가?
   - 네트워크 탭에서 `/api/admin/images` 요청 상태는?

2. **서버 로그 확인**
   - 터미널에 에러 메시지가 있는가?

3. **API 직접 테스트**
   ```bash
   curl http://localhost:8754/api/admin/images
   ```
   
   **정상 응답**:
   ```json
   {
     "success": true,
     "images": [...]
   }
   ```

### iPad에서 빈 화면이면

1. **Safari 캐시 삭제**
   ```
   설정 > Safari > 방문 기록 및 웹사이트 데이터 지우기
   ```

2. **Safari 개발자 도구 연결** (Mac 필요)
   - iPad: 설정 > Safari > 고급 > 웹 검사기 ✅
   - Mac Safari: 개발 > [iPad] > [viewer.html]
   - 콘솔에서 에러 확인

3. **예상 로그**:
   ```
   [Slideshow] Initializing...
   [Slideshow] Fetching images...
   [Slideshow] Loaded 3 images
   [Slideshow] Slideshow initialized
   [Slideshow] Slideshow started
   ```

---

## 📊 현재 이미지 정보

| ID | 파일명 | 크기 | 해상도 |
|----|--------|------|--------|
| 3 | CarlLarsson.jpg | 522KB | 1230×1800 |
| 4 | bernard buffet.jpeg | 114KB | 619×1000 |
| 5 | ErnstEck.jpg | 218KB | 1329×1800 |

모두 iPad mini 1세대에 적합한 크기입니다! ✅

---

## 🎨 설정 변경

### 슬라이드 시간 변경

1. `http://localhost:8754/admin` 접속
2. 하단 "슬라이드쇼 설정"
3. "슬라이드 시간" 조정 (1-60초)
4. "설정 저장" 클릭

**즉시 적용**: iPad에서 다음 갱신 시(최대 10분) 반영

### 수동 갱신

iPad에서 페이지 새로고침하면 즉시 새 설정 적용됩니다.

---

## 📝 서버 관리

### 서버 중지

터미널에서 `Ctrl+C`

### 서버 재시작

```bash
node server.js
```

### 서버 상태 확인

```bash
curl http://localhost:8754/api/viewer/images
```

---

## 🎉 성공 체크리스트

### PC에서
- [ ] `http://localhost:8754/admin` 접속
- [ ] 이미지 3개 표시 확인
- [ ] 이미지 업로드 테스트
- [ ] 설정 변경 테스트

### iPad mini 1세대에서
- [ ] `http://[NAS_IP]:8754/` 접속
- [ ] 첫 이미지 표시 확인
- [ ] 10초 후 자동 전환 확인
- [ ] 3개 이미지 순환 확인

---

## 💡 팁

### iPad 설정 (권장)

```
1. 자동 잠금 해제
   설정 > 디스플레이 및 밝기 > 자동 잠금 > 안 함

2. Guided Access (앱 고정)
   설정 > 일반 > 손쉬운 사용 > Guided Access 활성화
   Safari에서 페이지 열고 홈 버튼 3번 클릭
```

### 이미지 추가

1. PC에서 `/admin` 접속
2. 상단 업로드 영역 클릭
3. JPG/PNG 파일 선택
4. 자동으로 1920px 리사이징
5. iPad에서 10분 내 자동 반영

---

## 🎯 다음 단계

모든 것이 정상 작동하면:

1. **Docker 배포** (선택)
   - `VANILLA_SETUP_GUIDE.md` 참고
   - Synology NAS에 배포

2. **추가 기능** (선택)
   - 이미지 순서 변경
   - 간단한 인증
   - 앨범 기능

---

**서버가 실행 중입니다! 이제 테스트해보세요!** 🎉

