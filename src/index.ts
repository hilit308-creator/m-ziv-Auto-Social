import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { aiService } from './services/ai.service';
import { publishingService } from './services/publishing.service';
import mzivRoutes from './routes/mziv.routes';
import postsRoutes from './routes/posts.routes';
import profileRoutes from './routes/profile.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// M-Ziv AI Social routes
app.use('/api/v1', mzivRoutes);

// Posts management routes
app.use('/api/posts', postsRoutes);

// Profile management routes
app.use('/api/profile', profileRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'M-Ziv Auto Social API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      mziv: {
        caption: 'POST /api/v1/generate/caption',
        hashtags: 'POST /api/v1/generate/hashtags',
        title: 'POST /api/v1/generate/title',
        postPack: 'POST /api/v1/generate/post-pack (RECOMMENDED)',
        rewrite: 'POST /api/v1/rewrite',
      },
      posts: {
        create: 'POST /api/posts',
        list: 'GET /api/posts?status=draft',
        get: 'GET /api/posts/:id',
        update: 'PATCH /api/posts/:id',
        delete: 'DELETE /api/posts/:id',
        rewrite: 'POST /api/posts/:id/rewrite',
        next: 'GET /api/posts/next',
      },
      profile: {
        get: 'GET /api/profile',
        update: 'PATCH /api/profile',
      },
      ai: {
        generatePost: 'POST /api/ai/generate-post',
        generateHashtags: 'POST /api/ai/generate-hashtags',
        generateImage: 'POST /api/ai/generate-image',
        generateReply: 'POST /api/ai/generate-reply',
      },
      analytics: {
        bestTimes: 'GET /api/analytics/best-times',
      },
      shortcuts: {
        execute: 'POST /api/shortcuts/execute',
      },
    },
    documentation: 'See MZIV_API_DOCS.md for M-Ziv documentation',
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.post('/api/ai/generate-post', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, platform, tone, brandVoice, targetAudience } = req.body;

    if (!topic || !platform) {
      return res.status(400).json({
        error: 'Missing required fields: topic, platform',
      });
    }

    const result = await aiService.generatePost({
      topic,
      platform,
      tone,
      brandVoice,
      targetAudience,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/generate-hashtags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, platform, count } = req.body;

    if (!content || !platform) {
      return res.status(400).json({
        error: 'Missing required fields: content, platform',
      });
    }

    const hashtags = await aiService.generateHashtags({
      content,
      platform,
      count,
    });

    res.json({
      success: true,
      data: { hashtags },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/generate-image', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, style, size } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt',
      });
    }

    const imageUrl = await aiService.generateImage({
      prompt,
      style,
      size,
    });

    res.json({
      success: true,
      data: { imageUrl },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/generate-reply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comment, sentiment, brandVoice } = req.body;

    if (!comment) {
      return res.status(400).json({
        error: 'Missing required field: comment',
      });
    }

    const reply = await aiService.generateReply({
      comment,
      sentiment: sentiment || 'neutral',
      brandVoice: brandVoice || 'friendly and professional',
    });

    res.json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/posts/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, platforms, imageUrl, videoUrl, scheduleTime, hashtags } = req.body;

    if (!content || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({
        error: 'Missing required fields: content, platforms (array)',
      });
    }

    const results = await publishingService.publishEverywhere({
      content,
      platforms,
      imageUrl,
      videoUrl,
      scheduleTime: scheduleTime ? new Date(scheduleTime) : undefined,
      hashtags,
    });

    res.json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/posts/schedule', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, platforms, imageUrl, scheduleTime, hashtags } = req.body;

    if (!content || !platforms || !scheduleTime) {
      return res.status(400).json({
        error: 'Missing required fields: content, platforms, scheduleTime',
      });
    }

    const results = await publishingService.publishEverywhere({
      content,
      platforms,
      imageUrl,
      scheduleTime: new Date(scheduleTime),
      hashtags,
    });

    res.json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/analytics/best-times', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform } = req.query;

    if (!platform) {
      return res.status(400).json({
        error: 'Missing required query parameter: platform',
      });
    }

    const bestTimes = await publishingService.getBestPostingTimes(platform as string);

    res.json({
      success: true,
      data: { bestTimes },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/shortcuts/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortcutId, parameters } = req.body;

    if (!shortcutId) {
      return res.status(400).json({
        error: 'Missing required field: shortcutId',
      });
    }

    let result;

    switch (shortcutId) {
      case 'quick-post-creator':
        result = await aiService.generatePost({
          topic: parameters.topic,
          platform: parameters.platform || 'instagram',
          tone: parameters.tone || 'casual',
        });
        break;

      case 'publish-everywhere':
        result = await publishingService.publishEverywhere({
          content: parameters.content,
          platforms: parameters.platforms,
          imageUrl: parameters.imageUrl,
        });
        break;

      default:
        return res.status(404).json({
          error: `Unknown shortcut: ${shortcutId}`,
        });
    }

    res.json({
      success: true,
      shortcutId,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Auto Social API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
