import prisma from '../db/database';

export interface PostVersionData {
  id: string;
  post_id: string;
  version_number: number;
  command?: string;
  by_platform: {
    instagram?: { caption: string; hashtags: string[] };
    facebook?: { caption: string };
    tiktok?: { caption: string; hashtags: string[] };
    youtube?: { title: string; description: string; tags: string[] };
    linkedin?: { caption: string };
  };
  created_at: Date;
}

export class VersionsService {
  async getVersions(postId: string): Promise<PostVersionData[]> {
    const versions = await prisma.postVersion.findMany({
      where: { postId },
      orderBy: { versionNumber: 'desc' },
    });

    return versions.map(v => this.formatVersion(v));
  }

  async restoreVersion(postId: string, versionNumber: number): Promise<boolean> {
    const version = await prisma.postVersion.findFirst({
      where: { postId, versionNumber },
    });

    if (!version) return false;

    await prisma.post.update({
      where: { id: postId },
      data: {
        instagramCaption: version.instagramCaption,
        instagramHashtags: version.instagramHashtags,
        facebookCaption: version.facebookCaption,
        tiktokCaption: version.tiktokCaption,
        tiktokHashtags: version.tiktokHashtags,
        youtubeTitle: version.youtubeTitle,
        youtubeDescription: version.youtubeDescription,
        youtubeTags: version.youtubeTags,
        linkedinCaption: version.linkedinCaption,
      },
    });

    return true;
  }

  private formatVersion(v: any): PostVersionData {
    return {
      id: v.id,
      post_id: v.postId,
      version_number: v.versionNumber,
      command: v.command,
      by_platform: {
        instagram: v.instagramCaption ? {
          caption: v.instagramCaption,
          hashtags: v.instagramHashtags?.split(',') || [],
        } : undefined,
        facebook: v.facebookCaption ? {
          caption: v.facebookCaption,
        } : undefined,
        tiktok: v.tiktokCaption ? {
          caption: v.tiktokCaption,
          hashtags: v.tiktokHashtags?.split(',') || [],
        } : undefined,
        youtube: v.youtubeTitle ? {
          title: v.youtubeTitle,
          description: v.youtubeDescription || '',
          tags: v.youtubeTags?.split(',') || [],
        } : undefined,
        linkedin: v.linkedinCaption ? {
          caption: v.linkedinCaption,
        } : undefined,
      },
      created_at: v.createdAt,
    };
  }
}

export const versionsService = new VersionsService();
