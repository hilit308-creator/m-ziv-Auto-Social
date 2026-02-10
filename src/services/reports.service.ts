import prisma from '../db/database';
import { analyticsService } from './analytics.service';

export interface DailyReport {
  date: string;
  posts_created: number;
  posts_published: number;
  posts_scheduled: number;
  platforms: string[];
  top_topic?: string;
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  total_posts: number;
  published: number;
  scheduled: number;
  failed: number;
  platform_breakdown: { platform: string; count: number }[];
  daily_breakdown: DailyReport[];
  recommendations: string[];
}

export interface MonthlyReport {
  month: string;
  year: number;
  total_posts: number;
  published: number;
  avg_posts_per_day: number;
  best_day: string;
  platform_breakdown: { platform: string; count: number; percentage: number }[];
  weekly_trend: { week: number; count: number }[];
  recommendations: string[];
}

export class ReportsService {
  
  async getDailyReport(date?: Date): Promise<DailyReport> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
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
      date: targetDate.toISOString().split('T')[0],
      posts_created: posts.length,
      posts_published: posts.filter(p => p.status === 'published').length,
      posts_scheduled: posts.filter(p => p.status === 'scheduled').length,
      platforms: Array.from(platforms),
      top_topic: posts[0]?.topic,
    };
  }

  async getWeeklyReport(startDate?: Date): Promise<WeeklyReport> {
    const start = startDate || this.getWeekStart(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const platformCounts: Record<string, number> = {};
    posts.forEach(post => {
      if (post.instagramCaption) platformCounts.instagram = (platformCounts.instagram || 0) + 1;
      if (post.facebookCaption) platformCounts.facebook = (platformCounts.facebook || 0) + 1;
      if (post.linkedinCaption) platformCounts.linkedin = (platformCounts.linkedin || 0) + 1;
      if (post.tiktokCaption) platformCounts.tiktok = (platformCounts.tiktok || 0) + 1;
      if (post.youtubeTitle) platformCounts.youtube = (platformCounts.youtube || 0) + 1;
    });

    const dailyBreakdown: DailyReport[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      dailyBreakdown.push(await this.getDailyReport(day));
    }

    const recommendations = this.generateRecommendations(posts, platformCounts);

    return {
      week_start: start.toISOString().split('T')[0],
      week_end: end.toISOString().split('T')[0],
      total_posts: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      scheduled: posts.filter(p => p.status === 'scheduled').length,
      failed: posts.filter(p => p.status === 'failed').length,
      platform_breakdown: Object.entries(platformCounts).map(([platform, count]) => ({ platform, count })),
      daily_breakdown: dailyBreakdown,
      recommendations,
    };
  }

  async getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const platformCounts: Record<string, number> = {};
    const dayOfWeekCounts: Record<string, number> = {};
    const weekCounts: Record<number, number> = {};

    posts.forEach(post => {
      if (post.instagramCaption) platformCounts.instagram = (platformCounts.instagram || 0) + 1;
      if (post.facebookCaption) platformCounts.facebook = (platformCounts.facebook || 0) + 1;
      if (post.linkedinCaption) platformCounts.linkedin = (platformCounts.linkedin || 0) + 1;
      if (post.tiktokCaption) platformCounts.tiktok = (platformCounts.tiktok || 0) + 1;
      if (post.youtubeTitle) platformCounts.youtube = (platformCounts.youtube || 0) + 1;

      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][post.createdAt.getDay()];
      dayOfWeekCounts[dayName] = (dayOfWeekCounts[dayName] || 0) + 1;

      const weekNum = Math.ceil(post.createdAt.getDate() / 7);
      weekCounts[weekNum] = (weekCounts[weekNum] || 0) + 1;
    });

    const totalPlatformPosts = Object.values(platformCounts).reduce((a, b) => a + b, 0);
    const daysInMonth = end.getDate();
    const bestDay = Object.entries(dayOfWeekCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const recommendations = this.generateRecommendations(posts, platformCounts);

    return {
      month: start.toLocaleString('he-IL', { month: 'long' }),
      year,
      total_posts: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      avg_posts_per_day: Math.round((posts.length / daysInMonth) * 10) / 10,
      best_day: bestDay,
      platform_breakdown: Object.entries(platformCounts).map(([platform, count]) => ({
        platform,
        count,
        percentage: totalPlatformPosts > 0 ? Math.round((count / totalPlatformPosts) * 100) : 0,
      })),
      weekly_trend: Object.entries(weekCounts).map(([week, count]) => ({
        week: parseInt(week),
        count,
      })),
      recommendations,
    };
  }

  private generateRecommendations(posts: any[], platformCounts: Record<string, number>): string[] {
    const recommendations: string[] = [];

    if (posts.length === 0) {
      recommendations.push('לא נוצרו פוסטים בתקופה זו. נסה ליצור לפחות פוסט אחד ביום.');
    }

    const failedCount = posts.filter(p => p.status === 'failed').length;
    if (failedCount > 0) {
      recommendations.push(`${failedCount} פוסטים נכשלו בפרסום. בדוק את ההגדרות והחיבורים לרשתות.`);
    }

    if (!platformCounts.instagram && !platformCounts.facebook) {
      recommendations.push('אין פוסטים לאינסטגרם או פייסבוק. אלה הפלטפורמות הפופולריות ביותר.');
    }

    if (platformCounts.linkedin && platformCounts.linkedin < 2) {
      recommendations.push('לינקדאין דורש עקביות. נסה לפרסם לפחות 2-3 פעמים בשבוע.');
    }

    const draftCount = posts.filter(p => p.status === 'draft').length;
    if (draftCount > 5) {
      recommendations.push(`יש לך ${draftCount} טיוטות שלא פורסמו. שקול לתזמן אותן.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('עבודה מצוינת! המשך לפרסם באופן עקבי.');
    }

    return recommendations;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

export const reportsService = new ReportsService();
