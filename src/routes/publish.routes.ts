import { Router, Request, Response, NextFunction } from 'express';
import { autoPublishService } from '../services/auto-publish.service';
import prisma from '../db/database';
import { mzivService } from '../services/mziv.service';
import { oauthService } from '../services/oauth.service';

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

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await autoPublishService.getPublishingStatus();

    return res.json({
      success: true,
      data: status,
      message: status.configured.length > 0 
        ? `${status.configured.length} פלטפורמות מוגדרות` 
        : 'לא הוגדרו פלטפורמות לפרסום',
    });
  } catch (error: any) {
    console.error('Error getting publish status:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get publish status',
    });
  }
});

// POST /publish/all - Publish to all connected platforms (Shortcut main endpoint)
router.post('/all', async (req: Request, res: Response) => {
  try {
    const { media_id, video_description, targets, schedule_time } = req.body;

    if (!video_description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: video_description',
      });
    }

    // Determine target platforms
    const defaultTargets = ['instagram', 'facebook_page', 'tiktok', 'youtube'];
    const requestedTargets = targets || defaultTargets;

    // Check which platforms are connected
    const connectedAccounts = await prisma.socialAccount.findMany({
      where: { isActive: true, platform: { in: requestedTargets } },
    });
    const connectedPlatforms = connectedAccounts.map(a => a.platform);

    // Build initial platform statuses
    const platformStatuses: Record<string, any> = {};
    for (const target of requestedTargets) {
      if (connectedPlatforms.includes(target)) {
        platformStatuses[target] = { status: 'queued', url: null, error: null, message: null };
      } else {
        platformStatuses[target] = { status: 'skipped', url: null, error: 'not_connected', message: `${target} לא מחובר — חברי אותו קודם` };
      }
    }

    // Generate content with post-pack
    let postPack: any = null;
    try {
      postPack = await mzivService.generatePostPack({ video_description });
    } catch (e: any) {
      console.error('[publish/all] Failed to generate post-pack:', e.message);
    }

    // Get media info if provided
    let mediaUrl: string | null = null;
    if (media_id) {
      const media = await prisma.mediaUpload.findUnique({ where: { id: media_id } });
      if (media) {
        mediaUrl = media.publicUrl;
      }
    }

    // Create publish job
    const job = await prisma.publishJob.create({
      data: {
        mediaId: media_id || null,
        postId: postPack?.post_id || null,
        videoDescription: video_description,
        platformStatuses: JSON.stringify(platformStatuses),
        status: 'processing',
        scheduledAt: schedule_time ? new Date(schedule_time) : null,
      },
    });

    // If scheduled for later, just return the job
    if (schedule_time) {
      return res.json({
        success: true,
        data: {
          job_id: job.id,
          scheduled_at: schedule_time,
          targets: platformStatuses,
        },
      });
    }

    // Publish to each connected platform (async, non-blocking)
    (async () => {
      for (const account of connectedAccounts) {
        const platform = account.platform;
        try {
          // Auto-refresh token if expired
          let accessToken = account.accessToken;
          if (account.tokenExpiry && account.tokenExpiry < new Date()) {
            if (account.refreshToken) {
              const refreshPlatform = platform === 'facebook_page' ? 'facebook' : platform;
              const newTokens = await oauthService.refreshAccessToken(refreshPlatform, account.refreshToken);
              if (newTokens) {
                accessToken = newTokens.access_token;
                const newExpiry = newTokens.expires_in ? new Date(Date.now() + newTokens.expires_in * 1000) : null;
                await prisma.socialAccount.update({
                  where: { id: account.id },
                  data: {
                    accessToken: newTokens.access_token,
                    refreshToken: newTokens.refresh_token || account.refreshToken,
                    tokenExpiry: newExpiry,
                  },
                });
                console.log(`[publish] Refreshed token for ${platform}`);
              } else {
                platformStatuses[platform] = { status: 'failed', url: null, error: 'reauth_required', message: 'הטוקן פג תוקף — צריך להתחבר מחדש' };
                await prisma.publishJob.update({
                  where: { id: job.id },
                  data: { platformStatuses: JSON.stringify(platformStatuses) },
                });
                continue;
              }
            } else {
              platformStatuses[platform] = { status: 'failed', url: null, error: 'expired_token', message: 'הטוקן פג תוקף ואין refresh token' };
              await prisma.publishJob.update({
                where: { id: job.id },
                data: { platformStatuses: JSON.stringify(platformStatuses) },
              });
              continue;
            }
          }

          platformStatuses[platform] = { status: 'publishing', url: null, error: null };
          await prisma.publishJob.update({
            where: { id: job.id },
            data: { platformStatuses: JSON.stringify(platformStatuses) },
          });

          const result = await autoPublishService.publishToPlatformWithToken(
            platform,
            accessToken,
            account.accountId,
            {
              caption: postPack?.by_platform?.[platform === 'facebook_page' ? 'facebook' : platform]?.caption || video_description,
              hashtags: postPack?.by_platform?.[platform === 'facebook_page' ? 'facebook' : platform]?.hashtags || [],
              title: postPack?.by_platform?.youtube?.title,
              description: postPack?.by_platform?.youtube?.description,
              mediaUrl,
            }
          );

          if (result.success) {
            platformStatuses[platform] = { status: 'published', url: result.post_url || null, error: null, message: 'פורסם בהצלחה ✅' };
          } else {
            platformStatuses[platform] = { status: 'failed', url: null, error: result.error || 'unknown_error', message: `נכשל: ${result.error}` };
          }
        } catch (e: any) {
          platformStatuses[platform] = { status: 'failed', url: null, error: e.message, message: `שגיאה: ${e.message}` };
        }

        await prisma.publishJob.update({
          where: { id: job.id },
          data: { platformStatuses: JSON.stringify(platformStatuses) },
        });
      }

      // Update overall status
      const allStatuses = Object.values(platformStatuses).map((s: any) => s.status);
      const hasPublished = allStatuses.includes('published');
      const hasFailed = allStatuses.includes('failed');
      let overallStatus = 'completed';
      if (hasFailed && hasPublished) overallStatus = 'partial_failure';
      else if (hasFailed && !hasPublished) overallStatus = 'failed';

      await prisma.publishJob.update({
        where: { id: job.id },
        data: { status: overallStatus, platformStatuses: JSON.stringify(platformStatuses) },
      });

      console.log(`[publish/all] Job ${job.id} completed: ${overallStatus}`);
    })();

    return res.json({
      success: true,
      data: {
        job_id: job.id,
        targets: platformStatuses,
        post_pack: postPack ? {
          hook: postPack.hook,
          caption: postPack.caption,
          hashtags: postPack.hashtags,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Error in publish/all:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to start publishing',
    });
  }
});

