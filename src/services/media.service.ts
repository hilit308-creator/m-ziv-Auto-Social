import { v2 as cloudinary } from 'cloudinary';
import prisma from '../db/database';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface MediaUploadResult {
  id: string;
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
}

export interface MediaItem {
  id: string;
  post_id?: string;
  url: string;
  public_id: string;
  type: 'image' | 'video';
  format: string;
  size_bytes: number;
  created_at: Date;
}

export class MediaService {
  constructor() {
    // Cloudinary config is set at module load
  }

  isReady(): boolean {
    // Check dynamically each time
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  async uploadFromUrl(url: string, options?: {
    folder?: string;
    resource_type?: 'image' | 'video' | 'auto';
    postId?: string;
  }): Promise<MediaUploadResult> {
    if (!this.isReady()) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }

    const result = await cloudinary.uploader.upload(url, {
      folder: options?.folder || 'mziv-social',
      resource_type: options?.resource_type || 'auto',
    });

    return {
      id: result.asset_id,
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type as 'image' | 'video',
      width: result.width,
      height: result.height,
      duration: result.duration,
      bytes: result.bytes,
    };
  }

  async uploadFromBase64(base64Data: string, options?: {
    folder?: string;
    resource_type?: 'image' | 'video';
    postId?: string;
  }): Promise<MediaUploadResult> {
    if (!this.isReady()) {
      throw new Error('Cloudinary is not configured');
    }

    const dataUri = base64Data.startsWith('data:') 
      ? base64Data 
      : `data:image/jpeg;base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: options?.folder || 'mziv-social',
      resource_type: options?.resource_type || 'auto',
    });

    return {
      id: result.asset_id,
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type as 'image' | 'video',
      width: result.width,
      height: result.height,
      duration: result.duration,
      bytes: result.bytes,
    };
  }

  async delete(publicId: string): Promise<boolean> {
    if (!this.isReady()) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch {
      return false;
    }
  }

  async attachToPost(postId: string, mediaUrl: string, mediaType: 'image' | 'video'): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: {
        mediaUrl,
        mediaType,
      },
    });
  }

  async getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    format?: string;
    quality?: 'auto' | number;
  }): Promise<string> {
    return cloudinary.url(publicId, {
      width: options?.width,
      height: options?.height,
      crop: 'fill',
      format: options?.format || 'auto',
      quality: options?.quality || 'auto',
      secure: true,
    });
  }

  async getVideoThumbnail(publicId: string): Promise<string> {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'jpg',
      start_offset: '0',
      secure: true,
    });
  }
}

export const mediaService = new MediaService();
