import prisma from '../db/database';

export interface ScheduledPost {
  id: string;
  topic: string;
  scheduled_at: Date;
  platforms: string[];
  status: string;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  post_url?: string;
  error?: string;
}

export class SchedulerService {
  async getPostsToPublish(): Promise<ScheduledPost[]> {
    const now = new Date();
    const posts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return posts.map(p => this.formatScheduledPost(p));
  }

  async markAsPublished(postId: string, results: PublishResult[]): Promise<void> {
    const allSuccess = results.every(r => r.success);
    
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: allSuccess ? 'published' : 'failed',
        publishedAt: allSuccess ? new Date() : null,
      },
    });
  }

  async getPublishQueue(): Promise<ScheduledPost[]> {
    const nextHour = new Date(Date.now() + 60 * 60 * 1000);
    
    const posts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: nextHour,
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return posts.map(p => this.formatScheduledPost(p));
  }

  async retryFailed(postId: string): Promise<boolean> {
    try {
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'scheduled',
          scheduledAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  private formatScheduledPost(post: any): ScheduledPost {
    const platforms: string[] = [];
    if (post.instagramCaption) platforms.push('instagram');
    if (post.facebookCaption) platforms.push('facebook');
    if (post.tiktokCaption) platforms.push('tiktok');
    if (post.youtubeTitle) platforms.push('youtube');
    if (post.linkedinCaption) platforms.push('linkedin');

    return {
      id: post.id,
      topic: post.topic,
      scheduled_at: post.scheduledAt,
      platforms,
      status: post.status,
    };
  }
}

export const schedulerService = new SchedulerService();
