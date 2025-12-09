# 🔌 포트 설정 요약

## 현재 포트 구성

| 서비스 | 포트 | 용도 |
|--------|------|------|
| **웹앱** | **8754** | Express 서버 |
| **DB** | **4578** | PostgreSQL |

## 접속 URL

```
뷰어:   http://[IP]:8754/
관리자: http://[IP]:8754/admin
```

## 변경된 파일

✅ server.js
✅ Dockerfile
✅ docker-compose.yml
✅ docker-compose.dev.yml
✅ .env.example
✅ .env.local.example
✅ README.md
✅ docs/*.md (전체)

## 테스트

```bash
# 서버 시작
node server.js

# 접속 확인
curl http://localhost:8754/api/viewer/images
```

자세한 내용: docs/PORT_CONFIGURATION.md
