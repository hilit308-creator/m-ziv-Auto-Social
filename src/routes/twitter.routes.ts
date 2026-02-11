import { Router, Request, Response } from 'express';
import { twitterService } from '../services/twitter.service';

const router = Router();

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const configured = twitterService.isConfigured();

    return res.json({
      success: true,
      data: {
        configured,
        message: configured 
          ? 'Twitter/X is configured and ready' 
          : 'Twitter/X not configured. Add API keys to environment.',
        required_vars: twitterService.getRequiredEnvVars(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/tweet', async (req: Request, res: Response) => {
  try {
    const { text, media_ids } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required',
      });
    }

    const result = await twitterService.postTweet({ text, media_ids });

    return res.json({
      success: true,
      data: result,
      message: 'Tweet posted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/thread', async (req: Request, res: Response) => {
  try {
    const { tweets } = req.body;

    if (!tweets || !Array.isArray(tweets) || tweets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'tweets array is required',
      });
    }

    const results = await twitterService.postThread(tweets);

    return res.json({
      success: true,
      data: results,
      message: 'Thread posted',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/upload-media', async (req: Request, res: Response) => {
  try {
    const { media_url } = req.body;

    if (!media_url) {
      return res.status(400).json({
        success: false,
        error: 'media_url is required',
      });
    }

    const mediaId = await twitterService.uploadMedia(media_url);

    return res.json({
      success: true,
      data: { media_id: mediaId },
      message: 'Media uploaded',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/me', async (_req: Request, res: Response) => {
  try {
    const user = await twitterService.getMe();

    return res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
