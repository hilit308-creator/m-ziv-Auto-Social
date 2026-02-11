import { multiAIService } from './multi-ai.service';

export interface SpamCheckResult {
  isSpam: boolean;
  confidence: number;
  reason?: string;
  category?: 'spam' | 'offensive' | 'promotional' | 'scam' | 'clean';
}

export interface CommentAnalysis {
  spam: SpamCheckResult;
  sentiment: 'positive' | 'negative' | 'neutral';
  needsHumanReview: boolean;
  suggestedAction: 'approve' | 'delete' | 'review' | 'reply';
}

export class SpamService {
  private spamKeywords: string[] = [
    'click here',
    'free money',
    'make money fast',
    'buy now',
    'limited offer',
    'act now',
    'winner',
    'congratulations you won',
    'dm for collab',
    'check my profile',
    'follow for follow',
    'f4f',
    'l4l',
    'הקליקו כאן',
    'כסף קל',
    'הזדמנות חד פעמית',
    'עקבו אחרי',
  ];

  private offensivePatterns: RegExp[] = [
    /\b(idiot|stupid|dumb|loser)\b/i,
    /\b(scam|fake|fraud)\b/i,
  ];

  async checkSpam(text: string): Promise<SpamCheckResult> {
    // Quick keyword check first
    const keywordResult = this.keywordCheck(text);
    if (keywordResult.isSpam && keywordResult.confidence > 0.8) {
      return keywordResult;
    }

    // AI-based check for more nuanced detection
    try {
      const aiResult = await this.aiCheck(text);
      
      // Combine results
      if (aiResult.isSpam || keywordResult.isSpam) {
        return {
          isSpam: true,
          confidence: Math.max(aiResult.confidence, keywordResult.confidence),
          reason: aiResult.reason || keywordResult.reason,
          category: aiResult.category || keywordResult.category,
        };
      }

      return aiResult;
    } catch {
      // Fallback to keyword check if AI fails
      return keywordResult;
    }
  }

  private keywordCheck(text: string): SpamCheckResult {
    const lowerText = text.toLowerCase();
    
    // Check spam keywords
    for (const keyword of this.spamKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return {
          isSpam: true,
          confidence: 0.85,
          reason: `Contains spam keyword: "${keyword}"`,
          category: 'spam',
        };
      }
    }

    // Check offensive patterns
    for (const pattern of this.offensivePatterns) {
      if (pattern.test(text)) {
        return {
          isSpam: true,
          confidence: 0.9,
          reason: 'Contains offensive content',
          category: 'offensive',
        };
      }
    }

    // Check for excessive links
    const urlCount = (text.match(/https?:\/\//g) || []).length;
    if (urlCount > 2) {
      return {
        isSpam: true,
        confidence: 0.7,
        reason: 'Contains too many links',
        category: 'promotional',
      };
    }

    // Check for excessive emojis (potential spam)
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 10) {
      return {
        isSpam: true,
        confidence: 0.6,
        reason: 'Excessive emoji usage',
        category: 'spam',
      };
    }

    return {
      isSpam: false,
      confidence: 0.9,
      category: 'clean',
    };
  }

  private async aiCheck(text: string): Promise<SpamCheckResult> {
    const prompt = `Analyze this social media comment for spam/inappropriate content.

Comment: "${text}"

Respond in JSON:
{
  "isSpam": boolean,
  "confidence": 0.0-1.0,
  "reason": "explanation if spam",
  "category": "spam" | "offensive" | "promotional" | "scam" | "clean"
}`;

    const result = await multiAIService.generateJSON({ prompt });

    return {
      isSpam: result.isSpam || false,
      confidence: result.confidence || 0.5,
      reason: result.reason,
      category: result.category || 'clean',
    };
  }

  async analyzeComment(comment: string): Promise<CommentAnalysis> {
    const spam = await this.checkSpam(comment);

    const prompt = `Analyze this comment sentiment:
"${comment}"

Respond in JSON: { "sentiment": "positive" | "negative" | "neutral" }`;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    try {
      const result = await multiAIService.generateJSON({ prompt });
      sentiment = result.sentiment || 'neutral';
    } catch {
      sentiment = 'neutral';
    }

    const needsHumanReview = 
      (spam.isSpam && spam.confidence < 0.8) ||
      sentiment === 'negative' ||
      spam.category === 'offensive';

    let suggestedAction: 'approve' | 'delete' | 'review' | 'reply' = 'approve';
    if (spam.isSpam && spam.confidence > 0.9) {
      suggestedAction = 'delete';
    } else if (needsHumanReview) {
      suggestedAction = 'review';
    } else if (sentiment === 'positive' || sentiment === 'neutral') {
      suggestedAction = 'reply';
    }

    return {
      spam,
      sentiment,
      needsHumanReview,
      suggestedAction,
    };
  }

  async bulkCheck(comments: string[]): Promise<CommentAnalysis[]> {
    return Promise.all(comments.map((c) => this.analyzeComment(c)));
  }

  addSpamKeyword(keyword: string) {
    if (!this.spamKeywords.includes(keyword.toLowerCase())) {
      this.spamKeywords.push(keyword.toLowerCase());
    }
  }

  removeSpamKeyword(keyword: string) {
    this.spamKeywords = this.spamKeywords.filter(
      (k) => k.toLowerCase() !== keyword.toLowerCase()
    );
  }

  getSpamKeywords(): string[] {
    return [...this.spamKeywords];
  }
}

export const spamService = new SpamService();
