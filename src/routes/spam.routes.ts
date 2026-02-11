import { Router, Request, Response } from 'express';
import { spamService } from '../services/spam.service';

const router = Router();

// Check single comment for spam
router.post('/check', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required',
      });
    }

    const result = await spamService.checkSpam(text);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Analyze comment (spam + sentiment)
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        error: 'comment is required',
      });
    }

    const result = await spamService.analyzeComment(comment);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Bulk check comments
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { comments } = req.body;

    if (!comments || !Array.isArray(comments)) {
      return res.status(400).json({
        success: false,
        error: 'comments array is required',
      });
    }

    const results = await spamService.bulkCheck(comments);

    return res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get spam keywords
router.get('/keywords', async (_req: Request, res: Response) => {
  try {
    const keywords = spamService.getSpamKeywords();

    return res.json({
      success: true,
      data: keywords,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add spam keyword
router.post('/keywords', async (req: Request, res: Response) => {
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'keyword is required',
      });
    }

    spamService.addSpamKeyword(keyword);

    return res.json({
      success: true,
      message: 'Keyword added',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Remove spam keyword
router.delete('/keywords/:keyword', async (req: Request, res: Response) => {
  try {
    spamService.removeSpamKeyword(req.params.keyword);

    return res.json({
      success: true,
      message: 'Keyword removed',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
