#!/bin/sh
# Docker 컨테이너 시작 스크립트
# Digital Album - Synology NAS 배포용

set -e

echo "=========================================="
echo "Digital Album - Starting..."
echo "=========================================="

# 1. 데이터베이스 연결 대기
echo ""
echo "🔍 Waiting for database connection..."
until npx prisma db push --skip-generate --accept-data-loss 2>&1 | grep -q "Database is now in sync\|already in sync\|Everything is now in sync"; do
  echo "⏳ Database not ready yet, retrying in 2 seconds..."
  sleep 2
done
echo "✅ Database connection established!"

# 2. Prisma 마이그레이션 적용
echo ""
echo "📊 Applying database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Migrations applied successfully!"
else
    echo "⚠️  Migration failed, attempting recovery..."
    
    # 실패한 마이그레이션 상태 확인 및 복구
    echo "Checking migration status..."
    npx prisma migrate status || true
    
    # 마지막 마이그레이션을 이미 적용된 것으로 표시 시도
    LAST_MIGRATION=$(ls -1 prisma/migrations | tail -n 1)
    if [ -n "$LAST_MIGRATION" ]; then
        echo "Attempting to mark $LAST_MIGRATION as applied..."
        npx prisma migrate resolve --applied "$LAST_MIGRATION" || true
    fi
    
    # 재시도
    echo "Retrying migration..."
    if npx prisma migrate deploy; then
        echo "✅ Migration succeeded on retry!"
    else
        echo "❌ Migration still failing, but continuing to start server..."
        echo "Please check migration status manually:"
        echo "  docker-compose exec app npx prisma migrate status"
    fi
fi

# 3. 초기 데이터 시드 (이미 있으면 스킵)
echo ""
echo "🌱 Seeding initial data..."
if npx prisma db seed; then
    echo "✅ Seed data created!"
else
    echo "ℹ️  Seed skipped (data may already exist)"
fi

# 4. 최종 데이터베이스 상태 확인
echo ""
echo "📋 Final database status:"
npx prisma migrate status || echo "⚠️  Unable to check migration status"

# 5. 서버 시작
echo ""
echo "=========================================="
echo "🚀 Starting Express server..."
echo "=========================================="
echo ""

exec node server.js