// GET /publish/status?job_id=X - Poll publish job status
router.get('/job-status', async (req: Request, res: Response) => {
  try {
    const jobId = req.query.job_id as string;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: job_id',
      });
    }

    const job = await prisma.publishJob.findUnique({ where: { id: jobId } });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    const platformStatuses = JSON.parse(job.platformStatuses);

    // Build Shortcut-friendly summary
    const entries = Object.entries(platformStatuses);
    const published = entries.filter(([, v]: any) => (v as any).status === 'published');
    const failed = entries.filter(([, v]: any) => (v as any).status === 'failed');
    const pending = entries.filter(([, v]: any) => ['queued', 'publishing'].includes((v as any).status));
    const skipped = entries.filter(([, v]: any) => (v as any).status === 'skipped');
    const done = pending.length === 0;

    // Build display lines for Shortcut
    const displayLines = entries.map(([platform, info]: any) => {
      const icon = info.status === 'published' ? '✅' : info.status === 'failed' ? '❌' : info.status === 'skipped' ? '⏭️' : '⏳';
      const urlPart = info.url ? ` → ${info.url}` : '';
      const errorPart = info.error && info.status === 'failed' ? ` (${info.error})` : '';
      return `${icon} ${platform}${urlPart}${errorPart}`;
    });

    return res.json({
      success: true,
      data: {
        job_id: job.id,
        status: job.status,
        done,
        platforms: platformStatuses,
        summary: {
          published: published.length,
          failed: failed.length,
          pending: pending.length,
          skipped: skipped.length,
          total: entries.length,
        },
        display: displayLines.join('\n'),
        links: published.map(([platform, info]: any) => ({ platform, url: (info as any).url })).filter((l: any) => l.url),
        created_at: job.createdAt,
        updated_at: job.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error getting job status:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get job status',
    });
  }
});

router.post('/:postId', async (req: Request, res: Response) => {
  try {
    const results = await autoPublishService.publishPost(req.params.postId);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return res.json({
      success: failCount === 0,
      data: {
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failCount,
        },
      },
      message: failCount === 0 
        ? 'פורסם בהצלחה לכל הפלטפורמות' 
        : `פורסם ל-${successCount} פלטפורמות, נכשל ב-${failCount}`,
    });
  } catch (error: any) {
    console.error('Error publishing post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to publish post',
    });
  }
});

router.post('/process/scheduled', async (_req: Request, res: Response) => {
  try {
    const result = await autoPublishService.processScheduledPosts();

    return res.json({
      success: true,
      data: result,
      message: result.processed > 0 
        ? `עובדו ${result.processed} פוסטים מתוזמנים` 
        : 'אין פוסטים לפרסום כרגע',
    });
  } catch (error: any) {
    console.error('Error processing scheduled posts:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process scheduled posts',
    });
  }
});

export default router;
