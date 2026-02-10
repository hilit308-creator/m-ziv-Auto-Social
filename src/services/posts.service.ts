import prisma from '../db/database';
import { mzivService } from './mziv.service';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export type RewriteCommand =
  | 'shorter'
  | 'longer'
  | 'more_professional'
  | 'more_warm'
  | 'add_cta'
  | 'remove_emojis'
  | 'add_emojis'
  | 'instagram_style'
  | 'linkedin_style'
  | 'tiktok_style'
  | 'youtube_style';

export interface CreatePostInput {
  topic: string;
  voiceNotes?: string;
  platforms?: string[];
}

export interface PostByPlatform {
  instagram?: {
    caption: string;
    hashtags: string[];
    hashtags_string: string;
  };
  facebook?: {
    caption: string;
  };
  tiktok?: {
    caption: string;
    hashtags: string[];
  };
  youtube?: {
    title: string;
    description: string;
    tags: string[];
  };
  linkedin?: {
    caption: string;
  };
}

export interface PostResponse {
  id: string;
  topic: string;
  status: PostStatus;
  created_at: Date;
  updated_at: Date;
  scheduled_at?: Date | null;
  published_at?: Date | null;
  by_platform: PostByPlatform;
  versions_count: number;
}

export class PostsService {
  async create(input: CreatePostInput): Promise<PostResponse> {
    const profile = await this.getOrCreateProfile();
    
    const platforms = input.platforms || ['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin'];
    
    const generatedContent = await this.generateMultiPlatformContent(input.topic, input.voiceNotes, profile, platforms);
    
    const post = await prisma.post.create({
      data: {
        topic: input.topic,
        voiceNotes: input.voiceNotes,
        status: 'draft',
        instagramCaption: generatedContent.instagram?.caption,
        instagramHashtags: generatedContent.instagram?.hashtags?.join(','),
        facebookCaption: generatedContent.facebook?.caption,
        tiktokCaption: generatedContent.tiktok?.caption,
        tiktokHashtags: generatedContent.tiktok?.hashtags?.join(','),
        youtubeTitle: generatedContent.youtube?.title,
        youtubeDescription: generatedContent.youtube?.description,
        youtubeTags: generatedContent.youtube?.tags?.join(','),
        linkedinCaption: generatedContent.linkedin?.caption,
      },
    });

    return this.formatPostResponse(post);
  }

