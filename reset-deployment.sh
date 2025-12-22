#!/bin/bash
# Digital Album - 배포 완전 리셋 스크립트
# Synology NAS용 (SQLite 버전)

set -e

echo "=========================================="
echo "Digital Album - 배포 완전 리셋"
echo "=========================================="
echo ""
echo "⚠️  경고: 다음 항목이 삭제됩니다:"
echo "  - 모든 컨테이너 (app)"
echo "  - 모든 데이터베이스 데이터 (SQLite 파일)"
echo "  - 모든 업로드된 이미지"
echo ""
echo "계속하려면 'YES'를 입력하세요:"
read -r CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "❌ 취소되었습니다."
    exit 1
fi

echo ""
echo "🔧 작업 시작..."
echo ""

# 1. 컨테이너 중지 및 삭제
echo "1️⃣  컨테이너 중지 및 삭제 중..."
cd /volume1/docker/digital-album
sudo docker-compose down -v || true

# 2. 이미지 삭제 (선택적)
echo ""
echo "2️⃣  Docker 이미지 삭제할까요? (재빌드가 필요합니다)"
echo "   y: 예 (시간이 더 걸리지만 깨끗함)"
echo "   n: 아니오 (빠름)"
read -r DELETE_IMAGE

if [ "$DELETE_IMAGE" = "y" ]; then
    sudo docker rmi digital-album-app || true
fi

# 3. 볼륨 강제 삭제
echo ""
echo "3️⃣  볼륨 강제 삭제 중..."
sudo docker volume rm digital-album_uploads_v2 -f || true
sudo docker volume rm digital-album_db_v2 -f || true

# 4. 고아 컨테이너 정리
echo ""
echo "4️⃣  시스템 정리 중..."
sudo docker container prune -f
sudo docker volume prune -f

# 5. 볼륨 삭제 확인
echo ""
echo "5️⃣  볼륨 삭제 확인..."
REMAINING_VOLUMES=$(sudo docker volume ls | grep digital-album || true)
if [ -n "$REMAINING_VOLUMES" ]; then
    echo "⚠️  아직 남아있는 볼륨:"
    echo "$REMAINING_VOLUMES"
    echo ""
    echo "수동으로 삭제가 필요할 수 있습니다."
else
    echo "✅ 모든 볼륨이 삭제되었습니다."
fi

echo ""
echo "=========================================="
echo "✅ 리셋 완료!"
echo "=========================================="
echo ""
echo "이제 다음 명령어로 재배포하세요:"
echo ""
echo "  cd /volume1/docker/digital-album"
echo "  sudo docker-compose up -d"
echo ""
echo "또는 Container Manager GUI에서 프로젝트를 다시 생성하세요."
echo ""






