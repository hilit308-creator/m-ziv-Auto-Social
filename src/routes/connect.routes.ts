import { Router, Request, Response, NextFunction } from 'express';
import { oauthService } from '../services/oauth.service';
import prisma from '../db/database';

const router = Router();

// Middleware for API key authentication (supports both Bearer and x-api-key)
const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = 
    req.headers['x-api-key'] as string ||
    req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== process.env.MZIV_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid or missing API key',
    });
  }
  
  next();
};

// All connect routes require API key (except callback which is called by OAuth provider)
router.use((req: Request, res: Response, next: NextFunction) => {
  // Skip auth for callback routes (they come from OAuth providers)
  if (req.path.includes('/callback')) {
    return next();
  }
  return authenticateApiKey(req, res, next);
});

const VALID_PROVIDERS = ['instagram', 'facebook', 'tiktok', 'youtube'];
const DEFAULT_USER_ID = 'default-user';

// GET /connect/status - Get connection status for all platforms
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const platforms: Record<string, any> = {};

    for (const provider of VALID_PROVIDERS) {
      const platformKey = provider === 'facebook' ? 'facebook_page' : provider;
      const account = await prisma.socialAccount.findFirst({
        where: {
          platform: platformKey,
          isActive: true,
        },
      });

      if (!account) {
        platforms[platformKey] = {
          status: 'not_connected',
          account_name: null,
          expires_at: null,
          reason: 'לא חובר עדיין',
        };
      } else if (account.tokenExpiry && account.tokenExpiry < new Date()) {
        platforms[platformKey] = {
          status: 'expired',
          account_name: account.accountName,
          expires_at: account.tokenExpiry.toISOString(),
          reason: 'הטוקן פג תוקף — צריך להתחבר מחדש',
        };
      } else {
        platforms[platformKey] = {
          status: 'connected',
          account_name: account.accountName,
          expires_at: account.tokenExpiry ? account.tokenExpiry.toISOString() : null,
          reason: null,
        };
      }
    }

    // Summary counts
    const values = Object.values(platforms);
    const connected = values.filter((v: any) => v.status === 'connected').length;
    const expired = values.filter((v: any) => v.status === 'expired').length;
    const notConnected = values.filter((v: any) => v.status === 'not_connected').length;

    return res.json({
      success: true,
      data: {
        platforms,
        summary: {
          connected,
          expired,
          not_connected: notConnected,
          total: VALID_PROVIDERS.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting connection status:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get connection status',
    });
  }
});

