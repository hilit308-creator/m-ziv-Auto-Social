import { Router, Request, Response } from 'express';
import { autoReplyService, Comment } from '../services/auto-reply.service';

const router = Router();

router.get('/config', async (_req: Request, res: Response) => {
  try {
    const config = autoReplyService.getConfig();

    return res.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error('Error getting auto-reply config:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get config',
    });
  }
});

router.patch('/config', async (req: Request, res: Response) => {
  try {
    const config = autoReplyService.updateConfig(req.body);

    return res.json({
      success: true,
      data: config,
      message: 'הגדרות עודכנו בהצלחה',
    });
  } catch (error: any) {
    console.error('Error updating auto-reply config:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update config',
    });
  }
});

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.text) {
      return res.status(400).json({
        success: false,
        error: 'comment with text is required',
      });
    }

    const commentData: Comment = {
      id: comment.id || 'temp-' + Date.now(),
      platform: comment.platform || 'instagram',
      post_id: comment.post_id || '',
      author: comment.author || 'unknown',
      text: comment.text,
      created_at: new Date(comment.created_at || Date.now()),
    };

    const result = await autoReplyService.analyzeComment(commentData);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error analyzing comment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze comment',
    });
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.text) {
      return res.status(400).json({
        success: false,
        error: 'comment with text is required',
      });
    }

    const commentData: Comment = {
      id: comment.id || 'temp-' + Date.now(),
      platform: comment.platform || 'instagram',
      post_id: comment.post_id || '',
      author: comment.author || 'unknown',
      text: comment.text,
      created_at: new Date(comment.created_at || Date.now()),
    };

    const reply = await autoReplyService.generateReply(commentData);

    return res.json({
      success: true,
      data: {
        original_comment: comment.text,
        generated_reply: reply,
      },
    });
  } catch (error: any) {
    console.error('Error generating reply:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate reply',
    });
  }
});

router.get('/faq', async (_req: Request, res: Response) => {
  try {
    const faq = await autoReplyService.getCommonQuestions();

    return res.json({
      success: true,
      data: faq,
    });
  } catch (error: any) {
    console.error('Error getting FAQ:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get FAQ',
    });
  }
});

export default router;
