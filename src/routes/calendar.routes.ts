import { Router, Request, Response } from 'express';
import { calendarService } from '../services/calendar.service';

const router = Router();

router.get('/week', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.start ? new Date(req.query.start as string) : undefined;
    const week = await calendarService.getWeek(startDate);

    return res.json({
      success: true,
      data: week,
    });
  } catch (error: any) {
    console.error('Error fetching week:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch week',
    });
  }
});

router.get('/month/:year/:month', async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year or month',
      });
    }

    const days = await calendarService.getMonth(year, month);

    return res.json({
      success: true,
      data: {
        year,
        month,
        days,
      },
    });
  } catch (error: any) {
    console.error('Error fetching month:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch month',
    });
  }
});

router.get('/scheduled', async (_req: Request, res: Response) => {
  try {
    const posts = await calendarService.getScheduledPosts();

    return res.json({
      success: true,
      data: posts,
      count: posts.length,
    });
  } catch (error: any) {
    console.error('Error fetching scheduled posts:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch scheduled posts',
    });
  }
});

router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const posts = await calendarService.getUpcoming(limit);

    return res.json({
      success: true,
      data: posts,
      count: posts.length,
    });
  } catch (error: any) {
    console.error('Error fetching upcoming posts:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch upcoming posts',
    });
  }
});

router.post('/schedule/:postId', async (req: Request, res: Response) => {
  try {
    const { scheduled_at } = req.body;

    if (!scheduled_at) {
      return res.status(400).json({
        success: false,
        error: 'scheduled_at is required',
      });
    }

    const scheduledDate = new Date(scheduled_at);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
    }

    const success = await calendarService.schedulePost(req.params.postId, scheduledDate);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    return res.json({
      success: true,
      message: 'Post scheduled',
      scheduled_at: scheduledDate,
    });
  } catch (error: any) {
    console.error('Error scheduling post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to schedule post',
    });
  }
});

router.post('/unschedule/:postId', async (req: Request, res: Response) => {
  try {
    const success = await calendarService.unschedulePost(req.params.postId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    return res.json({
      success: true,
      message: 'Post unscheduled, moved back to drafts',
    });
  } catch (error: any) {
    console.error('Error unscheduling post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to unschedule post',
    });
  }
});

export default router;
