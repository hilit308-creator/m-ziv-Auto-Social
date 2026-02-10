import { Router, Request, Response } from 'express';
import { postsService, RewriteCommand } from '../services/posts.service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { topic, voice_notes, platforms } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'topic is required',
      });
    }

    const post = await postsService.create({
      topic,
      voiceNotes: voice_notes,
      platforms,
    });

    return res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create post',
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const posts = await postsService.getAll(status as any);

    return res.json({
      success: true,
      data: posts,
      count: posts.length,
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch posts',
    });
  }
});

router.get('/next', async (_req: Request, res: Response) => {
  try {
    const post = await postsService.getNext();

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'No draft posts available',
      });
    }

    return res.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('Error fetching next post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch next post',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const post = await postsService.getById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    return res.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch post',
    });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const post = await postsService.update(req.params.id, req.body);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    return res.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update post',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await postsService.delete(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    return res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete post',
    });
  }
});

router.post('/:id/rewrite', async (req: Request, res: Response) => {
  try {
    const { command, platform } = req.body;

    const validCommands: RewriteCommand[] = [
      'shorter', 'longer', 'more_professional', 'more_warm',
      'add_cta', 'remove_emojis', 'add_emojis',
      'instagram_style', 'linkedin_style', 'tiktok_style', 'youtube_style',
    ];

    if (!command || !validCommands.includes(command)) {
      return res.status(400).json({
        success: false,
        error: `Invalid command. Valid commands: ${validCommands.join(', ')}`,
      });
    }

    const post = await postsService.rewrite(req.params.id, command, platform);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    return res.json({
      success: true,
      data: post,
      command_applied: command,
    });
  } catch (error: any) {
    console.error('Error rewriting post:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to rewrite post',
    });
  }
});

export default router;
