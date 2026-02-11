import axios from 'axios';
import prisma from '../db/database';

export interface VideoGenerationInput {
  prompt: string;
  duration?: number; // seconds (5, 10, 15)
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  style?: string;
}

export interface VideoResult {
  id: string;
  url: string;
  thumbnail_url: string;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class VideoService {
  private runwayApiKey: string;
  private pikaApiKey: string;
  private replicateApiKey: string;

  constructor() {
    this.runwayApiKey = process.env.RUNWAY_API_KEY || '';
    this.pikaApiKey = process.env.PIKA_API_KEY || '';
    this.replicateApiKey = process.env.REPLICATE_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!(this.runwayApiKey || this.pikaApiKey || this.replicateApiKey);
  }

  getConfiguredProvider(): string | null {
    if (this.runwayApiKey) return 'runway';
    if (this.pikaApiKey) return 'pika';
    if (this.replicateApiKey) return 'replicate';
    return null;
  }

  async generateVideo(input: VideoGenerationInput): Promise<VideoResult> {
    const provider = this.getConfiguredProvider();

    if (!provider) {
      throw new Error('No video generation provider configured. Add RUNWAY_API_KEY, PIKA_API_KEY, or REPLICATE_API_KEY');
    }

    switch (provider) {
      case 'runway':
        return this.generateWithRunway(input);
      case 'pika':
        return this.generateWithPika(input);
      case 'replicate':
        return this.generateWithReplicate(input);
      default:
        throw new Error('Unknown provider');
    }
  }

  private async generateWithRunway(input: VideoGenerationInput): Promise<VideoResult> {
    try {
      // Runway Gen-3 Alpha API
      const response = await axios.post(
        'https://api.runwayml.com/v1/generate',
        {
          prompt: input.prompt,
          duration: input.duration || 5,
          aspect_ratio: input.aspect_ratio || '16:9',
          style: input.style || 'cinematic',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.runwayApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        url: response.data.output_url || '',
        thumbnail_url: response.data.thumbnail_url || '',
        duration: input.duration || 5,
        status: response.data.status || 'processing',
      };
    } catch (error: any) {
      console.error('Runway API error:', error.response?.data || error.message);
      throw new Error('Failed to generate video with Runway');
    }
  }

  private async generateWithPika(input: VideoGenerationInput): Promise<VideoResult> {
    try {
      // Pika Labs API
      const response = await axios.post(
        'https://api.pika.art/v1/generate',
        {
          prompt: input.prompt,
          duration: input.duration || 5,
          aspect_ratio: input.aspect_ratio || '16:9',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.pikaApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        url: response.data.video_url || '',
        thumbnail_url: response.data.thumbnail || '',
        duration: input.duration || 5,
        status: response.data.status || 'processing',
      };
    } catch (error: any) {
      console.error('Pika API error:', error.response?.data || error.message);
      throw new Error('Failed to generate video with Pika');
    }
  }

  private async generateWithReplicate(input: VideoGenerationInput): Promise<VideoResult> {
    try {
      // Replicate API with Stable Video Diffusion
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'stable-video-diffusion',
          input: {
            prompt: input.prompt,
            video_length: input.duration || 5,
            sizing_strategy: input.aspect_ratio === '9:16' ? 'maintain_aspect_ratio' : 'crop_to_fit',
          },
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        url: response.data.output?.[0] || '',
        thumbnail_url: '',
        duration: input.duration || 5,
        status: response.data.status === 'succeeded' ? 'completed' : 'processing',
      };
    } catch (error: any) {
      console.error('Replicate API error:', error.response?.data || error.message);
      throw new Error('Failed to generate video with Replicate');
    }
  }

  async checkVideoStatus(videoId: string, provider: string): Promise<VideoResult> {
    switch (provider) {
      case 'runway':
        return this.checkRunwayStatus(videoId);
      case 'replicate':
        return this.checkReplicateStatus(videoId);
      default:
        throw new Error('Status check not supported for this provider');
    }
  }

  private async checkRunwayStatus(videoId: string): Promise<VideoResult> {
    const response = await axios.get(
      `https://api.runwayml.com/v1/generate/${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.runwayApiKey}`,
        },
      }
    );

    return {
      id: videoId,
      url: response.data.output_url || '',
      thumbnail_url: response.data.thumbnail_url || '',
      duration: response.data.duration || 5,
      status: response.data.status,
    };
  }

  private async checkReplicateStatus(videoId: string): Promise<VideoResult> {
    const response = await axios.get(
      `https://api.replicate.com/v1/predictions/${videoId}`,
      {
        headers: {
          'Authorization': `Token ${this.replicateApiKey}`,
        },
      }
    );

    return {
      id: videoId,
      url: response.data.output?.[0] || '',
      thumbnail_url: '',
      duration: 5,
      status: response.data.status === 'succeeded' ? 'completed' : response.data.status,
    };
  }

  async generateReelFromPost(postId: string): Promise<VideoResult> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    const prompt = `Create a short engaging video for social media about: ${post.topic}. 
    Style: Modern, eye-catching, suitable for Instagram Reels and TikTok.
    Include dynamic text overlays and smooth transitions.`;

    return this.generateVideo({
      prompt,
      duration: 15,
      aspect_ratio: '9:16',
      style: 'social_media',
    });
  }

  async generateStoryVideo(topic: string, style: string = 'modern'): Promise<VideoResult> {
    const prompt = `Create a 5-second story video about: ${topic}. 
    Style: ${style}, vertical format, attention-grabbing.`;

    return this.generateVideo({
      prompt,
      duration: 5,
      aspect_ratio: '9:16',
      style,
    });
  }

  async addCaptions(videoUrl: string, text: string): Promise<string> {
    // Integration with caption service (like AssemblyAI or Whisper)
    // For now, return the original URL
    console.log('Adding captions to video:', videoUrl, text);
    return videoUrl;
  }
}

export const videoService = new VideoService();
