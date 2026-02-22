import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { mzivService } from './mziv.service';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// ============================================
// Interfaces
// ============================================

interface VoicePostInput {
  userId: string;
  audioUrl?: string;
  transcript: string;
  platforms?: string[];
}

interface VoicePostOutput {
  postPack: any;
  transcript: string;
  processedIdea: string;
}

interface IdeaCaptureInput {
  userId: string;
  inputType: 'text' | 'voice' | 'image';
  content: string;
  tags?: string[];
}

interface IdeaOutput {
  id: string;
  rawContent: string;
  processedContent: string;
  suggestedPostType: string;
  suggestedHook: string;
  suggestedPlatforms: string[];
  suggestedPublishTime: string;
}

interface EnergyProfile {
  activeDays: number[];
  preferredStartHour: number;
  preferredEndHour: number;
  peakCreativityHours: number[];
  preferBatchCreation: boolean;
  batchSize: number;
  audienceActiveHours: number[];
}

interface BatchSuggestion {
  suggestedCount: number;
  message: string;
  optimalTimeSlot: string;
  ideas: Array<{
    topic: string;
    contentType: string;
    estimatedMinutes: number;
  }>;
}

interface StyleProfile {
  tonePreference: string;
  emojiUsage: string;
  signaturePhrases: string[];
  avoidWords: string[];
  preferredCTAs: string[];
  platformPreferences: Record<string, any>;
  voiceModelStatus: string;
}

interface BurnoutStatus {
  status: 'healthy' | 'warning' | 'burnout_risk';
  message: string;
  suggestions: string[];
  stats: {
    postsThisWeek: number;
    averagePostsPerWeek: number;
    lastActiveDate: string;
    consecutiveActiveDays: number;
  };
}

interface RecyclingSuggestion {
  postId: string;
  suggestionType: 'refresh' | 'adapt_platform' | 'expand' | 'shorten';
  targetPlatform?: string;
  reason: string;
  suggestedChanges: string;
  originalCaption: string;
}

interface DailyIdeaOutput {
  filmingIdea: string;
  contentType: string;
  suggestedHook: string;
  occasion?: string;
  difficulty: string;
  estimatedTime: number;
  tips: string[];
}

interface ReplySuggestion {
  reply: string;
  tone: string;
  alternatives: string[];
}

// ============================================
// AI Personal Assistant Service
// ============================================

