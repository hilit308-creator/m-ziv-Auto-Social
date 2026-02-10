import { Router, Request, Response } from 'express';
import { ideasService } from '../services/ideas.service';

const router = Router();

router.get('/today', async (_req: Request, res: Response) => {
  try {
    const idea = await ideasService.getTodayIdea();

    return res.json({
      success: true,
      data: idea,
      message: 'רעיון לפוסט היום',
    });
  } catch (error: any) {
    console.error('Error getting today idea:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get idea',
    });
  }
});

router.post('/generate', async (_req: Request, res: Response) => {
  try {
    const idea = await ideasService.generateIdea();

    return res.json({
      success: true,
      data: idea,
      message: 'רעיון חדש נוצר',
    });
  } catch (error: any) {
    console.error('Error generating idea:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate idea',
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const used = req.query.used === 'true' ? true : req.query.used === 'false' ? false : undefined;
    const ideas = await ideasService.getAll(used);

    return res.json({
      success: true,
      data: ideas,
      count: ideas.length,
    });
  } catch (error: any) {
    console.error('Error fetching ideas:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ideas',
    });
  }
});

router.post('/:id/use', async (req: Request, res: Response) => {
  try {
    const success = await ideasService.markAsUsed(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Idea not found',
      });
    }

    return res.json({
      success: true,
      message: 'Idea marked as used',
    });
  } catch (error: any) {
    console.error('Error marking idea as used:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark idea as used',
    });
  }
});

export default router;
