import prisma from '../db/database';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export interface ContentIdea {
  id: string;
  topic: string;
  description: string;
  category: string;
  used: boolean;
}

export class IdeasService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getTodayIdea(): Promise<ContentIdea> {
    const existingIdea = await prisma.contentIdea.findFirst({
      where: {
        used: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (existingIdea) {
      return this.formatIdea(existingIdea);
    }

    const newIdea = await this.generateIdea();
    return newIdea;
  }

  async generateIdea(): Promise<ContentIdea> {
    const profile = await prisma.brandProfile.findFirst();
    
    const businessType = profile?.businessType || 'ייעוץ עסקי';
    const targetAudience = profile?.targetAudience || 'בעלי עסקים קטנים ובינוניים';

    const categories = ['tips', 'story', 'promo', 'educational'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const categoryPrompts: Record<string, string> = {
      tips: 'טיפ מעשי וישים',
      story: 'סיפור אישי או case study',
      promo: 'קידום שירות או הצעה',
      educational: 'תוכן לימודי ומעשיר',
    };

    const prompt = `אתה יועץ תוכן לעסק בתחום ${businessType}.
קהל היעד: ${targetAudience}

צור רעיון לפוסט מסוג: ${categoryPrompts[randomCategory]}

החזר JSON:
{
  "topic": "נושא הפוסט (משפט קצר)",
  "description": "תיאור מה לצלם/להכין (2-3 משפטים)",
  "category": "${randomCategory}"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    const idea = await prisma.contentIdea.create({
      data: {
        topic: result.topic || 'רעיון לפוסט',
        description: result.description || '',
        category: result.category || randomCategory,
      },
    });

    return this.formatIdea(idea);
  }

  async markAsUsed(id: string): Promise<boolean> {
    try {
      await prisma.contentIdea.update({
        where: { id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getAll(used?: boolean): Promise<ContentIdea[]> {
    const ideas = await prisma.contentIdea.findMany({
      where: used !== undefined ? { used } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return ideas.map(idea => this.formatIdea(idea));
  }

  private formatIdea(idea: any): ContentIdea {
    return {
      id: idea.id,
      topic: idea.topic,
      description: idea.description || '',
      category: idea.category || 'tips',
      used: idea.used,
    };
  }
}

export const ideasService = new IdeasService();