// GET /connect/:provider/start - Start OAuth flow for a provider
router.get('/:provider/start', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;

    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({
        success: false,
        error: `Invalid provider. Valid providers: ${VALID_PROVIDERS.join(', ')}`,
      });
    }

    if (!oauthService.isConfigured(provider)) {
      return res.status(400).json({
        success: false,
        error: `${provider} is not configured. Required env vars: ${oauthService.getRequiredEnvVars(provider).join(', ')}`,
      });
    }

    const state = `${provider}_${Date.now()}`;
    const authUrl = oauthService.getAuthorizationUrl(provider, state);

    if (!authUrl) {
      return res.status(500).json({
        success: false,
        error: `Failed to generate auth URL for ${provider}`,
      });
    }

    return res.json({
      success: true,
      data: {
        auth_url: authUrl,
        provider,
        state,
      },
    });
  } catch (error: any) {
    console.error(`Error starting OAuth for ${req.params.provider}:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to start OAuth flow',
    });
  }
});

// GET /connect/:provider/callback - OAuth callback (called by provider)
router.get('/:provider/callback', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { code, error: oauthError, state } = req.query;

    if (oauthError) {
      return res.status(400).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
          <h2>❌ חיבור נכשל</h2>
          <p>שגיאה: ${oauthError}</p>
          <p>את יכולה לסגור את הדף הזה ולנסות שוב מה-Shortcut.</p>
        </body></html>
      `);
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
          <h2>❌ חסר קוד אימות</h2>
          <p>את יכולה לסגור את הדף הזה ולנסות שוב מה-Shortcut.</p>
        </body></html>
      `);
    }

    // Exchange code for tokens
    const tokens = await oauthService.exchangeCodeForTokens(provider, code);

    if (!tokens) {
      return res.status(500).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
          <h2>❌ לא הצלחנו לקבל גישה</h2>
          <p>נסי שוב מה-Shortcut.</p>
        </body></html>
      `);
    }

    // Determine platform name for DB
    const platformName = provider === 'facebook' ? 'facebook_page' : provider;

    // Calculate token expiry
    const tokenExpiry = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    // Get account info (platform-specific)
    let accountId = 'default';
    let accountName = provider;

    try {
      if (provider === 'facebook') {
        // Get Facebook Page info
        const axios = (await import('axios')).default;
        const pagesRes = await axios.get(
          `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokens.access_token}`
        );
        if (pagesRes.data.data && pagesRes.data.data.length > 0) {
          const page = pagesRes.data.data[0];
          accountId = page.id;
          accountName = page.name;
          // Use page access token (longer-lived)
          tokens.access_token = page.access_token;
        }
      } else if (provider === 'instagram') {
        const axios = (await import('axios')).default;
        const meRes = await axios.get(
          `https://graph.instagram.com/me?fields=id,username&access_token=${tokens.access_token}`
        );
        accountId = meRes.data.id;
        accountName = meRes.data.username || 'instagram';
      } else if (provider === 'youtube') {
        const axios = (await import('axios')).default;
        const channelRes = await axios.get(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
          { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );
        if (channelRes.data.items && channelRes.data.items.length > 0) {
          accountId = channelRes.data.items[0].id;
          accountName = channelRes.data.items[0].snippet.title;
        }
      } else if (provider === 'tiktok') {
        const axios = (await import('axios')).default;
        const userRes = await axios.get(
          'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name',
          { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );
        if (userRes.data.data?.user) {
          accountId = userRes.data.data.user.open_id;
          accountName = userRes.data.data.user.display_name || 'tiktok';
        }
      }
    } catch (infoError) {
      console.warn(`Could not fetch account info for ${provider}:`, infoError);
    }

    // Ensure a default user exists
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'mziv@default.com',
          password: 'oauth-only',
          name: 'M-Ziv',
        },
      });
    }

    // Upsert social account
    const existing = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform: platformName,
      },
    });

    if (existing) {
      await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existing.refreshToken,
          tokenExpiry,
          accountId,
          accountName,
          isActive: true,
        },
      });
    } else {
      await prisma.socialAccount.create({
        data: {
          userId: user.id,
          platform: platformName,
          accountId,
          accountName,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry,
          isActive: true,
        },
      });
    }

    console.log(`[connect] ${platformName} connected successfully (account: ${accountName})`);

    // Return a nice HTML page that the user sees after OAuth
    return res.send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2>✅ ${platformName} מחובר בהצלחה!</h2>
        <p>חשבון: <strong>${accountName}</strong></p>
        <p style="color:#666;">את יכולה לסגור את הדף הזה ולחזור ל-Shortcut.</p>
      </body></html>
    `);
  } catch (error: any) {
    console.error(`OAuth callback error for ${req.params.provider}:`, error);
    return res.status(500).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2>❌ שגיאה בחיבור</h2>
        <p>${error.message}</p>
        <p>נסי שוב מה-Shortcut.</p>
      </body></html>
    `);
  }
});

// POST /connect/:provider/disconnect - Disconnect a provider
router.post('/:provider/disconnect', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const platformName = provider === 'facebook' ? 'facebook_page' : provider;

    const account = await prisma.socialAccount.findFirst({
      where: { platform: platformName, isActive: true },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: `${platformName} is not connected`,
      });
    }

    await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        isActive: false,
        accessToken: '',
        refreshToken: null,
        tokenExpiry: null,
      },
    });

    return res.json({
      success: true,
      message: `${platformName} נותק בהצלחה`,
      data: { platform: platformName, status: 'not_connected' },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to disconnect',
    });
  }
});

export default router;
