import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export interface Comment {
  id: string;
  platform: string;
  post_id: string;
  author: string;
  text: string;
  created_at: Date;
}

export interface ReplyResult {
  comment_id: string;
  reply_text: string;
  action: 'auto_reply' | 'escalate' | 'ignore';
  reason?: string;
}

export interface AutoReplyConfig {
  enabled: boolean;
  tone: string;
  language: string;
  escalate_keywords: string[];
  ignore_keywords: string[];
  max_reply_length: number;
}

export class AutoReplyService {
  private openai: OpenAI;
  private config: AutoReplyConfig;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.config = {
      enabled: true,
      tone: 'מקצועי וחם',
      language: 'עברית',
      escalate_keywords: ['תלונה', 'בעיה', 'כועס', 'החזר', 'עורך דין'],
      ignore_keywords: ['ספאם', 'פרסומת', '🔥🔥🔥', 'עקבו'],
      max_reply_length: 280,
    };
  }

  async analyzeComment(comment: Comment): Promise<ReplyResult> {
    const lowerText = comment.text.toLowerCase();

    // Check for ignore keywords (spam)
    if (this.config.ignore_keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      return {
        comment_id: comment.id,
        reply_text: '',
        action: 'ignore',
        reason: 'Detected as spam or irrelevant',
      };
    }

    // Check for escalation keywords
    if (this.config.escalate_keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      return {
        comment_id: comment.id,
        reply_text: '',
        action: 'escalate',
        reason: 'Contains sensitive keywords requiring human attention',
      };
    }

    // Generate AI reply
    const reply = await this.generateReply(comment);
    
    return {
      comment_id: comment.id,
      reply_text: reply,
      action: 'auto_reply',
    };
  }

  async generateReply(comment: Comment): Promise<string> {
    const prompt = `אתה נציג שירות לקוחות עבור עסק.
טון: ${this.config.tone}
שפה: ${this.config.language}

תגובה שקיבלנו:
"${comment.text}"

מאת: ${comment.author}
פלטפורמה: ${comment.platform}

כתוב תשובה קצרה ומקצועית (עד ${this.config.max_reply_length} תווים).
אל תשתמש בסמיילים יותר מדי.
אם זו שאלה - ענה עליה.
אם זו מחמאה - תודה בחום.
אם זו ביקורת בונה - קבל בהבנה והבטח לשפר.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0].message.content?.trim() || 'תודה על התגובה! 🙏';
  }

  async generateBulkReplies(comments: Comment[]): Promise<ReplyResult[]> {
    const results: ReplyResult[] = [];

    for (const comment of comments) {
      const result = await this.analyzeComment(comment);
      results.push(result);
    }

    return results;
  }

  async getCommonQuestions(): Promise<{ question: string; answer: string }[]> {
    return [
      {
        question: 'מה שעות הפעילות?',
        answer: 'אנחנו פעילים ימים א-ה בין 09:00-18:00. ניתן להשאיר הודעה בכל שעה!',
      },
      {
        question: 'איך אפשר ליצור קשר?',
        answer: 'אפשר לשלוח הודעה כאן או להתקשר למספר שבביו. נשמח לעזור!',
      },
      {
        question: 'מה המחירים?',
        answer: 'המחירים משתנים לפי השירות. שלח הודעה פרטית ונשמח לתת הצעת מחיר מותאמת.',
      },
      {
        question: 'יש אחריות?',
        answer: 'בהחלט! אנחנו עומדים מאחורי השירות שלנו. פרטים מלאים בהודעה פרטית.',
      },
    ];
  }

  updateConfig(newConfig: Partial<AutoReplyConfig>): AutoReplyConfig {
    this.config = { ...this.config, ...newConfig };
    return this.config;
  }

  getConfig(): AutoReplyConfig {
    return this.config;
  }
}

export const autoReplyService = new AutoReplyService();
