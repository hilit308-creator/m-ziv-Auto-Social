import { Router, Request, Response } from 'express';
import { schedulerService } from '../services/scheduler.service';

const router = Router();

router.get('/queue', async (_req: Request, res: Response) => {
  try {
    const posts = await schedulerService.getPublishQueue();

    return res.json({
      success: true,
      data: posts,
      count: posts.length,
      message: 'פוסטים בתור לפרסום בשעה הקרובה',
    });
  } catch (error: any) {
    console.error('Error fetching queue:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch queue',
    });
  }
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const posts = await schedulerService.getPostsToPublish();

    return res.json({
      success: true,
      data: posts,
      count: posts.length,
      message: 'פוסטים מוכנים לפרסום עכשיו',
    });
  } catch (error: any) {
    console.error('Error fetching ready posts:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ready posts',
    });
  }
});

router.post('/:postId/retry', async (req: Request, res: Response) => {
  try {
    const success = await schedulerService.retryFailed(req.params.postId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    return res.json({
      success: true,
      message: 'Post scheduled for retry in 5 minutes',
    });
  } catch (error: any) {
    console.error('Error retrying post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retry post',
    });
  }
});

export default router;
