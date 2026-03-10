import { Router, Request, Response, NextFunction } from 'express';
import { oauthService } from '../services/oauth.service';
import { authService } from '../services/auth.service';
import prisma from '../db/database';
import * as crypto from 'crypto';

const router = Router();

// In-memory state store for OAuth (maps state → userId)
// In production, use Redis or DB. TTL: 10 minutes.
const oauthStateStore = new Map<string, { userId: string; provider: string; createdAt: number }>();

// Clean up expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  Array.from(oauthStateStore.entries()).forEach(([key, val]) => {
    if (now - val.createdAt > 10 * 60 * 1000) oauthStateStore.delete(key);
  });
}, 5 * 60 * 1000);

// Flexible auth middleware: supports JWT (Bearer token) and API key (x-api-key)
// Sets (req as any).userId if authenticated
const authenticateFlexible = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Try JWT first (Authorization: Bearer <jwt>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // Check if it's a JWT (not the API key)
    if (token !== process.env.MZIV_API_KEY) {
      try {
        const { userId } = authService.verifyToken(token);
        (req as any).userId = userId;
        return next();
      } catch {
        // Not a valid JWT — fall through to API key check
      }
    }
  }

  // 2. Try API key (x-api-key header or Bearer with API key value)
  const apiKey =
    req.headers['x-api-key'] as string ||
    (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined);

  if (apiKey && apiKey === process.env.MZIV_API_KEY) {
    // API key auth — resolve to default user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'mziv@default.com', password: 'oauth-only', name: 'M-Ziv' },
      });
    }
    (req as any).userId = user.id;
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized - Provide a valid JWT token (Bearer) or API key (x-api-key)',
  });
};

// All connect routes require auth (except callback and start-public which are public)
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.includes('/callback') || req.path.includes('/start-public')) {
    return next();
  }
  return authenticateFlexible(req, res, next);
});

const VALID_PROVIDERS = ['instagram', 'facebook', 'tiktok', 'youtube'];

// GET /connect/youtube/start-public - Public endpoint for YouTube OAuth (no auth required)
// Creates a one-time state, stores userId (default user), and redirects to Google OAuth
router.get('/youtube/start-public', async (_req: Request, res: Response) => {
  try {
    if (!oauthService.isConfigured('youtube')) {
      return res.status(400).json({
        success: false,
        error: 'YouTube is not configured. Set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REDIRECT_URI.',
      });
    }

    // Resolve default user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'mziv@default.com', password: 'oauth-only', name: 'M-Ziv' },
      });
    }

    // Generate one-time state with userId
    const stateToken = crypto.randomBytes(20).toString('hex');
    oauthStateStore.set(stateToken, { userId: user.id, provider: 'youtube', createdAt: Date.now() });

    const authUrl = oauthService.getAuthorizationUrl('youtube', stateToken);

    if (!authUrl) {
      oauthStateStore.delete(stateToken);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate YouTube auth URL',
      });
    }

    console.log(`[connect] Public YouTube OAuth started, user=${user.id}, state=${stateToken.slice(0, 8)}...`);

    // Redirect directly to Google OAuth
    return res.redirect(authUrl);
  } catch (error: any) {
    console.error('Error starting public YouTube OAuth:', error);
    return res.status(500).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2>❌ שגיאה בהתחלת חיבור</h2>
        <p>${error.message}</p>
      </body></html>
    `);
  }
});

// GET /connect/status - Get connection status for all platforms (per user)
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const platforms: Record<string, any> = {};

    for (const provider of VALID_PROVIDERS) {
      const platformKey = provider === 'facebook' ? 'facebook_page' : provider;
      const account = await prisma.socialAccount.findFirst({
        where: {
          userId,
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

// GET /connect/:provider/start - Start OAuth flow for a provider (encodes userId in state)
router.get('/:provider/start', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const userId = (req as any).userId;

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

    // Generate secure random state and store userId mapping
    const stateToken = crypto.randomBytes(20).toString('hex');
    oauthStateStore.set(stateToken, { userId, provider, createdAt: Date.now() });

    const authUrl = oauthService.getAuthorizationUrl(provider, stateToken);

    if (!authUrl) {
      oauthStateStore.delete(stateToken);
      return res.status(500).json({
        success: false,
        error: `Failed to generate auth URL for ${provider}`,
      });
    }

    console.log(`[connect] OAuth started for ${provider}, user=${userId}, state=${stateToken.slice(0, 8)}...`);

    return res.json({
      success: true,
      data: {
        auth_url: authUrl,
        provider,
        state: stateToken,
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

    // Resolve userId from state parameter
    let userId: string | null = null;
    const stateStr = state as string | undefined;

    if (stateStr && oauthStateStore.has(stateStr)) {
      const stateData = oauthStateStore.get(stateStr)!;
      userId = stateData.userId;
      oauthStateStore.delete(stateStr); // One-time use
      console.log(`[connect] Callback for ${provider}, resolved user=${userId} from state`);
    } else {
      // Fallback: no valid state — use default user (backward compat)
      console.warn(`[connect] Callback for ${provider}: no valid state, falling back to default user`);
      let defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        defaultUser = await prisma.user.create({
          data: { email: 'mziv@default.com', password: 'oauth-only', name: 'M-Ziv' },
        });
      }
      userId = defaultUser.id;
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

    // Upsert social account for the resolved user
    const existing = await prisma.socialAccount.findFirst({
      where: {
        userId,
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
          userId,
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

    console.log(`[connect] ${platformName} connected for user=${userId} (account: ${accountName})`);

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

// POST /connect/:provider/disconnect - Disconnect a provider (per user)
router.post('/:provider/disconnect', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const userId = (req as any).userId;
    const platformName = provider === 'facebook' ? 'facebook_page' : provider;

    const account = await prisma.socialAccount.findFirst({
      where: { userId, platform: platformName, isActive: true },
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
