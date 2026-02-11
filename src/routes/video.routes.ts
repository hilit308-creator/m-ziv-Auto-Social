import { Router, Request, Response } from 'express';
import { videoService } from '../services/video.service';

const router = Router();

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const configured = videoService.isConfigured();
    const provider = videoService.getConfiguredProvider();

    return res.json({
      success: true,
      data: {
        configured,
        provider,
        message: configured 
          ? `Video generation ready with ${provider}` 
          : 'No video provider configured. Add RUNWAY_API_KEY, PIKA_API_KEY, or REPLICATE_API_KEY',
        required_vars: ['RUNWAY_API_KEY', 'PIKA_API_KEY', 'REPLICATE_API_KEY'],
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, duration, aspect_ratio, style } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required',
      });
    }

    const result = await videoService.generateVideo({
      prompt,
      duration,
      aspect_ratio,
      style,
    });

    return res.json({
      success: true,
      data: result,
      message: 'Video generation started',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/generate/reel/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const result = await videoService.generateReelFromPost(postId);

    return res.json({
      success: true,
      data: result,
      message: 'Reel generation started from post',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/generate/story', async (req: Request, res: Response) => {
  try {
    const { topic, style } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'topic is required',
      });
    }

    const result = await videoService.generateStoryVideo(topic, style);

    return res.json({
      success: true,
      data: result,
      message: 'Story video generation started',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/status/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { provider } = req.query;

    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'provider query param is required',
      });
    }

    const result = await videoService.checkVideoStatus(videoId, provider);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/captions', async (req: Request, res: Response) => {
  try {
    const { video_url, text } = req.body;

    if (!video_url) {
      return res.status(400).json({
        success: false,
        error: 'video_url is required',
      });
    }

    const result = await videoService.addCaptions(video_url, text || '');

    return res.json({
      success: true,
      data: {
        video_url: result,
      },
      message: 'Captions added',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
