/**
 * Express.js 서버
 * iPad mini 1세대 (iOS 9.3.6) 호환
 * - 뷰어: ES5 JavaScript
 * - 관리자: 모던 브라우저
 */

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const formidable = require('formidable');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const prisma = new PrismaClient();

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// CORS 설정 (개발 환경)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// ==================== 헬퍼 함수 ====================

/**
 * 에러 응답 헬퍼
 */
const sendError = (res, statusCode, message, error = null) => {
  if (error) {
    console.error(`[Error] ${message}:`, error);
  }
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

/**
 * 설정 조회 또는 생성 (싱글톤)
 */
const getOrCreateSettings = async () => {
  let settings = await prisma.settings.findUnique({
    where: { id: 1 }
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: 1,
        slideDuration: 10000,
        transitionEffect: 'fade',
        transitionSpeed: 1000,
        displayMode: 'cover',
        randomOrder: false
      }
    });
  }

  return settings;
};

/**
 * 다음 displayOrder 값 조회
 */
const getNextDisplayOrder = async () => {
  const lastImage = await prisma.image.findFirst({
    orderBy: { displayOrder: 'desc' }
  });
  return (lastImage?.displayOrder ?? -1) + 1;
};

// ==================== 뷰어 API (iPad mini 1세대용) ====================

/**
 * 뷰어용 이미지 목록 및 설정 조회
 * GET /api/viewer/images
 */
app.get('/api/viewer/images', async (req, res) => {
  try {
    let images = await prisma.image.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    const settings = await getOrCreateSettings();

    // 랜덤 순서 옵션이 활성화된 경우 배열을 섞음
    if (settings.randomOrder) {
      // Fisher-Yates 셔플 알고리즘
      for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
      }
    }

    res.json({
      success: true,
      images: images.map((img) => ({
        id: img.id,
        originalName: img.originalName,
        filename: img.filename,
        url: img.url,
        width: img.width,
        height: img.height
      })),
      settings: {
        slideDuration: settings.slideDuration,
        transitionEffect: settings.transitionEffect,
        transitionSpeed: settings.transitionSpeed,
        displayMode: settings.displayMode,
        randomOrder: settings.randomOrder
      }
    });
  } catch (error) {
    sendError(res, 500, '이미지 목록을 불러올 수 없습니다', error);
  }
});

// ==================== 관리자 API ====================

/**
 * 이미지 목록 조회
 * GET /api/admin/images
 */
app.get('/api/admin/images', async (req, res) => {
  try {
    const images = await prisma.image.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      images
    });
  } catch (error) {
    sendError(res, 500, '이미지 목록을 불러올 수 없습니다', error);
  }
});

/**
 * 이미지 업로드
 * POST /api/admin/upload
 */
app.post('/api/admin/upload', (req, res) => {
  const uploadDir = path.join(__dirname, 'public', 'uploads');

  // uploads 폴더가 없으면 생성
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: false,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return sendError(res, 500, '파일 업로드에 실패했습니다', err);
    }

    try {
      // formidable v3는 파일을 배열로 반환
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        return sendError(res, 400, '파일이 제공되지 않았습니다');
      }

      // UUID 생성
      const uuid = crypto.randomUUID();
      const filename = `${uuid}.jpg`;
      const filepath = path.join(uploadDir, filename);

      // 이미지 리사이징 (1920px 제한)
      await sharp(file.filepath)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(filepath);

      // 원본 파일 삭제
      fs.unlinkSync(file.filepath);

      // 메타데이터 추출
      const metadata = await sharp(filepath).metadata();
      const stats = fs.statSync(filepath);

      // 다음 displayOrder 값 조회
      const nextOrder = await getNextDisplayOrder();

      // DB에 저장
      const image = await prisma.image.create({
        data: {
          originalName: file.originalFilename || 'unknown.jpg',
          filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          width: metadata.width,
          height: metadata.height,
          displayOrder: nextOrder
        }
      });

      console.log(`[Upload] Success: ${filename} (order: ${nextOrder})`);
      res.json({
        success: true,
        image
      });
    } catch (error) {
      sendError(res, 500, '이미지 처리에 실패했습니다', error);
    }
  });
});

/**
 * 이미지 삭제
 * DELETE /api/admin/images/:id
 */
app.delete('/api/admin/images/:id', async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);

    const image = await prisma.image.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return sendError(res, 404, '이미지를 찾을 수 없습니다');
    }

    // 파일 삭제
    const filepath = path.join(__dirname, 'public', image.url);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // DB에서 삭제
    await prisma.image.delete({
      where: { id: imageId }
    });

    console.log(`[Delete] Success: ${image.filename}`);
    res.json({
      success: true,
      message: '이미지가 삭제되었습니다'
    });
  } catch (error) {
    sendError(res, 500, '이미지 삭제에 실패했습니다', error);
  }
});

/**
 * 설정 조회
 * GET /api/admin/settings
 */
app.get('/api/admin/settings', async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    sendError(res, 500, '설정을 불러올 수 없습니다', error);
  }
});

/**
 * 설정 업데이트
 * PUT /api/admin/settings
 */
app.put('/api/admin/settings', async (req, res) => {
  try {
    const data = req.body;

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        slideDuration: data.slideDuration || 10000,
        transitionEffect: data.transitionEffect || 'fade',
        transitionSpeed: data.transitionSpeed || 1000,
        displayMode: data.displayMode || 'cover',
        randomOrder: data.randomOrder ?? false
      },
      create: {
        id: 1,
        slideDuration: data.slideDuration || 10000,
        transitionEffect: data.transitionEffect || 'fade',
        transitionSpeed: data.transitionSpeed || 1000,
        displayMode: data.displayMode || 'cover',
        randomOrder: data.randomOrder ?? false
      }
    });

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    sendError(res, 500, '설정 저장에 실패했습니다', error);
  }
});

// ==================== 정적 페이지 라우트 ====================

// 뷰어 (iPad mini 1세대용)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

// 관리자 페이지 (모던 브라우저용)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ==================== 서버 시작 ====================

const PORT = process.env.PORT || 8754;
app.listen(PORT, '0.0.0.0', () => {
  console.log('===========================================');
  console.log('Digital Album Server');
  console.log('===========================================');
  console.log(`Server: http://0.0.0.0:${PORT}`);
  console.log(`Viewer: http://0.0.0.0:${PORT}/`);
  console.log(`Admin:  http://0.0.0.0:${PORT}/admin`);
  console.log('===========================================');
});

// 프로세스 종료 처리
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
