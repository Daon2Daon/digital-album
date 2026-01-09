import { config } from "dotenv";

// .env.local 파일에서 환경 변수 로드 (PrismaClient import 전에 실행)
config({ path: ".env.local" });

// 환경 변수 로드 후 PrismaClient import
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 데이터베이스 시드 스크립트
 * 초기 데이터를 생성합니다.
 */
async function main() {
  console.log("🌱 데이터베이스 시드 시작...");

  // Settings 초기 데이터 생성
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      slideDuration: 10000, // 10초
      transitionEffect: "fade",
      transitionSpeed: 1000, // 1초
      displayMode: "cover",
      randomOrder: false,
    },
  });

  console.log("✅ Settings 초기 데이터 생성 완료:", settings);
  console.log("🎉 데이터베이스 시드 완료!");
}

main()
  .catch((e) => {
    console.error("❌ 시드 실행 중 오류 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
