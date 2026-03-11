import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { aiService } from './services/ai.service';
import { publishingService } from './services/publishing.service';
import mzivRoutes from './routes/mziv.routes';
import assistantRoutes from './routes/assistant.routes';
import postsRoutes from './routes/posts.routes';
import profileRoutes from './routes/profile.routes';
import ideasRoutes from './routes/ideas.routes';
import mediaRoutes from './routes/media.routes';
import calendarRoutes from './routes/calendar.routes';
import schedulerRoutes from './routes/scheduler.routes';
import authRoutes from './routes/auth.routes';
import publishRoutes from './routes/publish.routes';
import analyticsRoutes from './routes/analytics.routes';
import reportsRoutes from './routes/reports.routes';
import autoReplyRoutes from './routes/auto-reply.routes';
import videoRoutes from './routes/video.routes';
import twitterRoutes from './routes/twitter.routes';
import userRoutes from './routes/user.routes';
import templatesRoutes from './routes/templates.routes';
import auditRoutes from './routes/audit.routes';
import spamRoutes from './routes/spam.routes';
import connectRoutes from './routes/connect.routes';
import path from 'path';

import fs from 'fs';

dotenv.config();

// Ensure SQLite data directory exists (important for Railway volumes)
const dbUrl = process.env.DATABASE_URL || '';
const dbMatch = dbUrl.match(/file:(.*)/);
if (dbMatch) {
  const dbDir = path.dirname(dbMatch[1]);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`📁 Created database directory: ${dbDir}`);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500'),
  message: { success: false, error: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);

// Request timeout (60s for most, 120s for upload/publish)
app.use((req: Request, res: Response, next: NextFunction) => {
  const timeout = (req.path.includes('/upload') || req.path.includes('/publish')) ? 120000 : 60000;
  req.setTimeout(timeout);
  res.setTimeout(timeout);
  next();
});

// Request logging middleware
app.use('/api/', (req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[API] ${timestamp} ${req.method} ${req.originalUrl}`);
  next();
});

// OAuth Connect routes (for Shortcut) — MUST be before mzivRoutes to avoid auth on callbacks
app.use('/api/v1/connect', connectRoutes);

// M-Ziv AI Social routes
app.use('/api/v1', mzivRoutes);

// Posts management routes
app.use('/api/posts', postsRoutes);

// Profile management routes
app.use('/api/profile', profileRoutes);

// Ideas/content suggestions routes
app.use('/api/ideas', ideasRoutes);

// Media upload routes
app.use('/api/media', mediaRoutes);

// Calendar routes
app.use('/api/calendar', calendarRoutes);

// Scheduler routes
app.use('/api/scheduler', schedulerRoutes);

// Social auth routes
app.use('/api/auth', authRoutes);

// Auto-publish routes
app.use('/api/publish', publishRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Reports routes
app.use('/api/reports', reportsRoutes);

// Auto-reply routes
app.use('/api/auto-reply', autoReplyRoutes);

// Video generation routes
app.use('/api/video', videoRoutes);

// Twitter/X routes
app.use('/api/twitter', twitterRoutes);

// User auth routes
app.use('/api/users', userRoutes);

// Templates routes
app.use('/api/templates', templatesRoutes);

// Audit logs routes
app.use('/api/audit', auditRoutes);

// Spam filter routes
app.use('/api/spam', spamRoutes);

// AI Personal Assistant routes
app.use('/api/assistant', assistantRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'M-Ziv Auto Social API',
    version: '2.0.0',
    status: 'running',
    shortcut_endpoints: {
      connect: {
        status: 'GET /api/v1/connect/status',
        start: 'GET /api/v1/connect/:provider/start',
        callback: 'GET /api/v1/connect/:provider/callback',
        disconnect: 'POST /api/v1/connect/:provider/disconnect',
      },
      media: {
        upload: 'POST /api/media/upload (multipart, field=file)',
      },
      publish: {
        all: 'POST /api/publish/all',
        jobStatus: 'GET /api/publish/job-status?job_id=X',
      },
      generate: {
        postPack: 'POST /api/v1/generate/post-pack',
        dailyIdea: 'GET /api/assistant/daily-idea',
      },
    },
    all_endpoints: {
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
        versions: 'GET /api/posts/:id/versions',
        restore: 'POST /api/posts/:id/versions/:num/restore',
      },
      profile: {
        get: 'GET /api/profile',
        update: 'PATCH /api/profile',
      },
      ideas: {
        today: 'GET /api/ideas/today',
        generate: 'POST /api/ideas/generate',
        list: 'GET /api/ideas?used=false',
        markUsed: 'POST /api/ideas/:id/use',
      },
      media: {
        status: 'GET /api/media/status',
        uploadUrl: 'POST /api/media/upload/url',
        uploadBase64: 'POST /api/media/upload/base64',
        attach: 'POST /api/media/attach',
        delete: 'DELETE /api/media/:publicId',
      },
      calendar: {
        week: 'GET /api/calendar/week',
        month: 'GET /api/calendar/month/:year/:month',
        scheduled: 'GET /api/calendar/scheduled',
        upcoming: 'GET /api/calendar/upcoming',
        schedule: 'POST /api/calendar/schedule/:postId',
        unschedule: 'POST /api/calendar/unschedule/:postId',
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
      assistant: {
        energyProfile: {
          get: 'GET /api/assistant/energy-profile',
          update: 'PATCH /api/assistant/energy-profile',
          batchSuggest: 'POST /api/assistant/batch-suggest',
        },
        voiceFirst: {
          createPost: 'POST /api/assistant/voice-post',
        },
        ideas: {
          capture: 'POST /api/assistant/ideas/capture',
          list: 'GET /api/assistant/ideas',
          convertToPost: 'POST /api/assistant/ideas/convert-to-post',
        },
        recycling: {
          suggestions: 'GET /api/assistant/recycling-suggestions',
          recycle: 'POST /api/assistant/recycle-post',
        },
        learning: {
          styleProfile: 'GET /api/assistant/style-profile',
          updateStyle: 'PATCH /api/assistant/style-profile',
          feedback: 'POST /api/assistant/feedback',
          trainVoice: 'POST /api/assistant/train-voice',
        },
        wellbeing: {
          burnoutStatus: 'GET /api/assistant/burnout-status',
          dailyIdea: 'GET /api/assistant/daily-idea',
        },
        replies: {
          suggest: 'POST /api/assistant/reply-suggest',
        },
        momMode: {
          getData: 'GET /api/assistant/mom-mode',
        },
        privacy: {
          deleteData: 'DELETE /api/assistant/user-data',
          updateConsent: 'PATCH /api/assistant/privacy-consent',
        },
      },
    },
    documentation: 'See MZIV_API_DOCS.md for M-Ziv documentation',
  });
});

app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Quick DB check
    const dbOk = await import('./db/database').then(m => m.default.$queryRaw`SELECT 1`).then(() => true).catch(() => false);
    
    // Quick connect status
    const prisma = (await import('./db/database')).default;
    const connectedCount = await prisma.socialAccount.count({ where: { isActive: true } }).catch(() => 0);

    res.json({
      status: dbOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: dbOk ? 'ok' : 'error',
      connected_platforms: connectedCount,
    });
  } catch {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
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
