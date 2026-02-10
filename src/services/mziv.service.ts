import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

interface BrandProfile {
  name: string;
  business_type: string;
  tone: string;
  language: string;
  default_cta?: string;
}

interface CaptionInput {
  brand: BrandProfile;
  content: {
    video_description: string;
    voice_notes?: string;
    key_points?: string[];
    offer_or_service?: string;
    target_audience: string;
  };
  platform: 'instagram' | 'tiktok' | 'facebook' | 'linkedin' | 'youtube';
  constraints: {
    max_words: number;
    include_hook: boolean;
    include_cta: boolean;
    avoid?: string[];
    emoji_level: 'low' | 'medium' | 'none';
  };
}

interface CaptionOutput {
  caption: string;
  hook: string;
  cta: string;
  style_used: string;
  confidence: number;
  alternatives: Array<{
    caption: string;
    hook: string;
    cta: string;
  }>;
}

interface HashtagsInput {
  caption: string;
  platform: string;
  language: string;
  business_context: {
    business_type: string;
    audience: string;
  };
  constraints: {
    count: number;
    mix: {
      broad: number;
      niche: number;
      branded: number;
    };
    include_branded: string[];
    avoid?: string[];
  };
}

interface HashtagsOutput {
  hashtags: string[];
  branded_hashtags: string[];
  notes?: string;
  hashtags_string?: string;
}

interface TitleInput {
  video_description: string;
  caption: string;
  platform: 'youtube' | 'linkedin';
  constraints: {
    max_chars: number;
    style: string;
  };
}

interface TitleOutput {
  title: string;
  alternatives: string[];
}

interface PostPackInput {
  video_description: string;
  voice_notes?: string;
  platforms: string[];
  brand_profile: BrandProfile;
  constraints: {
    emoji_level: string;
    length_by_platform: {
      [key: string]: number;
    };
  };
}

interface RewriteInput {
  text: string;
  command: string;
  platform: string;
  language: string;
}

export class MZivService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCaption(input: CaptionInput): Promise<CaptionOutput> {
    const prompt = this.buildCaptionPrompt(input);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `אתה כותב תוכן מקצועי לעסקים בעברית. אתה מתמחה ביצירת כתוביות למדיה חברתית עבור ${input.brand.business_type}.
הטון שלך: ${input.brand.tone}
השפה: עברית ברורה ומקצועית
קהל יעד: ${input.content.target_audience}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      caption: result.caption || '',
      hook: result.hook || '',
      cta: result.cta || input.brand.default_cta || '',
      style_used: 'professional_warm',
      confidence: 0.85,
      alternatives: result.alternatives || [],
    };
  }

  async generateHashtags(input: HashtagsInput): Promise<HashtagsOutput> {
    const prompt = `צור ${input.constraints.count} האשטגים עבור הפוסט הבא:

"${input.caption}"

פלטפורמה: ${input.platform}
תחום עסקי: ${input.business_context.business_type}
קהל יעד: ${input.business_context.audience}

חלוקה נדרשת:
- ${input.constraints.mix.broad} האשטגים רחבים (פופולריים)
- ${input.constraints.mix.niche} האשטגים ממוקדים (נישה)
- ${input.constraints.mix.branded} האשטגים ממותגים: ${input.constraints.include_branded.join(', ')}

דרישות:
- רלוונטי לתוכן
- מתאים לפלטפורמה
- שילוב של עברית ואנגלית
- הימנע מ: ${input.constraints.avoid?.join(', ') || 'ספאם, לא רלוונטי'}

החזר JSON עם:
{
  "hashtags": ["#...", "#..."],
  "notes": "הסבר קצר למה בחרת באלו"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    const hashtags = result.hashtags || [];

    return {
      hashtags,
      branded_hashtags: input.constraints.include_branded,
      notes: result.notes,
      hashtags_string: hashtags.join(' '),
    };
  }

