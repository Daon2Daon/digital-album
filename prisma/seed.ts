import { config } from "dotenv";

// .env.local 파일에서 환경 변수 로드 (PrismaClient import 전에 실행)
config({ path: ".env.local" });

// 환경 변수 로드 후 PrismaClient import
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

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
    },
  });

  console.log("✅ Settings 초기 데이터 생성 완료:", settings);

  // 기본 관리자 계정 생성 (환경 변수에서 가져오기)
  const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { username: defaultUsername },
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(defaultPassword);
    const admin = await prisma.user.create({
      data: {
        username: defaultUsername,
        password: hashedPassword,
      },
    });

    console.log("✅ 기본 관리자 계정 생성 완료:");
    console.log(`   사용자명: ${defaultUsername}`);
    console.log(`   비밀번호: ${defaultPassword}`);
    console.log(`   ⚠️  보안을 위해 첫 로그인 후 비밀번호를 변경하세요!`);
  } else {
    console.log("ℹ️  기본 관리자 계정이 이미 존재합니다.");
  }

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

