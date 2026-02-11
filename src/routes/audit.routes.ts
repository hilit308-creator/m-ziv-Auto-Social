import { Router, Request, Response } from 'express';
import { auditService } from '../services/audit.service';
import { authenticate } from './user.routes';

const router = Router();

// Get audit logs (authenticated, admin only in production)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      action,
      resource,
      startDate,
      endDate,
      limit,
      offset,
    } = req.query;

    const logs = await auditService.getLogs({
      action: action as string,
      resource: resource as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : 100,
      offset: offset ? parseInt(offset as string) : 0,
    });

    return res.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get my audit logs
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { limit, offset } = req.query;

    const logs = await auditService.getLogs({
      userId,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    return res.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get audit stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { days } = req.query;

    const stats = await auditService.getStats(
      userId,
      days ? parseInt(days as string) : 30
    );

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Cleanup old logs (admin only)
router.post('/cleanup', authenticate, async (req: Request, res: Response) => {
  try {
    const { daysToKeep } = req.body;
    const result = await auditService.cleanup(daysToKeep || 90);

    return res.json({
      success: true,
      data: result,
      message: `Deleted ${result.deleted} old log entries`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
