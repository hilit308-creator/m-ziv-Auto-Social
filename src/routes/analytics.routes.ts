import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

const router = Router();

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await analyticsService.getOverallStats(days);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error getting analytics overview:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get analytics',
    });
  }
});

router.get('/posts-per-day', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const data = await analyticsService.getPostsPerDay(days);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error getting posts per day:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get posts per day',
    });
  }
});

router.get('/platform-distribution', async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getPlatformDistribution();

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error getting platform distribution:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get platform distribution',
    });
  }
});

router.get('/top-topics', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const data = await analyticsService.getTopTopics(limit);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error getting top topics:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get top topics',
    });
  }
});

router.get('/by-status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const validStatuses = ['draft', 'scheduled', 'published', 'failed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    const data = await analyticsService.getPostsByStatus(status);

    return res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Error getting posts by status:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get posts by status',
    });
  }
});

export default router;
