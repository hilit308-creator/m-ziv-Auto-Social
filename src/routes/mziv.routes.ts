import { Router, Request, Response, NextFunction } from 'express';
import { mzivService } from '../services/mziv.service';

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

// Apply authentication to all M-Ziv routes
router.use(authenticateApiKey);

// 1. Generate Caption
router.post('/generate/caption', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mzivService.generateCaption(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// 2. Generate Hashtags
router.post('/generate/hashtags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mzivService.generateHashtags(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// 3. Generate Title
router.post('/generate/title', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mzivService.generateTitle(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// 4. Generate Post Pack (All-in-One) - RECOMMENDED FOR SHORTCUTS
router.post('/generate/post-pack', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { video_description } = req.body;
    if (!video_description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: video_description',
      });
    }
    const result = await mzivService.generatePostPack(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// 5. Rewrite Text
router.post('/rewrite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, command } = req.body;
    if (!text || !command) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: text, command',
        valid_commands: ['shorter', 'more_professional', 'warmer', 'add_cta', 'linkedin_style', 'tiktok_style', 'instagram_style', 'youtube_style'],
      });
    }
    const result = await mzivService.rewriteText(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
