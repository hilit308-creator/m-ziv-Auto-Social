import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

type AIProvider = 'openai' | 'claude' | 'gemini';

export interface GenerateInput {
  prompt: string;
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class MultiAIService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private geminiApiKey: string;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
  }

  getAvailableProviders(): { provider: string; configured: boolean }[] {
    return [
      { provider: 'openai', configured: !!process.env.OPENAI_API_KEY },
      { provider: 'claude', configured: !!process.env.ANTHROPIC_API_KEY },
      { provider: 'gemini', configured: !!this.geminiApiKey },
    ];
  }

  async generate(input: GenerateInput): Promise<string> {
    const provider = input.provider || this.getDefaultProvider();

    switch (provider) {
      case 'openai':
        return this.generateWithOpenAI(input);
      case 'claude':
        return this.generateWithClaude(input);
      case 'gemini':
        return this.generateWithGemini(input);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async generateJSON(input: GenerateInput): Promise<any> {
    const provider = input.provider || this.getDefaultProvider();

    switch (provider) {
      case 'openai':
        return this.generateJSONWithOpenAI(input);
      case 'claude':
        return this.generateJSONWithClaude(input);
      case 'gemini':
        return this.generateJSONWithGemini(input);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private getDefaultProvider(): AIProvider {
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.ANTHROPIC_API_KEY) return 'claude';
    if (this.geminiApiKey) return 'gemini';
    throw new Error('No AI provider configured');
  }

  private async generateWithOpenAI(input: GenerateInput): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: input.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: input.prompt }],
      temperature: input.temperature || 0.7,
      max_tokens: input.maxTokens || 1000,
    });

    return completion.choices[0].message.content || '';
  }

  private async generateJSONWithOpenAI(input: GenerateInput): Promise<any> {
    const completion = await this.openai.chat.completions.create({
      model: input.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: input.prompt }],
      temperature: input.temperature || 0.7,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  private async generateWithClaude(input: GenerateInput): Promise<string> {
    const message = await this.anthropic.messages.create({
      model: input.model || 'claude-3-haiku-20240307',
      max_tokens: input.maxTokens || 1000,
      messages: [{ role: 'user', content: input.prompt }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    return textBlock ? (textBlock as any).text : '';
  }

  private async generateJSONWithClaude(input: GenerateInput): Promise<any> {
    const message = await this.anthropic.messages.create({
      model: input.model || 'claude-3-haiku-20240307',
      max_tokens: input.maxTokens || 1000,
      messages: [
        {
          role: 'user',
          content: `${input.prompt}\n\nRespond with valid JSON only, no additional text.`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    const text = textBlock ? (textBlock as any).text : '{}';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  }

  private async generateWithGemini(input: GenerateInput): Promise<string> {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${input.model || 'gemini-pro'}:generateContent?key=${this.geminiApiKey}`,
      {
        contents: [{ parts: [{ text: input.prompt }] }],
        generationConfig: {
          temperature: input.temperature || 0.7,
          maxOutputTokens: input.maxTokens || 1000,
        },
      }
    );

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async generateJSONWithGemini(input: GenerateInput): Promise<any> {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${input.model || 'gemini-pro'}:generateContent?key=${this.geminiApiKey}`,
      {
        contents: [
          {
            parts: [{ text: `${input.prompt}\n\nRespond with valid JSON only.` }],
          },
        ],
        generationConfig: {
          temperature: input.temperature || 0.7,
        },
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  }

  async compareProviders(prompt: string): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    const providers = this.getAvailableProviders().filter((p) => p.configured);

    await Promise.all(
      providers.map(async ({ provider }) => {
        try {
          results[provider] = await this.generate({
            prompt,
            provider: provider as AIProvider,
          });
        } catch (error: any) {
          results[provider] = `Error: ${error.message}`;
        }
      })
    );

    return results;
  }
}

export const multiAIService = new MultiAIService();
