import { Router, Request, Response } from 'express';
import { oauthService } from '../services/oauth.service';

const router = Router();

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const platforms = ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube'];
    const connections = platforms.map(platform => ({
      platform,
      connected: false, // Will be true when tokens are stored
      configured: oauthService.isConfigured(platform),
    }));

    const configured = oauthService.getConfiguredPlatforms();

    return res.json({
      success: true,
      data: {
        connections,
        configured_platforms: configured,
        message: configured.length > 0 
          ? `${configured.length} פלטפורמות מוגדרות` 
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
    const authUrl = oauthService.getAuthorizationUrl(platform);

    if (!authUrl) {
      return res.status(400).json({
        success: false,
        error: `Platform ${platform} is not configured. Add OAuth credentials to environment variables.`,
        required_vars: oauthService.getRequiredEnvVars(platform),
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
    const { code, error: oauthError } = req.query;

    if (oauthError) {
      return res.status(400).json({
        success: false,
        error: `OAuth error: ${oauthError}`,
      });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing authorization code',
      });
    }

    // Exchange code for tokens
    const tokens = await oauthService.exchangeCodeForTokens(platform, code);

    if (!tokens) {
      return res.status(400).json({
        success: false,
        error: 'Failed to exchange code for tokens',
      });
    }

    // In production, store tokens securely in database
    // For now, return success with instructions
    return res.json({
      success: true,
      data: {
        platform,
        message: 'התחברות בוצעה בהצלחה!',
        instructions: [
          `הוסף ל-Railway: ${platform.toUpperCase()}_ACCESS_TOKEN=${tokens.access_token.substring(0, 20)}...`,
          tokens.refresh_token ? `הוסף גם: ${platform.toUpperCase()}_REFRESH_TOKEN` : null,
        ].filter(Boolean),
      },
    });
  } catch (error: any) {
    console.error('Error in OAuth callback:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process OAuth callback',
    });
  }
});

router.post('/refresh/:platform', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'refresh_token is required',
      });
    }

    const tokens = await oauthService.refreshAccessToken(platform, refresh_token);

    if (!tokens) {
      return res.status(400).json({
        success: false,
        error: 'Failed to refresh token',
      });
    }

    return res.json({
      success: true,
      data: {
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
      },
    });
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to refresh token',
    });
  }
});

router.post('/disconnect/:platform', async (_req: Request, res: Response) => {
  try {
    // In production, delete tokens from database
    return res.json({
      success: true,
      message: 'Disconnected successfully',
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
