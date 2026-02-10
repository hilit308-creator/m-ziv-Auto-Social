import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

interface GenerateContentOptions {
  topic: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  tone?: 'casual' | 'professional' | 'inspirational' | 'humorous';
  brandVoice?: string;
  targetAudience?: string;
  length?: number;
}

interface GeneratedContent {
  text: string;
  hashtags: string[];
  alternatives: string[];
  confidence: number;
}

export class AIService {
  private openai: OpenAI;
  private _anthropic: Anthropic;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this._anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generatePost(options: GenerateContentOptions): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(options);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert specializing in creating engaging content.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      n: 3,
    });

    const responses = completion.choices.map(choice => choice.message.content || '');
    const mainContent = responses[0];
    
    const hashtags = await this.generateHashtags({
      content: mainContent,
      platform: options.platform,
    });

    return {
      text: mainContent,
      hashtags,
      alternatives: responses.slice(1),
      confidence: this.calculateConfidence(mainContent),
    };
  }

  async generateHashtags(options: {
    content: string;
    platform: string;
    count?: number;
  }): Promise<string[]> {
    const { content, platform, count = 30 } = options;

    const prompt = `Generate ${count} relevant hashtags for this ${platform} post:

"${content}"

Provide hashtags in 3 categories:
- 10 high volume (100K-1M posts)
- 10 medium volume (10K-100K posts)
- 10 niche/specific (<10K posts)

Return only the hashtags, one per line, without the # symbol.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const hashtagText = completion.choices[0].message.content || '';
    return hashtagText
      .split('\n')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => (tag.startsWith('#') ? tag : `#${tag}`));
  }

  async generateImage(options: {
    prompt: string;
    style?: string;
    size?: '1024x1024' | '1792x1024' | '1024x1792';
  }): Promise<string> {
    const { prompt, style = 'natural', size = '1024x1024' } = options;

    const enhancedPrompt = `${prompt}, ${style} style, high quality, professional`;

    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size,
      quality: 'hd',
    });

    return response.data?.[0]?.url || '';
  }

  async analyzeContent(content: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    suggestions: string[];
  }> {
    const prompt = `Analyze this social media content:

"${content}"

Provide:
1. Sentiment (positive/neutral/negative)
2. Main topics (3-5 keywords)
3. Improvement suggestions (3 points)

Format as JSON.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  async generateReply(options: {
    comment: string;
    sentiment: string;
    brandVoice: string;
  }): Promise<string> {
    const { comment, sentiment, brandVoice } = options;

    const prompt = `You are a friendly brand representative responding to customer comments.

Original comment: "${comment}"
Sentiment: ${sentiment}
Brand voice: ${brandVoice}

Create a warm, authentic response that:
- Thanks the commenter (if positive)
- Addresses their concern (if negative)
- Adds value or insight
- Encourages further engagement
- Length: 20-40 words
- Uses 1-2 emojis

Keep it genuine, not robotic.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || '';
  }

  private buildPrompt(options: GenerateContentOptions): string {
    const {
      topic,
      platform,
      tone = 'casual',
      brandVoice = 'friendly and authentic',
      targetAudience = 'general audience',
      length = 150,
    } = options;

    return `Create an engaging ${platform} post about: ${topic}

Requirements:
- Tone: ${tone}
- Length: ${length}-${length + 50} words
- Include a hook in the first line
- Add a call-to-action at the end
- Make it conversational and authentic
- Use emojis strategically (2-4 emojis)
- End with a question to encourage engagement

Brand voice: ${brandVoice}
Target audience: ${targetAudience}

Provide only the post text, without any additional formatting or labels.`;
  }

  private calculateConfidence(content: string): number {
    let score = 0.5;

    if (content.length > 50) score += 0.1;
    if (content.length < 500) score += 0.1;
    if (content.includes('?')) score += 0.1;
    if (/\p{Emoji}/u.test(content)) score += 0.1;
    if (content.split('\n').length > 1) score += 0.1;

    return Math.min(score, 1.0);
  }
}

export const aiService = new AIService();
