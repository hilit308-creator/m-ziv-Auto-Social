import { Router, Request, Response } from 'express';
import { templatesService } from '../services/templates.service';
import { authenticate } from './user.routes';

const router = Router();

// Get all templates (default + user's)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { platform, category } = req.query;

    const templates = await templatesService.getTemplates(
      userId,
      platform as string,
      category as string
    );

    return res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get single template
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const template = await templatesService.getTemplate(req.params.id);

    return res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// Create template (authenticated)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, platform, category, template, variables } = req.body;

    if (!name || !platform || !category || !template) {
      return res.status(400).json({
        success: false,
        error: 'name, platform, category, and template are required',
      });
    }

    const result = await templatesService.createTemplate({
      name,
      platform,
      category,
      template,
      variables,
      userId,
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Template created',
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Update template (authenticated)
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const result = await templatesService.updateTemplate(req.params.id, userId, req.body);

    return res.json({
      success: true,
      data: result,
      message: 'Template updated',
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete template (authenticated)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await templatesService.deleteTemplate(req.params.id, userId);

    return res.json({
      success: true,
      message: 'Template deleted',
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Seed default templates
router.post('/seed', async (_req: Request, res: Response) => {
  try {
    const result = await templatesService.seedDefaultTemplates();

    return res.json({
      success: true,
      data: result,
      message: 'Default templates seeded',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