export class AssistantService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 15000,
    });
  }

  // ============================================
  // Speech to Text (Whisper API)
  // ============================================

  async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<{
    transcript: string;
    language: string;
    duration: number;
  }> {
    // Create a temporary file for the audio
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, filename);
    fs.writeFileSync(tempFilePath, audioBuffer);

    try {
      // Use OpenAI Whisper API for transcription
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'he', // Hebrew
        response_format: 'verbose_json',
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      return {
        transcript: transcription.text,
        language: (transcription as any).language || 'he',
        duration: (transcription as any).duration || 0,
      };
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
  }

  async transcribeFromUrl(audioUrl: string): Promise<{
    transcript: string;
    language: string;
    duration: number;
  }> {
    // Download audio from URL
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Extract filename from URL or use default
    const urlParts = audioUrl.split('/');
    const filename = urlParts[urlParts.length - 1] || 'audio.mp3';
    
    return this.transcribeAudio(buffer, filename);
  }

  // ============================================
  // Component 1: Energy Mode
  // ============================================

  async getEnergyProfile(userId: string): Promise<EnergyProfile> {
    let profile = await prisma.energyProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create default profile
      const user = await this.ensureUserProfile(userId);
      profile = await prisma.energyProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    return {
      activeDays: JSON.parse(profile.activeDays),
      preferredStartHour: profile.preferredStartHour,
      preferredEndHour: profile.preferredEndHour,
      peakCreativityHours: JSON.parse(profile.peakCreativityHours),
      preferBatchCreation: profile.preferBatchCreation,
      batchSize: profile.batchSize,
      audienceActiveHours: JSON.parse(profile.audienceActiveHours),
    };
  }

  async updateEnergyProfile(userId: string, updates: Partial<EnergyProfile>): Promise<EnergyProfile> {
    const user = await this.ensureUserProfile(userId);
    
    const updateData: any = {};
    if (updates.activeDays) updateData.activeDays = JSON.stringify(updates.activeDays);
    if (updates.preferredStartHour !== undefined) updateData.preferredStartHour = updates.preferredStartHour;
    if (updates.preferredEndHour !== undefined) updateData.preferredEndHour = updates.preferredEndHour;
    if (updates.peakCreativityHours) updateData.peakCreativityHours = JSON.stringify(updates.peakCreativityHours);
    if (updates.preferBatchCreation !== undefined) updateData.preferBatchCreation = updates.preferBatchCreation;
    if (updates.batchSize !== undefined) updateData.batchSize = updates.batchSize;
    if (updates.audienceActiveHours) updateData.audienceActiveHours = JSON.stringify(updates.audienceActiveHours);

    await prisma.energyProfile.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData,
      },
    });

    return this.getEnergyProfile(userId);
  }

  async getBatchSuggestion(userId: string): Promise<BatchSuggestion> {
    const energyProfile = await this.getEnergyProfile(userId);
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Check if it's an active day
    const isActiveDay = energyProfile.activeDays.includes(currentDay);
    const isWithinHours = currentHour >= energyProfile.preferredStartHour && 
                          currentHour <= energyProfile.preferredEndHour;
    const isPeakTime = energyProfile.peakCreativityHours.includes(currentHour);

    // Get unused ideas for suggestions
    const pendingIdeas = await prisma.idea.findMany({
      where: {
        userId,
        status: { in: ['captured', 'ready'] },
      },
      take: energyProfile.batchSize,
      orderBy: { createdAt: 'desc' },
    });

    let message: string;
    let suggestedCount: number;

    if (!isActiveDay) {
      message = 'היום יום מנוחה לפי ההעדפות שלך. אם בכל זאת בא לך ליצור - אני כאן! 💪';
      suggestedCount = 1;
    } else if (isPeakTime && isWithinHours) {
      message = `זה הזמן המושלם ליצירה! בואי נצלם ${energyProfile.batchSize} סרטונים ברצף 🎬`;
      suggestedCount = energyProfile.batchSize;
    } else if (isWithinHours) {
      message = `יש לך זמן עכשיו? אפשר ליצור ${Math.ceil(energyProfile.batchSize / 2)} תכנים קצרים`;
      suggestedCount = Math.ceil(energyProfile.batchSize / 2);
    } else {
      message = 'זה לא הזמן הרגיל שלך ליצירה, אבל אם יש לך אנרגיה - קדימה!';
      suggestedCount = 1;
    }

    // Generate ideas if we don't have enough
    const ideas = pendingIdeas.map(idea => ({
      topic: idea.rawContent.substring(0, 50),
      contentType: idea.suggestedPostType || 'reel',
      estimatedMinutes: 15,
    }));

    // Fill with AI-generated ideas if needed
    while (ideas.length < suggestedCount) {
      const dailyIdea = await this.generateDailyIdea();
      ideas.push({
        topic: dailyIdea.filmingIdea,
        contentType: dailyIdea.contentType,
        estimatedMinutes: dailyIdea.estimatedTime,
      });
    }

    const optimalTimeSlot = isPeakTime 
      ? 'עכשיו!' 
      : `${energyProfile.peakCreativityHours[0]}:00 - ${energyProfile.peakCreativityHours[energyProfile.peakCreativityHours.length - 1]}:00`;

    return {
      suggestedCount,
      message,
      optimalTimeSlot,
      ideas: ideas.slice(0, suggestedCount),
    };
  }

  // ============================================
  // Component 2: Voice First Creation
  // ============================================

  async createVoicePost(input: VoicePostInput): Promise<VoicePostOutput> {
    const { userId, audioUrl, transcript, platforms = ['instagram', 'facebook', 'tiktok'] } = input;

    // Log activity
    await this.logActivity(userId, 'post_created', { inputType: 'voice' });

    // Save voice sample for learning if user consented
    const user = await this.ensureUserProfile(userId);
    if (user.voiceDataConsent && audioUrl) {
      await prisma.voiceSample.create({
        data: {
          userId: user.id,
          audioUrl,
          transcript,
        },
      });
    }

    // Process transcript with AI to extract key points
    const processedIdea = await this.processVoiceTranscript(transcript);

    // Get user's style profile for personalization
    const styleProfile = await this.getStyleProfile(userId);

    // Generate post pack using the existing M-Ziv service
    const postPack = await mzivService.generatePostPack({
      video_description: processedIdea,
      voice_notes: transcript,
      platforms,
      brand_profile: {
        name: 'M-Ziv',
        business_type: 'ייעוץ עסקי',
        tone: styleProfile.tonePreference === 'warm_professional' ? 'מקצועי וחם' : styleProfile.tonePreference,
        language: 'עברית',
      },
      constraints: {
        emoji_level: styleProfile.emojiUsage,
        length_by_platform: {
          instagram: 50,
          facebook: 100,
          tiktok: 30,
          linkedin: 150,
          youtube: 200,
        },
      },
    });

    return {
      postPack,
      transcript,
      processedIdea,
    };
  }

  private async processVoiceTranscript(transcript: string): Promise<string> {
    const prompt = `אני מקבל תמליל של הערות קוליות מבעלת עסק שמתארת סרטון שצילמה.
עזור לי להפוך את זה לתיאור ברור ומסודר.

תמליל:
"${transcript}"

החזר JSON עם:
{
  "processed_description": "תיאור מסודר של התוכן",
  "key_points": ["נקודה 1", "נקודה 2"],
  "suggested_hook": "משפט פתיחה מוצע",
  "content_type": "educational/inspirational/promotional/story"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result.processed_description || transcript;
  }

  // ============================================
  // Component 3: Idea Capture Library
  // ============================================

  async captureIdea(input: IdeaCaptureInput): Promise<IdeaOutput> {
    const { userId, inputType, content, tags } = input;
    const user = await this.ensureUserProfile(userId);

    // Log activity
    await this.logActivity(userId, 'idea_captured', { inputType });

    // Process the idea with AI
    const aiSuggestions = await this.processIdeaWithAI(content, inputType);

    // Save to database
    const idea = await prisma.idea.create({
      data: {
        userId: user.id,
        inputType,
        rawContent: content,
        processedContent: aiSuggestions.processedContent,
        suggestedPostType: aiSuggestions.postType,
        suggestedHook: aiSuggestions.hook,
        suggestedPlatforms: JSON.stringify(aiSuggestions.platforms),
        suggestedPublishTime: aiSuggestions.publishTime,
        tags: tags ? JSON.stringify(tags) : null,
        status: 'ready',
      },
    });

    return {
      id: idea.id,
      rawContent: idea.rawContent,
      processedContent: idea.processedContent || '',
      suggestedPostType: idea.suggestedPostType || 'reel',
      suggestedHook: idea.suggestedHook || '',
      suggestedPlatforms: aiSuggestions.platforms,
      suggestedPublishTime: idea.suggestedPublishTime || '',
    };
  }

  async getIdeas(userId: string, status?: string): Promise<IdeaOutput[]> {
    const user = await this.ensureUserProfile(userId);
    
    const ideas = await prisma.idea.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return ideas.map(idea => ({
      id: idea.id,
      rawContent: idea.rawContent,
      processedContent: idea.processedContent || '',
      suggestedPostType: idea.suggestedPostType || 'reel',
      suggestedHook: idea.suggestedHook || '',
      suggestedPlatforms: idea.suggestedPlatforms ? JSON.parse(idea.suggestedPlatforms) : [],
      suggestedPublishTime: idea.suggestedPublishTime || '',
    }));
  }

  async convertIdeaToPost(userId: string, ideaId: string, platforms?: string[]): Promise<any> {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new Error('Idea not found');
    }

    const targetPlatforms = platforms || 
      (idea.suggestedPlatforms ? JSON.parse(idea.suggestedPlatforms) : ['instagram']);

    // Create post pack from idea
    const voicePostOutput = await this.createVoicePost({
      userId,
      transcript: idea.processedContent || idea.rawContent,
      platforms: targetPlatforms,
    });

    // Update idea status
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        status: 'converted',
        convertedToPostId: 'generated', // In real implementation, this would be the actual post ID
      },
    });

    return voicePostOutput.postPack;
  }

  private async processIdeaWithAI(content: string, inputType: string): Promise<{
    processedContent: string;
    postType: string;
    hook: string;
    platforms: string[];
    publishTime: string;
  }> {
    const prompt = `אני מקבל רעיון לתוכן מבעלת עסק.
סוג הקלט: ${inputType}
התוכן: "${content}"

נתח את הרעיון והצע:
1. גרסה מעובדת ומשופרת של הרעיון
2. סוג התוכן המתאים (reel/story/post/carousel)
3. Hook מוצע
4. פלטפורמות מומלצות
5. זמן פרסום מומלץ

החזר JSON:
{
  "processedContent": "הרעיון המעובד",
  "postType": "reel",
  "hook": "משפט פתיחה",
  "platforms": ["instagram", "tiktok"],
  "publishTime": "morning/afternoon/evening"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  // ============================================
  // Component 4: Smart Content Recycling
  // ============================================

  async getRecyclingSuggestions(userId: string): Promise<RecyclingSuggestion[]> {
    // Get published posts
    const posts = await prisma.post.findMany({
      where: {
        status: 'published',
        publishedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    const suggestions: RecyclingSuggestion[] = [];

    for (const post of posts) {
      const suggestion = await this.analyzePostForRecycling(post);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  async recyclePost(postId: string, suggestionType: string, targetPlatform?: string): Promise<any> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const originalCaption = post.instagramCaption || post.facebookCaption || '';

    const prompt = `שכתב את הפוסט הבא בהתאם להנחיות:

פוסט מקורי:
"${originalCaption}"

סוג השינוי: ${suggestionType}
${targetPlatform ? `פלטפורמת יעד: ${targetPlatform}` : ''}

הנחיות:
- refresh: רענן את התוכן עם זווית חדשה
- adapt_platform: התאם לפלטפורמה החדשה
- expand: הרחב והוסף פרטים
- shorten: קצר ותמצת

החזר JSON:
{
  "recycled_caption": "התוכן המעודכן",
  "hook": "משפט פתיחה חדש",
  "changes_made": "מה שונה"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  private async analyzePostForRecycling(post: any): Promise<RecyclingSuggestion | null> {
    const daysSincePublished = post.publishedAt 
      ? Math.floor((Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSincePublished < 30) return null;

    // Determine suggestion type based on post characteristics
    let suggestionType: 'refresh' | 'adapt_platform' | 'expand' | 'shorten' = 'refresh';
    let reason = 'הפוסט פורסם לפני יותר מחודש ויכול לקבל חיים חדשים';

    if (!post.linkedinCaption && post.instagramCaption) {
      suggestionType = 'adapt_platform';
      reason = 'הפוסט טרם הותאם ללינקדאין';
    }

    return {
      postId: post.id,
      suggestionType,
      targetPlatform: suggestionType === 'adapt_platform' ? 'linkedin' : undefined,
      reason,
      suggestedChanges: 'רענון עם זווית עדכנית',
      originalCaption: post.instagramCaption || post.facebookCaption || '',
    };
  }

  // ============================================
  // Component 5: Personal Learning Engine
  // ============================================

  async getStyleProfile(userId: string): Promise<StyleProfile> {
    const user = await this.ensureUserProfile(userId);
    
    let profile = await prisma.styleProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.styleProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    return {
      tonePreference: profile.tonePreference,
      emojiUsage: profile.emojiUsage,
      signaturePhrases: JSON.parse(profile.signaturePhrases),
      avoidWords: JSON.parse(profile.avoidWords),
      preferredCTAs: JSON.parse(profile.preferredCTAs),
      platformPreferences: JSON.parse(profile.platformPreferences),
      voiceModelStatus: profile.voiceModelStatus,
    };
  }

  async updateStyleProfile(userId: string, updates: Partial<StyleProfile>): Promise<StyleProfile> {
    const user = await this.ensureUserProfile(userId);
    
    const updateData: any = {};
    if (updates.tonePreference) updateData.tonePreference = updates.tonePreference;
    if (updates.emojiUsage) updateData.emojiUsage = updates.emojiUsage;
    if (updates.signaturePhrases) updateData.signaturePhrases = JSON.stringify(updates.signaturePhrases);
    if (updates.avoidWords) updateData.avoidWords = JSON.stringify(updates.avoidWords);
    if (updates.preferredCTAs) updateData.preferredCTAs = JSON.stringify(updates.preferredCTAs);
    if (updates.platformPreferences) updateData.platformPreferences = JSON.stringify(updates.platformPreferences);

    await prisma.styleProfile.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData,
      },
    });

    return this.getStyleProfile(userId);
  }

  async submitFeedback(userId: string, feedback: {
    postId?: string;
    contentType: string;
    originalContent: string;
    editedContent?: string;
    feedbackType: 'edit' | 'approve' | 'reject';
  }): Promise<void> {
    const user = await this.ensureUserProfile(userId);

    // Analyze the changes to learn from them
    let changeCategories: string[] = [];
    if (feedback.editedContent && feedback.originalContent !== feedback.editedContent) {
      changeCategories = await this.analyzeContentChanges(
        feedback.originalContent,
        feedback.editedContent
      );
    }

    // Save feedback
    await prisma.feedback.create({
      data: {
        userId: user.id,
        postId: feedback.postId,
        contentType: feedback.contentType,
        originalContent: feedback.originalContent,
        editedContent: feedback.editedContent,
        feedbackType: feedback.feedbackType,
        changeCategories: JSON.stringify(changeCategories),
      },
    });

    // Update style profile based on feedback
    if (changeCategories.length > 0) {
      await this.learnFromFeedback(user.id, changeCategories);
    }
  }

  private async analyzeContentChanges(original: string, edited: string): Promise<string[]> {
    const prompt = `נתח את ההבדלים בין הטקסט המקורי לטקסט הערוך וזהה קטגוריות של שינויים.

מקורי: "${original}"
ערוך: "${edited}"

קטגוריות אפשריות:
- shorter (קוצר)
- longer (הארכה)
- more_warm (יותר חם)
- more_professional (יותר מקצועי)
- less_emoji (פחות אימוג'ים)
- more_emoji (יותר אימוג'ים)
- simpler_language (שפה פשוטה יותר)
- stronger_cta (קריאה לפעולה חזקה יותר)
- better_hook (פתיחה טובה יותר)

החזר JSON:
{
  "categories": ["category1", "category2"]
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result.categories || [];
  }

  private async learnFromFeedback(userId: string, categories: string[]): Promise<void> {
    const profile = await prisma.styleProfile.findUnique({
      where: { userId },
    });

    if (!profile) return;

    const updates: any = {
      totalEditsTracked: profile.totalEditsTracked + 1,
    };

    // Adjust preferences based on feedback patterns
    if (categories.includes('less_emoji') && profile.emojiUsage !== 'none') {
      const levels = ['none', 'low', 'medium', 'high'];
      const currentIndex = levels.indexOf(profile.emojiUsage);
      if (currentIndex > 0) {
        updates.emojiUsage = levels[currentIndex - 1];
      }
    }

    if (categories.includes('more_warm') && profile.tonePreference === 'formal') {
      updates.tonePreference = 'warm_professional';
    }

    await prisma.styleProfile.update({
      where: { userId },
      data: updates,
    });
  }

  // ============================================
  // Component 7: Burnout Protection
  // ============================================

  async getBurnoutStatus(userId: string): Promise<BurnoutStatus> {
    const user = await this.ensureUserProfile(userId);
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // Get activity logs
    const recentActivities = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: oneWeekAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    const previousWeekActivities = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: twoWeeksAgo,
          lt: oneWeekAgo,
        },
      },
    });

    const postsThisWeek = recentActivities.filter(a => a.activityType === 'post_created').length;
    const postsLastWeek = previousWeekActivities.filter(a => a.activityType === 'post_created').length;

    // Calculate consecutive active days
    const activeDates = new Set(
      recentActivities.map(a => new Date(a.createdAt).toDateString())
    );
    const consecutiveActiveDays = activeDates.size;

    // Determine burnout status
    let status: 'healthy' | 'warning' | 'burnout_risk' = 'healthy';
    let message: string;
    const suggestions: string[] = [];

    if (postsThisWeek > 10 || consecutiveActiveDays >= 7) {
      status = 'burnout_risk';
      message = 'נראה שעבדת המון השבוע! אולי כדאי לקחת יום מנוחה? 💆‍♀️';
      suggestions.push('קחי יום חופש מיצירת תוכן');
      suggestions.push('השתמשי בתוכן קיים במקום ליצור חדש');
      suggestions.push('תזמני פוסטים מראש ותנוחי');
    } else if (postsThisWeek < postsLastWeek / 2 && postsLastWeek > 0) {
      status = 'warning';
      message = 'שמתי לב שהפעילות ירדה. הכל בסדר? אני כאן אם צריך 🤗';
      suggestions.push('אולי נתחיל עם תוכן קל וקצר?');
      suggestions.push('יש לי כמה רעיונות פשוטים במיוחד');
    } else {
      message = 'את בקצב נהדר! המשיכי ככה 💪';
      suggestions.push('נראה שמצאת את האיזון המושלם');
    }

    return {
      status,
      message,
      suggestions,
      stats: {
        postsThisWeek,
        averagePostsPerWeek: Math.round((postsThisWeek + postsLastWeek) / 2),
        lastActiveDate: recentActivities[0]?.createdAt?.toISOString() || 'N/A',
        consecutiveActiveDays,
      },
    };
  }

  // ============================================
  // Component 8: Daily Idea Generator
  // ============================================

  async generateDailyIdea(): Promise<DailyIdeaOutput> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const month = today.getMonth();

    // Check for existing unused idea for today
    const existingIdea = await prisma.dailyIdea.findFirst({
      where: {
        targetDate: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lt: new Date(today.setHours(23, 59, 59, 999)),
        },
        used: false,
      },
    });

    if (existingIdea) {
      return {
        filmingIdea: existingIdea.filmingIdea,
        contentType: existingIdea.contentType,
        suggestedHook: existingIdea.suggestedHook,
        occasion: existingIdea.occasion || undefined,
        difficulty: existingIdea.difficulty,
        estimatedTime: existingIdea.estimatedTime,
        tips: [],
      };
    }

    // Generate new idea with AI
    const prompt = `צור רעיון לסרטון/תוכן עבור יועצת עסקית.

היום: יום ${['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][dayOfWeek]}
חודש: ${month + 1}

דרישות:
- רעיון פשוט וישים
- מתאים לבעלת עסק עסוקה
- ניתן לצלם בקלות
- רלוונטי לקהל של בעלי עסקים קטנים

החזר JSON:
{
  "filmingIdea": "תיאור הרעיון לצילום",
  "contentType": "reel/story/post",
  "suggestedHook": "משפט פתיחה מומלץ",
  "occasion": "evergreen/trend/holiday או null",
  "difficulty": "easy/medium/hard",
  "estimatedTime": 15,
  "tips": ["טיפ 1", "טיפ 2"]
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Save the idea
    await prisma.dailyIdea.create({
      data: {
        filmingIdea: result.filmingIdea || 'רעיון כללי',
        contentType: result.contentType || 'reel',
        suggestedHook: result.suggestedHook || '',
        occasion: result.occasion,
        difficulty: result.difficulty || 'easy',
        estimatedTime: result.estimatedTime || 15,
        targetDate: new Date(),
      },
    });

    return {
      filmingIdea: result.filmingIdea || '',
      contentType: result.contentType || 'reel',
      suggestedHook: result.suggestedHook || '',
      occasion: result.occasion,
      difficulty: result.difficulty || 'easy',
      estimatedTime: result.estimatedTime || 15,
      tips: result.tips || [],
    };
  }

  // ============================================
  // Component 9: Comment & Message Reply AI
  // ============================================

  async suggestReply(input: {
    comment: string;
    platform: string;
    context?: string;
  }): Promise<ReplySuggestion> {
    const { comment, platform, context } = input;

    const prompt = `צור תגובה לתגובה/הודעה הבאה:

תגובה: "${comment}"
פלטפורמה: ${platform}
${context ? `הקשר: ${context}` : ''}

דרישות:
- שמור על טון עסקי וחם
- התאם לפלטפורמה (${platform})
- קצר וממוקד
- אותנטי ולא רובוטי

החזר JSON:
{
  "reply": "התגובה המומלצת",
  "tone": "warm/professional/friendly",
  "alternatives": ["אלטרנטיבה 1", "אלטרנטיבה 2"]
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  // ============================================
  // Component 10: Personal Voice Cloning
  // ============================================

  async trainVoiceModel(userId: string): Promise<{ status: string; message: string }> {
    const user = await this.ensureUserProfile(userId);

    if (!user.voiceDataConsent) {
      return {
        status: 'error',
        message: 'נדרשת הסכמה לשמירת נתוני קול לפני אימון המודל',
      };
    }

    // Get all voice samples and feedback for training
    const voiceSamples = await prisma.voiceSample.findMany({
      where: { userId: user.id },
    });

    const feedbacks = await prisma.feedback.findMany({
      where: { userId: user.id },
    });

    if (voiceSamples.length < 5 && feedbacks.length < 10) {
      return {
        status: 'insufficient_data',
        message: 'צריך עוד נתונים לאימון. המשיכי ליצור תוכן ולערוך, ואני אלמד את הסגנון שלך!',
      };
    }

    // Update status to training
    await prisma.styleProfile.update({
      where: { userId: user.id },
      data: { voiceModelStatus: 'training' },
    });

    // Analyze all content to extract style characteristics
    const styleAnalysis = await this.analyzeUserStyle(voiceSamples, feedbacks);

    // Update style profile with learned characteristics
    await prisma.styleProfile.update({
      where: { userId: user.id },
      data: {
        voiceModelStatus: 'ready',
        voiceModelData: JSON.stringify(styleAnalysis),
        signaturePhrases: JSON.stringify(styleAnalysis.signaturePhrases || []),
        lastTrainedAt: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'המודל אומן בהצלחה! עכשיו התוכן שייווצר יהיה יותר "את" 🎉',
    };
  }

  private async analyzeUserStyle(voiceSamples: any[], feedbacks: any[]): Promise<any> {
    const allContent = [
      ...voiceSamples.map(s => s.transcript),
      ...feedbacks.filter(f => f.editedContent).map(f => f.editedContent),
    ].join('\n\n');

    const prompt = `נתח את כל התכנים הבאים וחלץ מאפייני סגנון כתיבה:

${allContent}

זהה:
1. ביטויים חוזרים
2. אורך משפטים ממוצע
3. שימוש באימוג'ים
4. טון כתיבה
5. קריאות לפעולה מועדפות

החזר JSON:
{
  "signaturePhrases": ["ביטוי 1", "ביטוי 2"],
  "averageSentenceLength": 12,
  "emojiStyle": "low/medium/high",
  "toneCharacteristics": ["חם", "מקצועי"],
  "preferredCTAs": ["קריאה 1", "קריאה 2"],
  "writingPatterns": ["דפוס 1", "דפוס 2"]
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async ensureUserProfile(userId: string): Promise<any> {
    let user = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await prisma.userProfile.create({
        data: {
          id: userId,
        },
      });
    }

    return user;
  }

  private async logActivity(
    userId: string,
    activityType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const user = await this.ensureUserProfile(userId);
    
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        activityType,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  // ============================================
  // Mom Mode UI Helper
  // ============================================

  async getMomModeData(userId: string): Promise<{
    dailyIdea: DailyIdeaOutput;
    pendingIdeas: number;
    burnoutStatus: BurnoutStatus;
    quickActions: string[];
  }> {
    const [dailyIdea, ideas, burnoutStatus] = await Promise.all([
      this.generateDailyIdea(),
      this.getIdeas(userId, 'ready'),
      this.getBurnoutStatus(userId),
    ]);

    const quickActions = [
      'ספרי על הסרטון',
      'שמרי רעיון',
      'צרי פוסט מהיר',
    ];

    if (ideas.length > 0) {
      quickActions.push(`יש ${ideas.length} רעיונות מחכים`);
    }

    return {
      dailyIdea,
      pendingIdeas: ideas.length,
      burnoutStatus,
      quickActions,
    };
  }

  // ============================================
  // Privacy & Data Management
  // ============================================

  async deleteUserData(userId: string): Promise<{ deleted: boolean; message: string }> {
    try {
      const user = await prisma.userProfile.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { deleted: false, message: 'User not found' };
      }

      // Delete all related data
      await prisma.$transaction([
        prisma.voiceSample.deleteMany({ where: { userId } }),
        prisma.activityLog.deleteMany({ where: { userId } }),
        prisma.feedback.deleteMany({ where: { userId } }),
        prisma.idea.deleteMany({ where: { userId } }),
        prisma.styleProfile.deleteMany({ where: { userId } }),
        prisma.energyProfile.deleteMany({ where: { userId } }),
        prisma.userProfile.delete({ where: { id: userId } }),
      ]);

      return { deleted: true, message: 'כל הנתונים נמחקו בהצלחה' };
    } catch (error) {
      return { deleted: false, message: 'שגיאה במחיקת הנתונים' };
    }
  }

  async updatePrivacyConsent(userId: string, consent: {
    voiceDataConsent?: boolean;
    dataRetentionDays?: number;
  }): Promise<void> {
    await prisma.userProfile.update({
      where: { id: userId },
      data: consent,
    });
  }
}

export const assistantService = new AssistantService();
