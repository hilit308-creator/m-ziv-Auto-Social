import { Router, Request, Response, NextFunction } from 'express';
import { mediaService } from '../services/media.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../db/database';

const router = Router();

// Middleware for API key authentication (supports both Bearer and x-api-key)
const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = 
    req.headers['x-api-key'] as string ||
    req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== process.env.MZIV_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid or missing API key',
    });
  }
  
  next();
};

router.use(authenticateApiKey);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max for video
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${allowed.join(', ')}`));
    }
  },
});

// POST /media/upload - Upload file from Shortcut (multipart/form-data)
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided. Send a file with field name "file".',
      });
    }

    const { file } = req;
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    // Save to DB
    const media = await prisma.mediaUpload.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath: file.path,
        publicUrl,
      },
    });

    console.log(`[media] Uploaded ${file.originalname} (${(file.size / 1024 / 1024).toFixed(1)}MB) → ${media.id}`);

    return res.json({
      success: true,
      data: {
        media_id: media.id,
        media_url: publicUrl,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        metadata: {
          size_mb: +(file.size / 1024 / 1024).toFixed(2),
        },
      },
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file',
    });
  }
});

router.get('/status', async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      configured: mediaService.isReady(),
      provider: 'cloudinary',
    },
  });
});

router.post('/upload/url', async (req: Request, res: Response) => {
  try {
    const { url, folder, resource_type, post_id } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'url is required',
      });
    }

    const result = await mediaService.uploadFromUrl(url, {
      folder,
      resource_type,
      postId: post_id,
    });

    if (post_id) {
      await mediaService.attachToPost(post_id, result.secure_url, result.resource_type);
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload media',
    });
  }
});

router.post('/upload/base64', async (req: Request, res: Response) => {
  try {
    const { data, folder, resource_type, post_id } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'data (base64) is required',
      });
    }

    const result = await mediaService.uploadFromBase64(data, {
      folder,
      resource_type,
      postId: post_id,
    });

    if (post_id) {
      await mediaService.attachToPost(post_id, result.secure_url, result.resource_type);
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload media',
    });
  }
});

router.delete('/:publicId', async (req: Request, res: Response) => {
  try {
    const success = await mediaService.delete(req.params.publicId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Media not found or already deleted',
      });
    }

    return res.json({
      success: true,
      message: 'Media deleted',
    });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete media',
    });
  }
});

router.post('/attach', async (req: Request, res: Response) => {
  try {
    const { post_id, media_url, media_type } = req.body;

    if (!post_id || !media_url) {
      return res.status(400).json({
        success: false,
        error: 'post_id and media_url are required',
      });
    }

    await mediaService.attachToPost(post_id, media_url, media_type || 'image');

    return res.json({
      success: true,
      message: 'Media attached to post',
    });
  } catch (error: any) {
    console.error('Error attaching media:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to attach media',
    });
  }
});

export default router;
