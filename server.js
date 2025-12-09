/**
 * Express.js 서버
 * iPad mini 1세대 (iOS 9.3.6) 호환
 * - 뷰어: ES5 JavaScript
 * - 관리자: 모던 브라우저
 */

// 환경 변수 로드 (prisma.config.ts 사용 시 필요)
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const formidable = require('formidable');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
const prisma = new PrismaClient();

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// CORS 설정 (개발 환경)
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// ==================== 뷰어 API (iPad mini 1세대용) ====================

/**
 * 뷰어용 이미지 목록 및 설정 조회
 * GET /api/viewer/images
 */
app.get('/api/viewer/images', async function(req, res) {
  try {
    var images = await prisma.image.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    var settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          slideDuration: 10000,
          transitionEffect: 'fade',
          transitionSpeed: 1000,
          displayMode: 'cover'
        }
      });
    }

    res.json({
      success: true,
      images: images.map(function(img) {
        return {
          id: img.id,
          originalName: img.originalName,
          filename: img.filename,
          url: img.url,
          width: img.width,
          height: img.height
        };
      }),
      settings: {
        slideDuration: settings.slideDuration,
        transitionEffect: settings.transitionEffect,
        transitionSpeed: settings.transitionSpeed,
        displayMode: settings.displayMode
      }
    });
  } catch (error) {
    console.error('[Viewer API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch images'
    });
  }
});

// ==================== 관리자 API ====================

/**
 * 이미지 목록 조회
 * GET /api/admin/images
 */
app.get('/api/admin/images', async function(req, res) {
  try {
    var images = await prisma.image.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      images: images
    });
  } catch (error) {
    console.error('[Admin API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch images'
    });
  }
});

/**
 * 이미지 업로드
 * POST /api/admin/upload
 */
app.post('/api/admin/upload', function(req, res) {
  var uploadDir = path.join(__dirname, 'public', 'uploads');
  
  // uploads 폴더가 없으면 생성
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  var form = new formidable.IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  form.parse(req, async function(err, fields, files) {
    if (err) {
      console.error('[Upload] Error:', err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }

    try {
      // formidable v3는 파일을 배열로 반환
      var file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      // UUID 생성
      var uuid = require('crypto').randomUUID();
      var filename = uuid + '.jpg';
      var filepath = path.join(uploadDir, filename);

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
      var metadata = await sharp(filepath).metadata();
      var stats = fs.statSync(filepath);

      // DB에 저장
      var image = await prisma.image.create({
        data: {
          originalName: file.originalFilename || 'unknown.jpg',
          filename: filename,
          url: '/uploads/' + filename,
          size: stats.size,
          width: metadata.width,
          height: metadata.height
        }
      });

      console.log('[Upload] Success:', filename);
      res.json({
        success: true,
        image: image
      });
    } catch (error) {
      console.error('[Upload] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

/**
 * 이미지 삭제
 * DELETE /api/admin/images/:id
 */
app.delete('/api/admin/images/:id', async function(req, res) {
  try {
    var imageId = parseInt(req.params.id);
    
    var image = await prisma.image.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // 파일 삭제
    var filepath = path.join(__dirname, 'public', image.url);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // DB에서 삭제
    await prisma.image.delete({
      where: { id: imageId }
    });

    console.log('[Delete] Success:', image.filename);
    res.json({
      success: true,
      message: 'Image deleted'
    });
  } catch (error) {
    console.error('[Delete] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 설정 조회
 * GET /api/admin/settings
 */
app.get('/api/admin/settings', async function(req, res) {
  try {
    var settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          slideDuration: 10000,
          transitionEffect: 'fade',
          transitionSpeed: 1000,
          displayMode: 'cover'
        }
      });
    }

    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('[Settings] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 설정 업데이트
 * PUT /api/admin/settings
 */
app.put('/api/admin/settings', async function(req, res) {
  try {
    var data = req.body;
    
    var settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        slideDuration: data.slideDuration || 10000,
        transitionEffect: data.transitionEffect || 'fade',
        transitionSpeed: data.transitionSpeed || 1000,
        displayMode: data.displayMode || 'cover'
      },
      create: {
        id: 1,
        slideDuration: data.slideDuration || 10000,
        transitionEffect: data.transitionEffect || 'fade',
        transitionSpeed: data.transitionSpeed || 1000,
        displayMode: data.displayMode || 'cover'
      }
    });

    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('[Settings Update] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== 정적 페이지 라우트 ====================

// 뷰어 (iPad mini 1세대용)
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

// 관리자 페이지 (모던 브라우저용)
app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ==================== 서버 시작 ====================

var PORT = process.env.PORT || 8754;
app.listen(PORT, '0.0.0.0', function() {
  console.log('===========================================');
  console.log('Digital Album Server (Vanilla JS)');
  console.log('===========================================');
  console.log('Server: http://0.0.0.0:' + PORT);
  console.log('Viewer: http://0.0.0.0:' + PORT + '/');
  console.log('Admin:  http://0.0.0.0:' + PORT + '/admin');
  console.log('===========================================');
});

// 프로세스 종료 처리
process.on('SIGINT', async function() {
  console.log('\nShutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

