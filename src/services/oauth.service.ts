import axios from 'axios';
import prisma from '../db/database';

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface OAuthConfig {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scopes: string[];
  auth_url: string;
  token_url: string;
}

export class OAuthService {
  private configs: Record<string, OAuthConfig> = {
    instagram: {
      client_id: process.env.INSTAGRAM_CLIENT_ID || '',
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET || '',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || '',
      scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_comments'],
      auth_url: 'https://api.instagram.com/oauth/authorize',
      token_url: 'https://api.instagram.com/oauth/access_token',
    },
    facebook: {
      client_id: process.env.FACEBOOK_APP_ID || '',
      client_secret: process.env.FACEBOOK_APP_SECRET || '',
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI || '',
      scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
      auth_url: 'https://www.facebook.com/v18.0/dialog/oauth',
      token_url: 'https://graph.facebook.com/v18.0/oauth/access_token',
    },
    linkedin: {
      client_id: process.env.LINKEDIN_CLIENT_ID || '',
      client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI || '',
      scopes: ['w_member_social', 'r_liteprofile'],
      auth_url: 'https://www.linkedin.com/oauth/v2/authorization',
      token_url: 'https://www.linkedin.com/oauth/v2/accessToken',
    },
    tiktok: {
      client_id: process.env.TIKTOK_CLIENT_KEY || '',
      client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
      redirect_uri: process.env.TIKTOK_REDIRECT_URI || '',
      scopes: ['user.info.basic', 'video.upload', 'video.publish'],
      auth_url: 'https://www.tiktok.com/v2/auth/authorize/',
      token_url: 'https://open.tiktokapis.com/v2/oauth/token/',
    },
    youtube: {
      client_id: process.env.YOUTUBE_CLIENT_ID || '',
      client_secret: process.env.YOUTUBE_CLIENT_SECRET || '',
      redirect_uri: process.env.YOUTUBE_REDIRECT_URI || '',
      scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
      auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      token_url: 'https://oauth2.googleapis.com/token',
    },
  };

  getAuthorizationUrl(platform: string, state?: string): string | null {
    const config = this.configs[platform];
    if (!config || !config.client_id) return null;

    const params = new URLSearchParams({
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      state: state || platform,
    });

    // Platform-specific params
    if (platform === 'youtube') {
      params.append('access_type', 'offline');
      params.append('prompt', 'consent');
    }

    return `${config.auth_url}?${params.toString()}`;
  }

  async exchangeCodeForTokens(platform: string, code: string): Promise<OAuthTokens | null> {
    const config = this.configs[platform];
    if (!config) return null;

    try {
      let response;

      if (platform === 'instagram') {
        // Instagram uses form data
        const formData = new URLSearchParams({
          client_id: config.client_id,
          client_secret: config.client_secret,
          grant_type: 'authorization_code',
          redirect_uri: config.redirect_uri,
          code,
        });

        response = await axios.post(config.token_url, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        // Get long-lived token
        const longLivedResponse = await axios.get(
          `https://graph.instagram.com/access_token`,
          {
            params: {
              grant_type: 'ig_exchange_token',
              client_secret: config.client_secret,
              access_token: response.data.access_token,
            },
          }
        );

        return {
          access_token: longLivedResponse.data.access_token,
          expires_in: longLivedResponse.data.expires_in,
        };
      }

      if (platform === 'facebook') {
        response = await axios.get(config.token_url, {
          params: {
            client_id: config.client_id,
            client_secret: config.client_secret,
            redirect_uri: config.redirect_uri,
            code,
          },
        });

        // Get long-lived token
        const longLivedResponse = await axios.get(
          'https://graph.facebook.com/v18.0/oauth/access_token',
          {
            params: {
              grant_type: 'fb_exchange_token',
              client_id: config.client_id,
              client_secret: config.client_secret,
              fb_exchange_token: response.data.access_token,
            },
          }
        );

        return {
          access_token: longLivedResponse.data.access_token,
          expires_in: longLivedResponse.data.expires_in,
        };
      }

      if (platform === 'linkedin') {
        const formData = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.redirect_uri,
          client_id: config.client_id,
          client_secret: config.client_secret,
        });

        response = await axios.post(config.token_url, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_in: response.data.expires_in,
        };
      }

      if (platform === 'tiktok') {
        response = await axios.post(
          config.token_url,
          {
            client_key: config.client_id,
            client_secret: config.client_secret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: config.redirect_uri,
          },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        return {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_in: response.data.expires_in,
        };
      }

      if (platform === 'youtube') {
        const formData = new URLSearchParams({
          code,
          client_id: config.client_id,
          client_secret: config.client_secret,
          redirect_uri: config.redirect_uri,
          grant_type: 'authorization_code',
        });

        response = await axios.post(config.token_url, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_in: response.data.expires_in,
        };
      }

      return null;
    } catch (error: any) {
      console.error(`OAuth token exchange error for ${platform}:`, error.response?.data || error.message);
      return null;
    }
  }

  async refreshAccessToken(platform: string, refreshToken: string): Promise<OAuthTokens | null> {
    const config = this.configs[platform];
    if (!config) return null;

    try {
      let response;

      if (platform === 'linkedin') {
        const formData = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.client_id,
          client_secret: config.client_secret,
        });

        response = await axios.post(config.token_url, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
      } else if (platform === 'youtube') {
        const formData = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.client_id,
          client_secret: config.client_secret,
        });

        response = await axios.post(config.token_url, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
      } else if (platform === 'tiktok') {
        response = await axios.post(
          config.token_url,
          {
            client_key: config.client_id,
            client_secret: config.client_secret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } else {
        return null;
      }

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || refreshToken,
        expires_in: response.data.expires_in,
      };
    } catch (error: any) {
      console.error(`OAuth refresh error for ${platform}:`, error.response?.data || error.message);
      return null;
    }
  }

  isConfigured(platform: string): boolean {
    const config = this.configs[platform];
    return !!(config?.client_id && config?.client_secret);
  }

  getConfiguredPlatforms(): string[] {
    return Object.keys(this.configs).filter((p) => this.isConfigured(p));
  }

  getRequiredEnvVars(platform: string): string[] {
    const envVars: Record<string, string[]> = {
      instagram: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET', 'INSTAGRAM_REDIRECT_URI'],
      facebook: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_REDIRECT_URI'],
      linkedin: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'LINKEDIN_REDIRECT_URI'],
      tiktok: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REDIRECT_URI'],
      youtube: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REDIRECT_URI'],
    };
    return envVars[platform] || [];
  }
}

export const oauthService = new OAuthService();
