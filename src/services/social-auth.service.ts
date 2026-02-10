import prisma from '../db/database';

export interface SocialConnection {
  platform: string;
  connected: boolean;
  account_name?: string;
  expires_at?: Date;
}

export interface OAuthConfig {
  platform: string;
  client_id: string;
  redirect_uri: string;
  scopes: string[];
  auth_url: string;
}

export class SocialAuthService {
  private oauthConfigs: Record<string, OAuthConfig> = {
    instagram: {
      platform: 'instagram',
      client_id: process.env.INSTAGRAM_CLIENT_ID || '',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || '',
      scopes: ['instagram_basic', 'instagram_content_publish'],
      auth_url: 'https://api.instagram.com/oauth/authorize',
    },
    facebook: {
      platform: 'facebook',
      client_id: process.env.FACEBOOK_APP_ID || '',
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI || '',
      scopes: ['pages_manage_posts', 'pages_read_engagement'],
      auth_url: 'https://www.facebook.com/v18.0/dialog/oauth',
    },
    linkedin: {
      platform: 'linkedin',
      client_id: process.env.LINKEDIN_CLIENT_ID || '',
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI || '',
      scopes: ['w_member_social'],
      auth_url: 'https://www.linkedin.com/oauth/v2/authorization',
    },
    tiktok: {
      platform: 'tiktok',
      client_id: process.env.TIKTOK_CLIENT_KEY || '',
      redirect_uri: process.env.TIKTOK_REDIRECT_URI || '',
      scopes: ['video.upload', 'video.publish'],
      auth_url: 'https://www.tiktok.com/v2/auth/authorize/',
    },
    youtube: {
      platform: 'youtube',
      client_id: process.env.YOUTUBE_CLIENT_ID || '',
      redirect_uri: process.env.YOUTUBE_REDIRECT_URI || '',
      scopes: ['https://www.googleapis.com/auth/youtube.upload'],
      auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    },
  };

  getAuthUrl(platform: string): string | null {
    const config = this.oauthConfigs[platform];
    if (!config || !config.client_id) return null;

    const params = new URLSearchParams({
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      state: platform,
    });

    return `${config.auth_url}?${params.toString()}`;
  }

  async getConnections(): Promise<SocialConnection[]> {
    const platforms = ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube'];
    
    return platforms.map(platform => ({
      platform,
      connected: false,
      account_name: undefined,
      expires_at: undefined,
    }));
  }

  async saveToken(platform: string, accessToken: string, refreshToken?: string, expiresAt?: Date): Promise<void> {
    console.log(`Saving token for ${platform}:`, { accessToken: '***', refreshToken: refreshToken ? '***' : undefined, expiresAt });
  }

  async getToken(platform: string): Promise<string | null> {
    console.log(`Getting token for ${platform}`);
    return null;
  }

  async refreshToken(platform: string): Promise<boolean> {
    console.log(`Refreshing token for ${platform}`);
    return false;
  }

  async disconnect(platform: string): Promise<boolean> {
    console.log(`Disconnecting ${platform}`);
    return true;
  }

  getConfiguredPlatforms(): string[] {
    return Object.entries(this.oauthConfigs)
      .filter(([_, config]) => config.client_id)
      .map(([platform]) => platform);
  }
}

export const socialAuthService = new SocialAuthService();
