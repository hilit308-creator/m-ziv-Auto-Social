import { Router, Request, Response } from 'express';
import { socialAuthService } from '../services/social-auth.service';

const router = Router();

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const connections = await socialAuthService.getConnections();
    const configured = socialAuthService.getConfiguredPlatforms();

    return res.json({
      success: true,
      data: {
        connections,
        configured_platforms: configured,
        message: configured.length > 0 
          ? 'חלק מהפלטפורמות מוגדרות' 
          : 'לא הוגדרו פלטפורמות - צריך להוסיף OAuth credentials',
      },
    });
  } catch (error: any) {
    console.error('Error fetching auth status:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch auth status',
    });
  }
});

router.get('/connect/:platform', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;
    const authUrl = socialAuthService.getAuthUrl(platform);

    if (!authUrl) {
      return res.status(400).json({
        success: false,
        error: `Platform ${platform} is not configured. Add OAuth credentials to environment variables.`,
        required_vars: {
          instagram: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET', 'INSTAGRAM_REDIRECT_URI'],
          facebook: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_REDIRECT_URI'],
          linkedin: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'LINKEDIN_REDIRECT_URI'],
          tiktok: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REDIRECT_URI'],
          youtube: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REDIRECT_URI'],
        }[platform] || [],
      });
    }

    return res.json({
      success: true,
      data: {
        auth_url: authUrl,
        platform,
        message: 'פתח את הקישור בדפדפן כדי לחבר את החשבון',
      },
    });
  } catch (error: any) {
    console.error('Error getting auth URL:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get auth URL',
    });
  }
});

router.get('/callback/:platform', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;
    const { code, error } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: `OAuth error: ${error}`,
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Missing authorization code',
      });
    }

    return res.json({
      success: true,
      message: `OAuth callback received for ${platform}. Token exchange not yet implemented.`,
      code: '***',
    });
  } catch (error: any) {
    console.error('Error in OAuth callback:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process OAuth callback',
    });
  }
});

router.post('/disconnect/:platform', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;
    const success = await socialAuthService.disconnect(platform);

    return res.json({
      success,
      message: success ? `${platform} disconnected` : 'Failed to disconnect',
    });
  } catch (error: any) {
    console.error('Error disconnecting:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to disconnect',
    });
  }
});

export default router;
