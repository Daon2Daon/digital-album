/**
 * 기존 이미지들의 displayOrder를 재정렬하는 스크립트
 * 
 * 사용법:
 * npx tsx prisma/fix-display-order.ts
 */

import { prisma } from "../src/lib/prisma";

async function fixDisplayOrder() {
  try {
    console.log("이미지 displayOrder 재정렬 시작...");

    // 모든 이미지를 createdAt 기준으로 정렬하여 가져오기
    const images = await prisma.image.findMany({
      orderBy: { createdAt: "asc" },
    });

    console.log(`총 ${images.length}개의 이미지를 찾았습니다.`);

    // 각 이미지의 displayOrder를 순차적으로 업데이트
    for (let i = 0; i < images.length; i++) {
      await prisma.image.update({
        where: { id: images[i].id },
        data: { displayOrder: i },
      });
      console.log(
        `이미지 ${images[i].id} (${images[i].originalName}): displayOrder = ${i}`
      );
    }

    console.log("✅ displayOrder 재정렬 완료!");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDisplayOrder();

