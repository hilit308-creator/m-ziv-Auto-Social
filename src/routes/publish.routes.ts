import { Router, Request, Response } from 'express';
import { autoPublishService } from '../services/auto-publish.service';

const router = Router();

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