  async generateTitle(input: TitleInput): Promise<TitleOutput> {
    const prompt = `צור כותרת ${input.platform === 'youtube' ? 'ליוטיוב' : 'ללינקדאין'} עבור:

תיאור הסרטון: ${input.video_description}
תוכן הכתובית: ${input.caption}

דרישות:
- מקסימום ${input.constraints.max_chars} תווים
- סגנון: ${input.constraints.style}
- עברית ברורה
- מעורר סקרנות
- מקצועי אך חם

החזר JSON עם:
{
  "title": "הכותרת הראשית",
  "alternatives": ["אלטרנטיבה 1", "אלטרנטיבה 2"]
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      title: result.title || '',
      alternatives: result.alternatives || [],
    };
  }

  async generatePostPack(input: PostPackInput): Promise<any> {
    const results: any = {
      by_platform: {},
      meta: {
        topic: '',
        content_type: 'educational',
        best_platform_suggestion: 'instagram',
        publish_time_suggestion: 'Morning (8-10 AM) or Evening (6-8 PM)',
      },
    };

    for (const platform of input.platforms) {
      const maxWords = input.constraints.length_by_platform[platform] || 100;

      const captionInput: CaptionInput = {
        brand: input.brand_profile,
        content: {
          video_description: input.video_description,
          voice_notes: input.voice_notes,
          target_audience: 'Israeli small & medium business owners',
        },
        platform: platform as any,
        constraints: {
          max_words: maxWords,
          include_hook: true,
          include_cta: true,
          emoji_level: input.constraints.emoji_level as any,
        },
      };

      const caption = await this.generateCaption(captionInput);

      const hashtagsInput: HashtagsInput = {
        caption: caption.caption,
        platform,
        language: 'he-IL',
        business_context: {
          business_type: input.brand_profile.business_type,
          audience: 'Israeli small & medium business owners',
        },
        constraints: {
          count: platform === 'linkedin' ? 5 : 12,
          mix: {
            broad: platform === 'linkedin' ? 2 : 4,
            niche: platform === 'linkedin' ? 2 : 6,
            branded: 1,
          },
          include_branded: ['#MZiv', '#מזיו'],
        },
      };

      const hashtags = await this.generateHashtags(hashtagsInput);

      if (platform === 'youtube') {
        const titleResult = await this.generateTitle({
          video_description: input.video_description,
          caption: caption.caption,
          platform: 'youtube',
          constraints: {
            max_chars: 60,
            style: 'clear, curiosity, business consulting',
          },
        });

        results.by_platform[platform] = {
          title: titleResult.title,
          description: caption.caption,
          hashtags: hashtags.hashtags,
        };
      } else {
        results.by_platform[platform] = {
          hook: caption.hook,
          caption: caption.caption,
          cta: caption.cta,
          hashtags: hashtags.hashtags,
        };
      }
    }

    return results;
  }

  async rewriteText(input: RewriteInput): Promise<any> {
    const commandMap: { [key: string]: string } = {
      shorter: 'קצר יותר את הטקסט, שמור על המסר העיקרי',
      more_professional: 'הפוך את הטקסט למקצועי יותר',
      more_warm: 'הפוך את הטקסט לחם ואישי יותר',
      more_salesy: 'הוסף אלמנטים שיווקיים חזקים יותר',
      add_cta: 'הוסף קריאה לפעולה ברורה',
      remove_emojis: 'הסר את כל האימוג׳ים',
      add_emojis_low: 'הוסף 1-2 אימוג׳ים מתאימים',
      make_linkedin_style: 'התאם לסגנון לינקדאין מקצועי',
    };

    const instruction = commandMap[input.command] || input.command;

    const prompt = `${instruction}

טקסט מקורי:
"${input.text}"

פלטפורמה: ${input.platform}
שפה: ${input.language}

החזר JSON עם:
{
  "rewritten_text": "הטקסט המתוקן",
  "diff_summary": "מה השתנה"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  private buildCaptionPrompt(input: CaptionInput): string {
    const voiceNotes = input.content.voice_notes
      ? `\nהערות קוליות: ${input.content.voice_notes}`
      : '';
    const keyPoints = input.content.key_points?.length
      ? `\nנקודות מפתח: ${input.content.key_points.join(', ')}`
      : '';
    const offer = input.content.offer_or_service
      ? `\nהצעה/שירות: ${input.content.offer_or_service}`
      : '';

    return `צור כתובית למדיה חברתית עבור ${input.platform}

תיאור הסרטון: ${input.content.video_description}${voiceNotes}${keyPoints}${offer}

דרישות:
- מקסימום ${input.constraints.max_words} מילים
- ${input.constraints.include_hook ? 'כלול משפט פתיחה חזק (hook)' : ''}
- ${input.constraints.include_cta ? 'כלול קריאה לפעולה (CTA)' : ''}
- רמת אימוג׳ים: ${input.constraints.emoji_level}
- הימנע מ: ${input.constraints.avoid?.join(', ') || 'שפה מכירתית מדי, אנגלית'}

החזר JSON עם:
{
  "caption": "הכתובית המלאה",
  "hook": "משפט הפתיחה",
  "cta": "קריאה לפעולה",
  "alternatives": [
    {"caption": "...", "hook": "...", "cta": "..."},
    {"caption": "...", "hook": "...", "cta": "..."}
  ]
}`;
  }
}

export const mzivService = new MZivService();
