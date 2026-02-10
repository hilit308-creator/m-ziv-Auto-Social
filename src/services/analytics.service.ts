import prisma from '../db/database';
import axios from 'axios';

export interface PostAnalytics {
  post_id: string;
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  fetched_at: Date;
}

export interface PlatformStats {
  platform: string;
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  avg_engagement_rate: number;
  best_performing_post?: string;
}

export interface OverallStats {
  total_posts: number;
  published_posts: number;
  scheduled_posts: number;
  draft_posts: number;
  failed_posts: number;
  platforms_used: string[];
  period: {
    start: Date;
    end: Date;
  };
}

export class AnalyticsService {
  
  async getOverallStats(days: number = 30): Promise<OverallStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const platforms = new Set<string>();
    posts.forEach(post => {
      if (post.instagramCaption) platforms.add('instagram');
      if (post.facebookCaption) platforms.add('facebook');
      if (post.linkedinCaption) platforms.add('linkedin');
      if (post.tiktokCaption) platforms.add('tiktok');
      if (post.youtubeTitle) platforms.add('youtube');
    });

    return {
      total_posts: posts.length,
      published_posts: posts.filter(p => p.status === 'published').length,
      scheduled_posts: posts.filter(p => p.status === 'scheduled').length,
      draft_posts: posts.filter(p => p.status === 'draft').length,
      failed_posts: posts.filter(p => p.status === 'failed').length,
      platforms_used: Array.from(platforms),
      period: {
        start: startDate,
        end: new Date(),
      },
    };
  }

  async getPostsByStatus(status: string): Promise<any[]> {
    const posts = await prisma.post.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return posts.map(post => ({
      id: post.id,
      topic: post.topic,
      status: post.status,
      created_at: post.createdAt,
      scheduled_at: post.scheduledAt,
      published_at: post.publishedAt,
    }));
  }

  async getPostsPerDay(days: number = 7): Promise<{ date: string; count: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const countByDay: Record<string, number> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      countByDay[dateStr] = 0;
    }

    posts.forEach(post => {
      const dateStr = post.createdAt.toISOString().split('T')[0];
      if (countByDay[dateStr] !== undefined) {
        countByDay[dateStr]++;
      }
    });

    return Object.entries(countByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getPlatformDistribution(): Promise<{ platform: string; count: number; percentage: number }[]> {
    const posts = await prisma.post.findMany({
      where: {
        status: {
          in: ['published', 'scheduled'],
        },
      },
    });

    const platformCounts: Record<string, number> = {
      instagram: 0,
      facebook: 0,
      linkedin: 0,
      tiktok: 0,
      youtube: 0,
    };

    posts.forEach(post => {
      if (post.instagramCaption) platformCounts.instagram++;
      if (post.facebookCaption) platformCounts.facebook++;
      if (post.linkedinCaption) platformCounts.linkedin++;
      if (post.tiktokCaption) platformCounts.tiktok++;
      if (post.youtubeTitle) platformCounts.youtube++;
    });

    const total = Object.values(platformCounts).reduce((a, b) => a + b, 0);

    return Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }

  // Fetch Instagram analytics (requires access token)
  async fetchInstagramAnalytics(postId: string): Promise<PostAnalytics | null> {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) return null;

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${postId}/insights`,
        {
          params: {
            metric: 'engagement,impressions,reach,saved',
            access_token: accessToken,
          },
        }
      );

      const data = response.data.data;
      return {
        post_id: postId,
        platform: 'instagram',
        likes: data.find((m: any) => m.name === 'likes')?.values[0]?.value || 0,
        comments: data.find((m: any) => m.name === 'comments')?.values[0]?.value || 0,
        shares: data.find((m: any) => m.name === 'shares')?.values[0]?.value || 0,
        reach: data.find((m: any) => m.name === 'reach')?.values[0]?.value || 0,
        impressions: data.find((m: any) => m.name === 'impressions')?.values[0]?.value || 0,
        engagement_rate: 0,
        fetched_at: new Date(),
      };
    } catch (error) {
      console.error('Error fetching Instagram analytics:', error);
      return null;
    }
  }

  // Get top performing topics
  async getTopTopics(limit: number = 5): Promise<{ topic: string; count: number }[]> {
    const posts = await prisma.post.findMany({
      where: {
        status: 'published',
      },
      select: {
        topic: true,
      },
    });

    const topicCounts: Record<string, number> = {};
    posts.forEach(post => {
      const topic = post.topic.toLowerCase().trim();
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([topic, count]) => ({ topic, count }));
  }
}

export const analyticsService = new AnalyticsService();
