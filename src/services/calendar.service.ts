import prisma from '../db/database';

export interface CalendarDay {
  date: string;
  posts: CalendarPost[];
}

export interface CalendarPost {
  id: string;
  topic: string;
  status: string;
  scheduled_at?: Date | null;
  platforms: string[];
  has_media: boolean;
}

export interface CalendarWeek {
  week_start: string;
  week_end: string;
  days: CalendarDay[];
  total_posts: number;
  scheduled_count: number;
  draft_count: number;
}

export class CalendarService {
  async getWeek(startDate?: Date): Promise<CalendarWeek> {
    const start = startDate || this.getWeekStart(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            scheduledAt: {
              gte: start,
              lte: end,
            },
          },
          {
            createdAt: {
              gte: start,
              lte: end,
            },
            scheduledAt: null,
          },
        ],
      },
      orderBy: { scheduledAt: 'asc' },
    });

    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayPosts = posts.filter(p => {
        const postDate = p.scheduledAt || p.createdAt;
        return postDate.toISOString().split('T')[0] === dateStr;
      });

      days.push({
        date: dateStr,
        posts: dayPosts.map(p => this.formatCalendarPost(p)),
      });
    }

    return {
      week_start: start.toISOString().split('T')[0],
      week_end: end.toISOString().split('T')[0],
      days,
      total_posts: posts.length,
      scheduled_count: posts.filter(p => p.status === 'scheduled').length,
      draft_count: posts.filter(p => p.status === 'draft').length,
    };
  }

  async getMonth(year: number, month: number): Promise<CalendarDay[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            scheduledAt: {
              gte: start,
              lte: end,
            },
          },
          {
            createdAt: {
              gte: start,
              lte: end,
            },
            scheduledAt: null,
          },
        ],
      },
      orderBy: { scheduledAt: 'asc' },
    });

    const days: CalendarDay[] = [];
    const daysInMonth = end.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];

      const dayPosts = posts.filter(p => {
        const postDate = p.scheduledAt || p.createdAt;
        return postDate.toISOString().split('T')[0] === dateStr;
      });

      days.push({
        date: dateStr,
        posts: dayPosts.map(p => this.formatCalendarPost(p)),
      });
    }

    return days;
  }

  async schedulePost(postId: string, scheduledAt: Date): Promise<boolean> {
    try {
      await prisma.post.update({
        where: { id: postId },
        data: {
          scheduledAt,
          status: 'scheduled',
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async unschedulePost(postId: string): Promise<boolean> {
    try {
      await prisma.post.update({
        where: { id: postId },
        data: {
          scheduledAt: null,
          status: 'draft',
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getScheduledPosts(): Promise<CalendarPost[]> {
    const posts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          gte: new Date(),
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return posts.map(p => this.formatCalendarPost(p));
  }

  async getUpcoming(limit: number = 5): Promise<CalendarPost[]> {
    const posts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          gte: new Date(),
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });

    return posts.map(p => this.formatCalendarPost(p));
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private formatCalendarPost(post: any): CalendarPost {
    const platforms: string[] = [];
    if (post.instagramCaption) platforms.push('instagram');
    if (post.facebookCaption) platforms.push('facebook');
    if (post.tiktokCaption) platforms.push('tiktok');
    if (post.youtubeTitle) platforms.push('youtube');
    if (post.linkedinCaption) platforms.push('linkedin');

    return {
      id: post.id,
      topic: post.topic,
      status: post.status,
      scheduled_at: post.scheduledAt,
      platforms,
      has_media: !!post.mediaUrl,
    };
  }
}

export const calendarService = new CalendarService();
