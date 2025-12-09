import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";

// .env.local 파일에서 환경 변수 로드
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
