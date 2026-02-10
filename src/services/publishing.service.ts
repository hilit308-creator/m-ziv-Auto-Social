import axios from 'axios';
import Bull from 'bull';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

interface PublishOptions {
  content: string;
  platforms: string[];
  imageUrl?: string;
  videoUrl?: string;
  scheduleTime?: Date;
  hashtags?: string[];
}

interface PublishResult {
  platform: string;
  status: 'success' | 'failed' | 'scheduled';
  postId?: string;
  error?: string;
}

export class PublishingService {
  private publishQueue?: Bull.Queue;
  private redis?: Redis;

  constructor() {
    console.warn('⚠️  Redis/Queue features disabled - running in simple mode');
  }

  async publishEverywhere(options: PublishOptions): Promise<PublishResult[]> {
    const { platforms, scheduleTime } = options;

    if (scheduleTime && scheduleTime > new Date()) {
      return this.schedulePost(options);
    }

    const results = await Promise.all(
      platforms.map(platform => this.publishToPlatform(platform, options))
    );

    return results;
  }

  async publishToPlatform(
    platform: string,
    options: PublishOptions
  ): Promise<PublishResult> {
    try {
      const adaptedContent = this.adaptContentForPlatform(platform, options);
      
      let postId: string;

      switch (platform) {
        case 'instagram':
          postId = await this.publishToInstagram(adaptedContent);
          break;
        case 'facebook':
          postId = await this.publishToFacebook(adaptedContent);
          break;
        case 'twitter':
          postId = await this.publishToTwitter(adaptedContent);
          break;
        case 'linkedin':
          postId = await this.publishToLinkedIn(adaptedContent);
          break;
        case 'tiktok':
          postId = await this.publishToTikTok(adaptedContent);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      await this.savePostRecord({
        platform,
        postId,
        content: adaptedContent.text,
        publishedAt: new Date(),
      });

      return {
        platform,
        status: 'success',
        postId,
      };
    } catch (error) {
      console.error(`Failed to publish to ${platform}:`, error);
      return {
        platform,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async schedulePost(options: PublishOptions): Promise<PublishResult[]> {
    const { platforms, scheduleTime } = options;

    if (!this.publishQueue) {
      return platforms.map(platform => ({
        platform,
        status: 'failed' as const,
        error: 'Queue system not available - Redis not connected',
      }));
    }

    const delay = scheduleTime!.getTime() - Date.now();

    const results = await Promise.all(
      platforms.map(async platform => {
        await this.publishQueue!.add(
          'scheduled-post',
          { platform, options },
          { delay }
        );

        return {
          platform,
          status: 'scheduled' as const,
        };
      })
    );

    return results;
  }

  private adaptContentForPlatform(
    platform: string,
    options: PublishOptions
  ): any {
    const { content, imageUrl, hashtags = [] } = options;

    switch (platform) {
      case 'instagram':
        return {
          text: content,
          imageUrl,
          hashtags: hashtags.slice(0, 30),
        };

      case 'facebook':
        return {
          text: content,
          imageUrl,
          hashtags: hashtags.slice(0, 10),
        };

      case 'twitter':
        const maxLength = 280;
        let tweetText = content;
        
        if (tweetText.length > maxLength) {
          tweetText = tweetText.substring(0, maxLength - 3) + '...';
        }

        return {
          text: tweetText,
          imageUrl,
          hashtags: hashtags.slice(0, 5),
        };

      case 'linkedin':
        return {
          text: content,
          imageUrl,
          hashtags: hashtags.slice(0, 5),
        };

      case 'tiktok':
        return {
          text: content,
          videoUrl: options.videoUrl,
          hashtags: hashtags.slice(0, 10),
        };

      default:
        return { text: content, imageUrl };
    }
  }

  private async publishToInstagram(content: any): Promise<string> {
    const accessToken = await this.getAccessToken('instagram');
    const igUserId = await this.getIgUserId(accessToken);

    let mediaId: string;

    if (content.imageUrl) {
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${igUserId}/media`,
        {
          image_url: content.imageUrl,
          caption: `${content.text}\n\n${content.hashtags.join(' ')}`,
          access_token: accessToken,
        }
      );

      mediaId = containerResponse.data.id;

      await this.waitForMediaProcessing(mediaId, accessToken);

      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
        {
          creation_id: mediaId,
          access_token: accessToken,
        }
      );

      return publishResponse.data.id;
    }

    throw new Error('Instagram requires an image');
  }

  private async publishToFacebook(content: any): Promise<string> {
    const accessToken = await this.getAccessToken('facebook');
    const pageId = await this.getFacebookPageId(accessToken);

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        message: `${content.text}\n\n${content.hashtags.join(' ')}`,
        ...(content.imageUrl && { link: content.imageUrl }),
        access_token: accessToken,
      }
    );

    return response.data.id;
  }

  private async publishToTwitter(content: any): Promise<string> {
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      {
        text: `${content.text} ${content.hashtags.join(' ')}`,
        ...(content.imageUrl && {
          media: {
            media_ids: [await this.uploadTwitterMedia(content.imageUrl)],
          },
        }),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data.id;
  }

  private async publishToLinkedIn(content: any): Promise<string> {
    const accessToken = await this.getAccessToken('linkedin');
    const personUrn = await this.getLinkedInPersonUrn(accessToken);

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: `${content.text}\n\n${content.hashtags.join(' ')}`,
            },
            shareMediaCategory: content.imageUrl ? 'IMAGE' : 'NONE',
            ...(content.imageUrl && {
              media: [
                {
                  status: 'READY',
                  media: await this.uploadLinkedInMedia(content.imageUrl, accessToken),
                },
              ],
            }),
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.id;
  }

  private async publishToTikTok(_content: any): Promise<string> {
    throw new Error('TikTok publishing not yet implemented');
  }

  private async getAccessToken(platform: string): Promise<string> {
    if (!this.redis) {
      throw new Error('Redis not available - cannot retrieve access tokens');
    }
    const token = await this.redis.get(`token:${platform}`);
    if (!token) {
      throw new Error(`No access token found for ${platform}`);
    }
    return token;
  }

  private async getIgUserId(accessToken: string): Promise<string> {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/me/accounts`,
      {
        params: { access_token: accessToken },
      }
    );

    return response.data.data[0].instagram_business_account.id;
  }

  private async getFacebookPageId(accessToken: string): Promise<string> {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/me/accounts`,
      {
        params: { access_token: accessToken },
      }
    );

    return response.data.data[0].id;
  }

  private async getLinkedInPersonUrn(accessToken: string): Promise<string> {
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return `urn:li:person:${response.data.id}`;
  }

  private async waitForMediaProcessing(
    mediaId: string,
    accessToken: string
  ): Promise<void> {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          params: {
            fields: 'status_code',
            access_token: accessToken,
          },
        }
      );

      if (response.data.status_code === 'FINISHED') {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Media processing timeout');
  }

  private async uploadTwitterMedia(_imageUrl: string): Promise<string> {
    throw new Error('Twitter media upload not yet implemented');
  }

  private async uploadLinkedInMedia(
    _imageUrl: string,
    _accessToken: string
  ): Promise<string> {
    throw new Error('LinkedIn media upload not yet implemented');
  }

  private async savePostRecord(_data: any): Promise<void> {
    // Post record saving not yet implemented
  }

  // Queue processors disabled - Redis not configured
  // private setupQueueProcessors(): void {
  //   if (!this.publishQueue) return;
  //   
  //   this.publishQueue.process('scheduled-post', async (job: any) => {
  //     const { platform, options } = job.data;
  //     return this.publishToPlatform(platform, options);
  //   });
  // }

  async getBestPostingTimes(_platform: string): Promise<Date[]> {
    return [
      new Date(Date.now() + 3600000),
      new Date(Date.now() + 7200000),
      new Date(Date.now() + 10800000),
    ];
  }
}

export const publishingService = new PublishingService();
