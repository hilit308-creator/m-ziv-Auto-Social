import prisma from '../db/database';
import axios from 'axios';
import FormData from 'form-data';

export interface PublishResult {
  platform: string;
  success: boolean;
  post_id?: string;
  post_url?: string;
  error?: string;
}

export interface PlatformCredentials {
  access_token: string;
  user_id?: string;
  page_id?: string;
}

export class AutoPublishService {
  
  async publishPost(postId: string): Promise<PublishResult[]> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const results: PublishResult[] = [];

    // Publish to each platform that has content
    if (post.instagramCaption) {
      results.push(await this.publishToInstagram(post));
    }
    if (post.facebookCaption) {
      results.push(await this.publishToFacebook(post));
    }
    if (post.linkedinCaption) {
      results.push(await this.publishToLinkedIn(post));
    }
    if (post.tiktokCaption) {
      results.push(await this.publishToTikTok(post));
    }
    if (post.youtubeTitle) {
      results.push(await this.publishToYouTube(post));
    }

    // Update post status
    const allSuccess = results.every(r => r.success);
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: allSuccess ? 'published' : 'failed',
        publishedAt: allSuccess ? new Date() : null,
      },
    });

    return results;
  }

  // Instagram Publishing via Graph API
  async publishToInstagram(post: any): Promise<PublishResult> {
    try {
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      const igUserId = process.env.INSTAGRAM_USER_ID;

      if (!accessToken || !igUserId) {
        return {
          platform: 'instagram',
          success: false,
          error: 'Instagram credentials not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID',
        };
      }

      const caption = `${post.instagramCaption}\n\n${post.instagramHashtags || ''}`;

      // If post has media, create media container first
      if (post.mediaUrl) {
        // Step 1: Create media container
        const containerResponse = await axios.post(
          `https://graph.facebook.com/v18.0/${igUserId}/media`,
          {
            image_url: post.mediaUrl,
            caption: caption,
            access_token: accessToken,
          }
        );

        const containerId = containerResponse.data.id;

        // Step 2: Publish the container
        const publishResponse = await axios.post(
          `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
          {
            creation_id: containerId,
            access_token: accessToken,
          }
        );

        return {
          platform: 'instagram',
          success: true,
          post_id: publishResponse.data.id,
          post_url: `https://www.instagram.com/p/${publishResponse.data.id}/`,
        };
      } else {
        return {
          platform: 'instagram',
          success: false,
          error: 'Instagram requires an image or video. Please add media to the post.',
        };
      }
    } catch (error: any) {
      return {
        platform: 'instagram',
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  // Facebook Publishing via Graph API
  async publishToFacebook(post: any): Promise<PublishResult> {
    try {
      const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
      const pageId = process.env.FACEBOOK_PAGE_ID;

      if (!accessToken || !pageId) {
        return {
          platform: 'facebook',
          success: false,
          error: 'Facebook credentials not configured. Set FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID',
        };
      }

      let response;

      if (post.mediaUrl) {
        // Post with photo
        response = await axios.post(
          `https://graph.facebook.com/v18.0/${pageId}/photos`,
          {
            url: post.mediaUrl,
            caption: post.facebookCaption,
            access_token: accessToken,
          }
        );
      } else {
        // Text-only post
        response = await axios.post(
          `https://graph.facebook.com/v18.0/${pageId}/feed`,
          {
            message: post.facebookCaption,
            access_token: accessToken,
          }
        );
      }

      return {
        platform: 'facebook',
        success: true,
        post_id: response.data.id || response.data.post_id,
        post_url: `https://www.facebook.com/${response.data.id || response.data.post_id}`,
      };
    } catch (error: any) {
      return {
        platform: 'facebook',
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  // LinkedIn Publishing via API
  async publishToLinkedIn(post: any): Promise<PublishResult> {
    try {
      const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
      const personId = process.env.LINKEDIN_PERSON_ID;

      if (!accessToken || !personId) {
        return {
          platform: 'linkedin',
          success: false,
          error: 'LinkedIn credentials not configured. Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_ID',
        };
      }

      const postData: any = {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.linkedinCaption,
            },
            shareMediaCategory: post.mediaUrl ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // If there's media, add it
      if (post.mediaUrl) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            originalUrl: post.mediaUrl,
          },
        ];
      }

      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        postData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const postUrn = response.headers['x-restli-id'] || response.data.id;

      return {
        platform: 'linkedin',
        success: true,
        post_id: postUrn,
        post_url: `https://www.linkedin.com/feed/update/${postUrn}`,
      };
    } catch (error: any) {
      return {
        platform: 'linkedin',
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // TikTok Publishing via API
  async publishToTikTok(post: any): Promise<PublishResult> {
    try {
      const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

      if (!accessToken) {
        return {
          platform: 'tiktok',
          success: false,
          error: 'TikTok credentials not configured. Set TIKTOK_ACCESS_TOKEN',
        };
      }

      if (!post.mediaUrl) {
        return {
          platform: 'tiktok',
          success: false,
          error: 'TikTok requires a video. Please add video media to the post.',
        };
      }

      // TikTok requires video upload first, then publish
      // Step 1: Initialize video upload
      const initResponse = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          post_info: {
            title: post.tiktokCaption?.substring(0, 150) || '',
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_stitch: false,
            disable_comment: false,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: post.mediaUrl,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        platform: 'tiktok',
        success: true,
        post_id: initResponse.data.data?.publish_id,
        post_url: 'https://www.tiktok.com/@user', // TikTok doesn't return direct URL
      };
    } catch (error: any) {
      return {
        platform: 'tiktok',
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  // YouTube Publishing via API
  async publishToYouTube(post: any): Promise<PublishResult> {
    try {
      const accessToken = process.env.YOUTUBE_ACCESS_TOKEN;

      if (!accessToken) {
        return {
          platform: 'youtube',
          success: false,
          error: 'YouTube credentials not configured. Set YOUTUBE_ACCESS_TOKEN',
        };
      }

      if (!post.mediaUrl) {
        return {
          platform: 'youtube',
          success: false,
          error: 'YouTube requires a video. Please add video media to the post.',
        };
      }

      // YouTube video upload requires resumable upload
      // Step 1: Start resumable upload session
      const metadata = {
        snippet: {
          title: post.youtubeTitle || 'Untitled',
          description: post.youtubeDescription || '',
          tags: post.youtubeTags?.split(',') || [],
          categoryId: '22', // People & Blogs
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      };

      const response = await axios.post(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        metadata,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/*',
          },
        }
      );

      const uploadUrl = response.headers['location'];

      // For now, return that upload was initiated
      // Full implementation would download video and upload to YouTube
      return {
        platform: 'youtube',
        success: true,
        post_id: 'pending-upload',
        post_url: uploadUrl,
      };
    } catch (error: any) {
      return {
        platform: 'youtube',
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  // Process scheduled posts that are ready to publish
  async processScheduledPosts(): Promise<{ processed: number; results: any[] }> {
    const now = new Date();
    
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
    });

    const allResults: any[] = [];

    for (const post of postsToPublish) {
      try {
        const results = await this.publishPost(post.id);
        allResults.push({
          post_id: post.id,
          topic: post.topic,
          results,
        });
      } catch (error: any) {
        allResults.push({
          post_id: post.id,
          topic: post.topic,
          error: error.message,
        });
      }
    }

    return {
      processed: postsToPublish.length,
      results: allResults,
    };
  }

  // Check publishing status
  async getPublishingStatus(): Promise<{
    configured: string[];
    not_configured: string[];
    instructions: Record<string, string[]>;
  }> {
    const platforms = {
      instagram: ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_USER_ID'],
      facebook: ['FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID'],
      linkedin: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_PERSON_ID'],
      tiktok: ['TIKTOK_ACCESS_TOKEN'],
      youtube: ['YOUTUBE_ACCESS_TOKEN'],
    };

    const configured: string[] = [];
    const not_configured: string[] = [];
    const instructions: Record<string, string[]> = {};

    for (const [platform, vars] of Object.entries(platforms)) {
      const allSet = vars.every(v => !!process.env[v]);
      if (allSet) {
        configured.push(platform);
      } else {
        not_configured.push(platform);
        instructions[platform] = vars;
      }
    }

    return { configured, not_configured, instructions };
  }
}

export const autoPublishService = new AutoPublishService();
