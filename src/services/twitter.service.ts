import axios from 'axios';
import crypto from 'crypto';

export interface TweetInput {
  text: string;
  media_ids?: string[];
}

export interface TwitterConfig {
  api_key: string;
  api_secret: string;
  access_token: string;
  access_token_secret: string;
  bearer_token: string;
}

export class TwitterService {
  private config: TwitterConfig;
  private baseUrl = 'https://api.twitter.com/2';

  constructor() {
    this.config = {
      api_key: process.env.TWITTER_API_KEY || '',
      api_secret: process.env.TWITTER_API_SECRET || '',
      access_token: process.env.TWITTER_ACCESS_TOKEN || '',
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
      bearer_token: process.env.TWITTER_BEARER_TOKEN || '',
    };
  }

  isConfigured(): boolean {
    return !!(
      this.config.api_key &&
      this.config.api_secret &&
      this.config.access_token &&
      this.config.access_token_secret
    );
  }

  getRequiredEnvVars(): string[] {
    return [
      'TWITTER_API_KEY',
      'TWITTER_API_SECRET',
      'TWITTER_ACCESS_TOKEN',
      'TWITTER_ACCESS_TOKEN_SECRET',
      'TWITTER_BEARER_TOKEN',
    ];
  }

  private generateOAuthHeader(method: string, url: string, params: Record<string, string> = {}): string {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.config.api_key,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: this.config.access_token,
      oauth_version: '1.0',
    };

    const allParams = { ...oauthParams, ...params };
    const sortedKeys = Object.keys(allParams).sort();
    const paramString = sortedKeys
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');

    const signatureBase = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    const signingKey = `${encodeURIComponent(this.config.api_secret)}&${encodeURIComponent(this.config.access_token_secret)}`;
    
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(signatureBase)
      .digest('base64');

    oauthParams['oauth_signature'] = signature;

    const authHeader = Object.keys(oauthParams)
      .sort()
      .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    return `OAuth ${authHeader}`;
  }

  async postTweet(input: TweetInput): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Twitter is not configured. Add API keys to environment variables.');
    }

    try {
      const url = `${this.baseUrl}/tweets`;
      const body: any = { text: input.text };
      
      if (input.media_ids && input.media_ids.length > 0) {
        body.media = { media_ids: input.media_ids };
      }

      const response = await axios.post(url, body, {
        headers: {
          'Authorization': `Bearer ${this.config.bearer_token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        tweet_id: response.data.data.id,
        text: response.data.data.text,
      };
    } catch (error: any) {
      console.error('Twitter API error:', error.response?.data || error.message);
      throw new Error(`Failed to post tweet: ${error.response?.data?.detail || error.message}`);
    }
  }

  async postThread(tweets: string[]): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('Twitter is not configured');
    }

    const results: any[] = [];
    let replyToId: string | null = null;

    for (const text of tweets) {
      try {
        const url = `${this.baseUrl}/tweets`;
        const body: any = { text };
        
        if (replyToId) {
          body.reply = { in_reply_to_tweet_id: replyToId };
        }

        const response = await axios.post(url, body, {
          headers: {
            'Authorization': `Bearer ${this.config.bearer_token}`,
            'Content-Type': 'application/json',
          },
        });

        replyToId = response.data.data.id;
        results.push({
          success: true,
          tweet_id: response.data.data.id,
          text: response.data.data.text,
        });
      } catch (error: any) {
        results.push({
          success: false,
          error: error.response?.data?.detail || error.message,
        });
        break;
      }
    }

    return results;
  }

  async uploadMedia(mediaUrl: string): Promise<string> {
    // Twitter media upload requires OAuth 1.0a
    // This is a simplified version - full implementation needs chunked upload
    const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
    
    try {
      // Download media first
      const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      const base64Media = Buffer.from(mediaResponse.data).toString('base64');

      const authHeader = this.generateOAuthHeader('POST', uploadUrl);

      const formData = new URLSearchParams();
      formData.append('media_data', base64Media);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data.media_id_string;
    } catch (error: any) {
      console.error('Twitter media upload error:', error.response?.data || error.message);
      throw new Error('Failed to upload media to Twitter');
    }
  }

  async getMe(): Promise<any> {
    if (!this.config.bearer_token) {
      throw new Error('Bearer token not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.config.bearer_token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Twitter API error:', error.response?.data || error.message);
      throw new Error('Failed to get user info');
    }
  }
}

export const twitterService = new TwitterService();
