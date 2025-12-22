#!/bin/sh
# Docker 컨테이너 시작 스크립트
# Digital Album - Synology NAS 배포용
# Using SQLite database

set -e

echo "=========================================="
echo "Digital Album - Starting..."
echo "=========================================="

# 1. SQLite 데이터베이스 디렉토리 확인 및 생성
echo ""
echo "🔍 Checking SQLite database directory..."
DB_DIR="/app/prisma"
DB_FILE="$DB_DIR/database.db"

if [ ! -d "$DB_DIR" ]; then
    echo "📁 Creating database directory..."
    mkdir -p "$DB_DIR"
fi

# 2. Prisma 마이그레이션 적용
echo ""
echo "📊 Applying database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Migrations applied successfully!"
else
    echo "⚠️  Migration failed, attempting recovery..."
    
    # 실패한 마이그레이션 상태 확인
    echo "Checking migration status..."
    npx prisma migrate status || true
    
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
if [ -f "$DB_FILE" ]; then
    echo "✅ SQLite database file exists: $DB_FILE"
    ls -lh "$DB_FILE" || true
else
    echo "⚠️  SQLite database file not found (will be created on first use)"
fi

# 5. 서버 시작
echo ""
echo "=========================================="
echo "🚀 Starting Express server..."
echo "=========================================="
echo ""

exec node server.js





