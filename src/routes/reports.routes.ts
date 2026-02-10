import { Router, Request, Response } from 'express';
import { reportsService } from '../services/reports.service';

const router = Router();

router.get('/daily', async (req: Request, res: Response) => {
  try {
    const dateStr = req.query.date as string;
    const date = dateStr ? new Date(dateStr) : undefined;
    
    const report = await reportsService.getDailyReport(date);

    return res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Error getting daily report:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get daily report',
    });
  }
});

router.get('/weekly', async (req: Request, res: Response) => {
  try {
    const startStr = req.query.start as string;
    const startDate = startStr ? new Date(startStr) : undefined;
    
    const report = await reportsService.getWeeklyReport(startDate);

    return res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Error getting weekly report:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get weekly report',
    });
  }
});

router.get('/monthly/:year/:month', async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year or month',
      });
    }

    const report = await reportsService.getMonthlyReport(year, month);

    return res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Error getting monthly report:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get monthly report',
    });
  }
});

export default router;
