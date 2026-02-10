import prisma from '../db/database';

export interface BrandProfileData {
  name?: string;
  businessType?: string;
  tone?: string;
  language?: string;
  targetAudience?: string;
  defaultCta?: string;
  emojiLevel?: 'none' | 'low' | 'medium';
  maxWordsInstagram?: number;
  maxWordsFacebook?: number;
  maxWordsTiktok?: number;
  maxWordsLinkedin?: number;
  maxWordsYoutube?: number;
  brandedHashtags?: string[];
}

export interface ProfileResponse {
  id: string;
  name: string;
  business_type: string;
  tone: string;
  language: string;
  target_audience: string;
  default_cta: string;
  emoji_level: string;
  max_words: {
    instagram: number;
    facebook: number;
    tiktok: number;
    linkedin: number;
    youtube: number;
  };
  branded_hashtags: string[];
  created_at: Date;
  updated_at: Date;
}

export class ProfileService {
  async get(): Promise<ProfileResponse> {
    let profile = await prisma.brandProfile.findFirst();
    
    if (!profile) {
      profile = await prisma.brandProfile.create({ data: {} });
    }

    return this.formatResponse(profile);
  }

  async update(data: BrandProfileData): Promise<ProfileResponse> {
    let profile = await prisma.brandProfile.findFirst();
    
    if (!profile) {
      profile = await prisma.brandProfile.create({ data: {} });
    }

    const updated = await prisma.brandProfile.update({
      where: { id: profile.id },
      data: {
        name: data.name,
        businessType: data.businessType,
        tone: data.tone,
        language: data.language,
        targetAudience: data.targetAudience,
        defaultCta: data.defaultCta,
        emojiLevel: data.emojiLevel,
        maxWordsInstagram: data.maxWordsInstagram,
        maxWordsFacebook: data.maxWordsFacebook,
        maxWordsTiktok: data.maxWordsTiktok,
        maxWordsLinkedin: data.maxWordsLinkedin,
        maxWordsYoutube: data.maxWordsYoutube,
        brandedHashtags: data.brandedHashtags?.join(','),
      },
    });

    return this.formatResponse(updated);
  }

  private formatResponse(profile: any): ProfileResponse {
    return {
      id: profile.id,
      name: profile.name,
      business_type: profile.businessType,
      tone: profile.tone,
      language: profile.language,
      target_audience: profile.targetAudience,
      default_cta: profile.defaultCta,
      emoji_level: profile.emojiLevel,
      max_words: {
        instagram: profile.maxWordsInstagram,
        facebook: profile.maxWordsFacebook,
        tiktok: profile.maxWordsTiktok,
        linkedin: profile.maxWordsLinkedin,
        youtube: profile.maxWordsYoutube,
      },
      branded_hashtags: profile.brandedHashtags?.split(',') || [],
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
    };
  }
}

export const profileService = new ProfileService();
