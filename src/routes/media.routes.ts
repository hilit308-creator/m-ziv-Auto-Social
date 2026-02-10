import { Router, Request, Response } from 'express';
import { mediaService } from '../services/media.service';

const router = Router();

router.get('/status', async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      configured: mediaService.isReady(),
      provider: 'cloudinary',
    },
  });
});

router.post('/upload/url', async (req: Request, res: Response) => {
  try {
    const { url, folder, resource_type, post_id } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'url is required',
      });
    }

    const result = await mediaService.uploadFromUrl(url, {
      folder,
      resource_type,
      postId: post_id,
    });

    if (post_id) {
      await mediaService.attachToPost(post_id, result.secure_url, result.resource_type);
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload media',
    });
  }
});

router.post('/upload/base64', async (req: Request, res: Response) => {
  try {
    const { data, folder, resource_type, post_id } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'data (base64) is required',
      });
    }

    const result = await mediaService.uploadFromBase64(data, {
      folder,
      resource_type,
      postId: post_id,
    });

    if (post_id) {
      await mediaService.attachToPost(post_id, result.secure_url, result.resource_type);
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload media',
    });
  }
});

router.delete('/:publicId', async (req: Request, res: Response) => {
  try {
    const success = await mediaService.delete(req.params.publicId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Media not found or already deleted',
      });
    }

    return res.json({
      success: true,
      message: 'Media deleted',
    });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete media',
    });
  }
});

router.post('/attach', async (req: Request, res: Response) => {
  try {
    const { post_id, media_url, media_type } = req.body;

    if (!post_id || !media_url) {
      return res.status(400).json({
        success: false,
        error: 'post_id and media_url are required',
      });
    }

    await mediaService.attachToPost(post_id, media_url, media_type || 'image');

    return res.json({
      success: true,
      message: 'Media attached to post',
    });
  } catch (error: any) {
    console.error('Error attaching media:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to attach media',
    });
  }
});

export default router;
