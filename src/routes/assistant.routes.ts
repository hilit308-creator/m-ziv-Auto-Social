import { Router, Request, Response, NextFunction } from 'express';
import { assistantService } from '../services/assistant.service';

const router = Router();

// Middleware for API key authentication
const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== process.env.MZIV_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid or missing API key',
    });
  }
  
  next();
};

// Helper to get userId from request (in production, this would come from auth token)
const getUserId = (req: Request): string => {
  return req.headers['x-user-id'] as string || 'default-user';
};

// Apply authentication to all assistant routes
router.use(authenticateApiKey);

// ============================================
// Component 1: Energy Mode
// ============================================

// GET /assistant/energy-profile - Get user's energy profile
router.get('/energy-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const profile = await assistantService.getEnergyProfile(userId);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /assistant/energy-profile - Update energy profile
router.patch('/energy-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const profile = await assistantService.updateEnergyProfile(userId, req.body);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// POST /assistant/batch-suggest - Get batch creation suggestions
router.post('/batch-suggest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const suggestion = await assistantService.getBatchSuggestion(userId);
    res.json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Component 2: Voice First Creation
// ============================================

// POST /assistant/voice-post - Create post from voice input
router.post('/voice-post', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { audioUrl, transcript, platforms } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: transcript',
      });
    }

    const result = await assistantService.createVoicePost({
      userId,
      audioUrl,
      transcript,
      platforms,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Component 3: Idea Capture Library
// ============================================

// POST /ideas/capture - Capture a new idea
router.post('/ideas/capture', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { inputType, content, tags } = req.body;

    if (!inputType || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: inputType, content',
      });
    }

    const idea = await assistantService.captureIdea({
      userId,
      inputType,
      content,
      tags,
    });

    res.json({
      success: true,
      data: idea,
    });
  } catch (error) {
    next(error);
  }
});

// GET /ideas - Get all ideas
router.get('/ideas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { status } = req.query;
    const ideas = await assistantService.getIdeas(userId, status as string);
    res.json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    next(error);
  }
});

// POST /ideas/convert-to-post - Convert idea to post
router.post('/ideas/convert-to-post', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { ideaId, platforms } = req.body;

    if (!ideaId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: ideaId',
      });
    }

    const postPack = await assistantService.convertIdeaToPost(userId, ideaId, platforms);
    res.json({
      success: true,
      data: postPack,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Component 4: Smart Content Recycling
// ============================================

// GET /assistant/recycling-suggestions - Get recycling suggestions
router.get('/recycling-suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const suggestions = await assistantService.getRecyclingSuggestions(userId);
    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
});

// POST /assistant/recycle-post - Recycle a post
router.post('/recycle-post', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId, suggestionType, targetPlatform } = req.body;

    if (!postId || !suggestionType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: postId, suggestionType',
      });
    }

    const result = await assistantService.recyclePost(postId, suggestionType, targetPlatform);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Component 5: Personal Learning Engine
// ============================================

// GET /assistant/style-profile - Get user's style profile
router.get('/style-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const profile = await assistantService.getStyleProfile(userId);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /assistant/style-profile - Update style profile
router.patch('/style-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const profile = await assistantService.updateStyleProfile(userId, req.body);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// POST /assistant/feedback - Submit feedback for learning
router.post('/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { postId, contentType, originalContent, editedContent, feedbackType } = req.body;

    if (!contentType || !originalContent || !feedbackType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contentType, originalContent, feedbackType',
      });
    }

    await assistantService.submitFeedback(userId, {
      postId,
      contentType,
      originalContent,
      editedContent,
      feedbackType,
    });

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Component 7: Burnout Protection
// ============================================

// GET /assistant/burnout-status - Get burnout status
router.get('/burnout-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const status = await assistantService.getBurnoutStatus(userId);
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Component 8: Daily Idea Generator
// ============================================

// GET /assistant/daily-idea - Get daily filming idea
router.get('/daily-idea', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idea = await assistantService.generateDailyIdea();
    res.json({
      success: true,
      data: idea,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Component 9: Comment & Message Reply AI
// ============================================

// POST /assistant/reply-suggest - Get reply suggestion
router.post('/reply-suggest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comment, platform, context } = req.body;

    if (!comment || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: comment, platform',
      });
    }

    const suggestion = await assistantService.suggestReply({
      comment,
      platform,
      context,
    });

    res.json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Component 10: Personal Voice Cloning
// ============================================

// POST /assistant/train-voice - Train voice model
router.post('/train-voice', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await assistantService.trainVoiceModel(userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Mom Mode UI
// ============================================

// GET /assistant/mom-mode - Get all data needed for Mom Mode UI
router.get('/mom-mode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const data = await assistantService.getMomModeData(userId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Privacy & Data Management
// ============================================

// DELETE /assistant/user-data - Delete all user data (GDPR compliance)
router.delete('/user-data', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await assistantService.deleteUserData(userId);
    res.json({
      success: result.deleted,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /assistant/privacy-consent - Update privacy consent
router.patch('/privacy-consent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { voiceDataConsent, dataRetentionDays } = req.body;
    
    await assistantService.updatePrivacyConsent(userId, {
      voiceDataConsent,
      dataRetentionDays,
    });

    res.json({
      success: true,
      message: 'Privacy consent updated',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