  async getAll(status?: PostStatus): Promise<PostResponse[]> {
    const posts = await prisma.post.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { versions: true },
    });

    return posts.map(post => this.formatPostResponse(post));
  }

  async getById(id: string): Promise<PostResponse | null> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { versions: true },
    });

    if (!post) return null;
    return this.formatPostResponse(post);
  }

  async update(id: string, data: Partial<{
    topic: string;
    status: PostStatus;
    scheduledAt: Date;
    instagramCaption: string;
    instagramHashtags: string[];
    facebookCaption: string;
    tiktokCaption: string;
    youtubeTitle: string;
    youtubeDescription: string;
    linkedinCaption: string;
  }>): Promise<PostResponse | null> {
    const post = await prisma.post.update({
      where: { id },
      data: {
        topic: data.topic,
        status: data.status,
        scheduledAt: data.scheduledAt,
        instagramCaption: data.instagramCaption,
        instagramHashtags: data.instagramHashtags?.join(','),
        facebookCaption: data.facebookCaption,
        tiktokCaption: data.tiktokCaption,
        youtubeTitle: data.youtubeTitle,
        youtubeDescription: data.youtubeDescription,
        linkedinCaption: data.linkedinCaption,
      },
      include: { versions: true },
    });

    return this.formatPostResponse(post);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.post.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async rewrite(id: string, command: RewriteCommand, platform?: string): Promise<PostResponse | null> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { versions: true },
    });

    if (!post) return null;

    const versionNumber = post.versions.length + 1;
    await prisma.postVersion.create({
      data: {
        postId: id,
        versionNumber,
        command,
        instagramCaption: post.instagramCaption,
        instagramHashtags: post.instagramHashtags,
        facebookCaption: post.facebookCaption,
        tiktokCaption: post.tiktokCaption,
        tiktokHashtags: post.tiktokHashtags,
        youtubeTitle: post.youtubeTitle,
        youtubeDescription: post.youtubeDescription,
        youtubeTags: post.youtubeTags,
        linkedinCaption: post.linkedinCaption,
      },
    });

    const rewrittenContent = await this.applyRewriteCommand(post, command, platform);

    const updatedPost = await prisma.post.update({
      where: { id },
      data: rewrittenContent,
      include: { versions: true },
    });

    return this.formatPostResponse(updatedPost);
  }

  async getNext(): Promise<PostResponse | null> {
    const post = await prisma.post.findFirst({
      where: { status: 'draft' },
      orderBy: { createdAt: 'asc' },
      include: { versions: true },
    });

    if (!post) return null;
    return this.formatPostResponse(post);
  }

  private async getOrCreateProfile() {
    let profile = await prisma.brandProfile.findFirst();
    if (!profile) {
      profile = await prisma.brandProfile.create({ data: {} });
    }
    return profile;
  }

  private async generateMultiPlatformContent(
    topic: string,
    voiceNotes: string | undefined,
    profile: any,
    platforms: string[]
  ): Promise<PostByPlatform> {
    const result: PostByPlatform = {};

    const brandInput = {
      name: profile.name,
      business_type: profile.businessType,
      tone: profile.tone,
      language: profile.language,
      default_cta: profile.defaultCta,
    };

    const contentInput = {
      video_description: topic,
      voice_notes: voiceNotes,
      target_audience: profile.targetAudience,
    };

    if (platforms.includes('instagram')) {
      try {
        const caption = await mzivService.generateCaption({
          brand: brandInput,
          content: contentInput,
          platform: 'instagram',
          constraints: {
            max_words: profile.maxWordsInstagram,
            include_hook: true,
            include_cta: true,
            emoji_level: profile.emojiLevel as 'low' | 'medium' | 'none',
          },
        });
        
        const hashtags = await mzivService.generateHashtags({
          caption: caption.caption,
          platform: 'instagram',
          language: profile.language,
          business_context: {
            business_type: profile.businessType,
            audience: profile.targetAudience,
          },
          constraints: {
            count: 10,
            mix: { broad: 4, niche: 4, branded: 2 },
            include_branded: profile.brandedHashtags.split(','),
          },
        });

        result.instagram = {
          caption: caption.caption,
          hashtags: hashtags.hashtags,
          hashtags_string: hashtags.hashtags.join(' '),
        };
      } catch (e) {
        console.error('Error generating Instagram content:', e);
      }
    }

    if (platforms.includes('facebook')) {
      try {
        const caption = await mzivService.generateCaption({
          brand: brandInput,
          content: contentInput,
          platform: 'facebook',
          constraints: {
            max_words: profile.maxWordsFacebook,
            include_hook: true,
            include_cta: true,
            emoji_level: profile.emojiLevel as 'low' | 'medium' | 'none',
          },
        });
        result.facebook = { caption: caption.caption };
      } catch (e) {
        console.error('Error generating Facebook content:', e);
      }
    }

    if (platforms.includes('tiktok')) {
      try {
        const caption = await mzivService.generateCaption({
          brand: brandInput,
          content: contentInput,
          platform: 'tiktok',
          constraints: {
            max_words: profile.maxWordsTiktok,
            include_hook: true,
            include_cta: true,
            emoji_level: 'medium',
          },
        });

        const hashtags = await mzivService.generateHashtags({
          caption: caption.caption,
          platform: 'tiktok',
          language: profile.language,
          business_context: {
            business_type: profile.businessType,
            audience: profile.targetAudience,
          },
          constraints: {
            count: 5,
            mix: { broad: 2, niche: 2, branded: 1 },
            include_branded: profile.brandedHashtags.split(','),
          },
        });

        result.tiktok = {
          caption: caption.caption,
          hashtags: hashtags.hashtags,
        };
      } catch (e) {
        console.error('Error generating TikTok content:', e);
      }
    }

    if (platforms.includes('youtube')) {
      try {
        const caption = await mzivService.generateCaption({
          brand: brandInput,
          content: contentInput,
          platform: 'instagram',
          constraints: {
            max_words: profile.maxWordsYoutube,
            include_hook: true,
            include_cta: true,
            emoji_level: 'low',
          },
        });

        const title = await mzivService.generateTitle({
          video_description: topic,
          caption: caption.caption,
          platform: 'youtube',
          constraints: {
            max_chars: 60,
            style: 'engaging',
          },
        });

        result.youtube = {
          title: title.title,
          description: caption.caption,
          tags: profile.brandedHashtags.split(',').map((t: string) => t.replace('#', '').trim()),
        };
      } catch (e) {
        console.error('Error generating YouTube content:', e);
      }
    }

    if (platforms.includes('linkedin')) {
      try {
        const caption = await mzivService.generateCaption({
          brand: brandInput,
          content: contentInput,
          platform: 'linkedin',
          constraints: {
            max_words: profile.maxWordsLinkedin,
            include_hook: true,
            include_cta: true,
            emoji_level: 'none',
          },
        });
        result.linkedin = { caption: caption.caption };
      } catch (e) {
        console.error('Error generating LinkedIn content:', e);
      }
    }

    return result;
  }

  private async applyRewriteCommand(post: any, command: RewriteCommand, platform?: string): Promise<any> {
    const commandPrompts: Record<RewriteCommand, string> = {
      shorter: 'קצר את הטקסט ל-50% מהאורך המקורי, שמור על המסר העיקרי',
      longer: 'הרחב את הטקסט עם פרטים נוספים ודוגמאות',
      more_professional: 'הפוך את הטקסט למקצועי יותר, פורמלי יותר',
      more_warm: 'הפוך את הטקסט לחם יותר, אישי יותר, ידידותי',
      add_cta: 'הוסף קריאה לפעולה ברורה בסוף הטקסט',
      remove_emojis: 'הסר את כל האמוג\'ים מהטקסט',
      add_emojis: 'הוסף אמוג\'ים רלוונטיים לטקסט (מעט, לא יותר מ-3)',
      instagram_style: 'התאם לסגנון אינסטגרם - קצר, מושך, עם אמוג\'ים',
      linkedin_style: 'התאם לסגנון לינקדאין - מקצועי, ללא אמוג\'ים, עסקי',
      tiktok_style: 'התאם לסגנון טיקטוק - קצר מאוד, כיפי, דינמי',
      youtube_style: 'התאם לסגנון יוטיוב - מפורט, מסביר, מושך',
    };

    const rewritePrompt = commandPrompts[command];
    const updates: any = {};

    const platformsToRewrite = platform 
      ? [platform] 
      : ['instagram', 'facebook', 'tiktok', 'linkedin'];

    for (const p of platformsToRewrite) {
      let currentText = '';
      let fieldName = '';

      switch (p) {
        case 'instagram':
          currentText = post.instagramCaption || '';
          fieldName = 'instagramCaption';
          break;
        case 'facebook':
          currentText = post.facebookCaption || '';
          fieldName = 'facebookCaption';
          break;
        case 'tiktok':
          currentText = post.tiktokCaption || '';
          fieldName = 'tiktokCaption';
          break;
        case 'linkedin':
          currentText = post.linkedinCaption || '';
          fieldName = 'linkedinCaption';
          break;
      }

      if (currentText) {
        try {
          const rewritten = await mzivService.rewriteText({
            text: currentText,
            command: rewritePrompt,
            platform: p,
            language: 'עברית',
          });
          updates[fieldName] = rewritten.rewritten_text;
        } catch (e) {
          console.error(`Error rewriting ${p}:`, e);
        }
      }
    }

    return updates;
  }

  private formatPostResponse(post: any): PostResponse {
    return {
      id: post.id,
      topic: post.topic,
      status: post.status as PostStatus,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
      scheduled_at: post.scheduledAt,
      published_at: post.publishedAt,
      by_platform: {
        instagram: post.instagramCaption ? {
          caption: post.instagramCaption,
          hashtags: post.instagramHashtags?.split(',') || [],
          hashtags_string: post.instagramHashtags?.split(',').join(' ') || '',
        } : undefined,
        facebook: post.facebookCaption ? {
          caption: post.facebookCaption,
        } : undefined,
        tiktok: post.tiktokCaption ? {
          caption: post.tiktokCaption,
          hashtags: post.tiktokHashtags?.split(',') || [],
        } : undefined,
        youtube: post.youtubeTitle ? {
          title: post.youtubeTitle,
          description: post.youtubeDescription || '',
          tags: post.youtubeTags?.split(',') || [],
        } : undefined,
        linkedin: post.linkedinCaption ? {
          caption: post.linkedinCaption,
        } : undefined,
      },
      versions_count: post.versions?.length || 0,
    };
  }
}

export const postsService = new PostsService();
