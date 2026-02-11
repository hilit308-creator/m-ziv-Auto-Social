import prisma from '../db/database';

export interface CreateTemplateInput {
  name: string;
  platform: string;
  category: string;
  template: string;
  variables?: string[];
  userId?: string;
}

export class TemplatesService {
  async createTemplate(input: CreateTemplateInput) {
    const template = await prisma.aITemplate.create({
      data: {
        name: input.name,
        platform: input.platform,
        category: input.category,
        template: input.template,
        variables: input.variables ? JSON.stringify(input.variables) : null,
        userId: input.userId,
        isDefault: !input.userId,
      },
    });

    return template;
  }

  async getTemplates(userId?: string, platform?: string, category?: string) {
    const where: any = {
      OR: [
        { isDefault: true },
        { userId: userId },
      ],
    };

    if (platform) where.platform = platform;
    if (category) where.category = category;

    const templates = await prisma.aITemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return templates.map((t) => ({
      ...t,
      variables: t.variables ? JSON.parse(t.variables) : [],
    }));
  }

  async getTemplate(id: string) {
    const template = await prisma.aITemplate.findUnique({
      where: { id },
    });

    if (!template) throw new Error('Template not found');

    return {
      ...template,
      variables: template.variables ? JSON.parse(template.variables) : [],
    };
  }

  async updateTemplate(id: string, userId: string, data: Partial<CreateTemplateInput>) {
    const template = await prisma.aITemplate.findFirst({
      where: { id, userId },
    });

    if (!template) throw new Error('Template not found or not owned by user');

    const updated = await prisma.aITemplate.update({
      where: { id },
      data: {
        name: data.name,
        platform: data.platform,
        category: data.category,
        template: data.template,
        variables: data.variables ? JSON.stringify(data.variables) : undefined,
      },
    });

    return updated;
  }

  async deleteTemplate(id: string, userId: string) {
    const template = await prisma.aITemplate.findFirst({
      where: { id, userId },
    });

    if (!template) throw new Error('Template not found or not owned by user');

    await prisma.aITemplate.delete({ where: { id } });
    return { success: true };
  }

  async seedDefaultTemplates() {
    const defaults = [
      {
        name: 'פוסט מקצועי לינקדאין',
        platform: 'linkedin',
        category: 'educational',
        template: `צור פוסט לינקדאין מקצועי על הנושא: {{topic}}
        
טון: מקצועי אך נגיש
אורך: 150-200 מילים
כלול: פתיחה מעניינת, 3 נקודות עיקריות, קריאה לפעולה
השתמש באימוג'ים בצורה מינימלית`,
        variables: ['topic'],
      },
      {
        name: 'Reel לאינסטגרם',
        platform: 'instagram',
        category: 'engagement',
        template: `צור טקסט ל-Reel באינסטגרם על: {{topic}}

סגנון: קצר, אנרגטי, תופס תשומת לב
אורך: עד 50 מילים
כלול: Hook בפתיחה, מסר ברור, CTA
הוסף 5-10 האשטגים רלוונטיים`,
        variables: ['topic'],
      },
      {
        name: 'סטורי עם שאלה',
        platform: 'instagram',
        category: 'engagement',
        template: `צור טקסט לסטורי עם שאלה לקהל על: {{topic}}

סגנון: קליל ומזמין
אורך: משפט אחד + שאלה
מטרה: עידוד אינטראקציה`,
        variables: ['topic'],
      },
      {
        name: 'טוויט ויראלי',
        platform: 'twitter',
        category: 'engagement',
        template: `צור טוויט על: {{topic}}

אורך: עד 280 תווים
סגנון: חד, מתוחכם, שיתופי
כלול: אמירה מפתיעה או שאלה מעוררת מחשבה`,
        variables: ['topic'],
      },
      {
        name: 'Thread חינוכי',
        platform: 'twitter',
        category: 'educational',
        template: `צור Thread של 5 טוויטים על: {{topic}}

מבנה:
1. Hook - משפט פתיחה תופס
2-4. 3 נקודות עיקריות
5. סיכום + CTA

כל טוויט עד 280 תווים`,
        variables: ['topic'],
      },
      {
        name: 'תיאור יוטיוב',
        platform: 'youtube',
        category: 'promo',
        template: `צור תיאור לסרטון יוטיוב על: {{topic}}

כותרת: תופסת עין, עד 60 תווים
תיאור: 200 מילים עם:
- פסקה ראשונה מושכת
- נקודות עיקריות בבולטים
- קישורים וטיימסטמפים
- תגיות רלוונטיות`,
        variables: ['topic'],
      },
      {
        name: 'TikTok טרנדי',
        platform: 'tiktok',
        category: 'engagement',
        template: `צור טקסט ל-TikTok על: {{topic}}

סגנון: צעיר, טרנדי, אותנטי
אורך: עד 30 מילים
כלול: Hook מיידי, תוכן בעל ערך
הוסף האשטגים פופולריים`,
        variables: ['topic'],
      },
      {
        name: 'פוסט מכירות',
        platform: 'all',
        category: 'promo',
        template: `צור פוסט מכירות עבור: {{product}}

מבנה AIDA:
- Attention: פתיחה תופסת
- Interest: הצגת הבעיה
- Desire: הפתרון והיתרונות
- Action: קריאה לפעולה ברורה

טון: משכנע אך לא אגרסיבי`,
        variables: ['product'],
      },
    ];

    for (const template of defaults) {
      const existing = await prisma.aITemplate.findFirst({
        where: { name: template.name, isDefault: true },
      });

      if (!existing) {
        await prisma.aITemplate.create({
          data: {
            ...template,
            variables: JSON.stringify(template.variables),
            isDefault: true,
          },
        });
      }
    }

    return { seeded: defaults.length };
  }
}

export const templatesService = new TemplatesService();
