import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireUser } from '../middleware/auth';

const router = express.Router();

// 配置multer用于文件上传
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 单文件上传
router.post('/single', authenticateToken, requireUser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${timestamp}_${randomString}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // 保存文件到本地
    fs.writeFileSync(filePath, req.file.buffer);

    // 返回文件信息
    const fileUrl = `/uploads/${fileName}`;
    
    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload single file error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '文件上传失败'
    });
  }
});

// 多文件上传
router.post('/multiple', authenticateToken, requireUser, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const files = req.files as Express.Multer.File[];
    const uploadedFiles = [];

    for (const file of files) {
      // 生成唯一文件名
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const fileName = `${timestamp}_${randomString}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // 保存文件到本地
      fs.writeFileSync(filePath, file.buffer);

      uploadedFiles.push({
        url: `/uploads/${fileName}`,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });
    }

    res.json({
      success: true,
      message: `成功上传${uploadedFiles.length}张图片`,
      data: {
        files: uploadedFiles
      }
    });
  } catch (error) {
    console.error('Upload multiple files error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '文件上传失败'
    });
  }
});

// 删除文件
router.delete('/:fileName', authenticateToken, requireUser, async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // 验证文件名安全性
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: '无效的文件名'
      });
    }

    const filePath = path.join(uploadDir, fileName);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    // 删除文件
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: '文件删除失败'
    });
  }
});

// 获取文件信息
router.get('/info/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // 验证文件名安全性
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: '无效的文件名'
      });
    }

    const filePath = path.join(uploadDir, fileName);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    // 获取文件信息
    const stats = fs.statSync(filePath);
    
    res.json({
      success: true,
      data: {
        fileName,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: '获取文件信息失败'
    });
  }
});

export default router;