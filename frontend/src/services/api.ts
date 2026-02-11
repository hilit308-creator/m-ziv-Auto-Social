import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://m-ziv-auto-social-production.up.railway.app';
const API_KEY = import.meta.env.VITE_API_KEY || 'mziv_2026_secret_key_for_mom';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

// Posts
export const postsApi = {
  getAll: () => api.get('/api/posts'),
  getById: (id: string) => api.get(`/api/posts/${id}`),
  create: (data: any) => api.post('/api/posts', data),
  update: (id: string, data: any) => api.patch(`/api/posts/${id}`, data),
  delete: (id: string) => api.delete(`/api/posts/${id}`),
  rewrite: (id: string, command: string) => api.post(`/api/posts/${id}/rewrite`, { command }),
  getVersions: (id: string) => api.get(`/api/posts/${id}/versions`),
};

// Profile
export const profileApi = {
  get: () => api.get('/api/profile'),
  update: (data: any) => api.patch('/api/profile', data),
};

// Ideas
export const ideasApi = {
  getToday: () => api.get('/api/ideas/today'),
  generate: (count?: number) => api.post('/api/ideas/generate', { count }),
  getAll: () => api.get('/api/ideas'),
  markUsed: (id: string) => api.post(`/api/ideas/${id}/use`),
};

// Calendar
export const calendarApi = {
  getWeek: (start?: string) => api.get('/api/calendar/week', { params: { start } }),
  getMonth: (year: number, month: number) => api.get(`/api/calendar/month/${year}/${month}`),
  schedule: (postId: string, scheduledAt: string) => api.post(`/api/calendar/schedule/${postId}`, { scheduled_at: scheduledAt }),
  unschedule: (postId: string) => api.post(`/api/calendar/unschedule/${postId}`),
};

// Analytics
export const analyticsApi = {
  getOverview: (days?: number) => api.get('/api/analytics/overview', { params: { days } }),
  getPostsPerDay: (days?: number) => api.get('/api/analytics/posts-per-day', { params: { days } }),
  getPlatformDistribution: () => api.get('/api/analytics/platform-distribution'),
  getTopTopics: (limit?: number) => api.get('/api/analytics/top-topics', { params: { limit } }),
};

// Reports
export const reportsApi = {
  getDaily: (date?: string) => api.get('/api/reports/daily', { params: { date } }),
  getWeekly: (start?: string) => api.get('/api/reports/weekly', { params: { start } }),
  getMonthly: (year: number, month: number) => api.get(`/api/reports/monthly/${year}/${month}`),
};

// Publishing
export const publishApi = {
  getStatus: () => api.get('/api/publish/status'),
  publish: (postId: string) => api.post(`/api/publish/${postId}`),
  processScheduled: () => api.post('/api/publish/process/scheduled'),
};

// Auth / Social connections
export const authApi = {
  getStatus: () => api.get('/api/auth/status'),
  connect: (platform: string) => api.get(`/api/auth/connect/${platform}`),
  disconnect: (platform: string) => api.post(`/api/auth/disconnect/${platform}`),
};

// Auto-reply
export const autoReplyApi = {
  getConfig: () => api.get('/api/auto-reply/config'),
  updateConfig: (data: any) => api.patch('/api/auto-reply/config', data),
  analyze: (comment: any) => api.post('/api/auto-reply/analyze', { comment }),
  generate: (comment: any) => api.post('/api/auto-reply/generate', { comment }),
};

// Media
export const mediaApi = {
  getStatus: () => api.get('/api/media/status'),
  uploadFromUrl: (url: string) => api.post('/api/media/upload/url', { url }),
};

// Video
export const videoApi = {
  getStatus: () => api.get('/api/video/status'),
  generate: (data: { prompt: string; duration?: number; aspect_ratio?: string }) => 
    api.post('/api/video/generate', data),
  checkStatus: (videoId: string, provider: string) => 
    api.get(`/api/video/status/${videoId}`, { params: { provider } }),
  generateReel: (postId: string) => api.post(`/api/video/generate/reel/${postId}`),
  generateStory: (topic: string, style?: string) => 
    api.post('/api/video/generate/story', { topic, style }),
};

// Templates
export const templatesApi = {
  getAll: (platform?: string, category?: string) => 
    api.get('/api/templates', { params: { platform, category } }),
  getById: (id: string) => api.get(`/api/templates/${id}`),
  create: (data: any) => api.post('/api/templates', data),
  update: (id: string, data: any) => api.patch(`/api/templates/${id}`, data),
  delete: (id: string) => api.delete(`/api/templates/${id}`),
  seed: () => api.post('/api/templates/seed'),
};

// Spam
export const spamApi = {
  check: (text: string) => api.post('/api/spam/check', { text }),
  analyze: (comment: string) => api.post('/api/spam/analyze', { comment }),
  getKeywords: () => api.get('/api/spam/keywords'),
};

// AI Personal Assistant
export const assistantApi = {
  // Speech to Text
  transcribe: (data: { audioUrl?: string; audioBase64?: string; filename?: string }) => 
    api.post('/api/assistant/transcribe', data),
  
  // Energy Mode
  getEnergyProfile: () => api.get('/api/assistant/energy-profile'),
  updateEnergyProfile: (data: any) => api.patch('/api/assistant/energy-profile', data),
  getBatchSuggestion: () => api.post('/api/assistant/batch-suggest'),
  
  // Voice First
  createVoicePost: (data: { transcript: string; audioUrl?: string; platforms?: string[] }) => 
    api.post('/api/assistant/voice-post', data),
  
  // Ideas
  captureIdea: (data: { inputType: string; content: string; tags?: string[] }) => 
    api.post('/api/assistant/ideas/capture', data),
  getIdeas: (status?: string) => api.get('/api/assistant/ideas', { params: { status } }),
  convertIdeaToPost: (ideaId: string, platforms?: string[]) => 
    api.post('/api/assistant/ideas/convert-to-post', { ideaId, platforms }),
  
  // Recycling
  getRecyclingSuggestions: () => api.get('/api/assistant/recycling-suggestions'),
  recyclePost: (postId: string, suggestionType: string, targetPlatform?: string) => 
    api.post('/api/assistant/recycle-post', { postId, suggestionType, targetPlatform }),
  
  // Learning Engine
  getStyleProfile: () => api.get('/api/assistant/style-profile'),
  updateStyleProfile: (data: any) => api.patch('/api/assistant/style-profile', data),
  submitFeedback: (data: any) => api.post('/api/assistant/feedback', data),
  trainVoiceModel: () => api.post('/api/assistant/train-voice'),
  
  // Burnout Protection
  getBurnoutStatus: () => api.get('/api/assistant/burnout-status'),
  
  // Daily Idea
  getDailyIdea: () => api.get('/api/assistant/daily-idea'),
  
  // Reply Suggestions
  suggestReply: (comment: string, platform: string, context?: string) => 
    api.post('/api/assistant/reply-suggest', { comment, platform, context }),
  
  // Mom Mode
  getMomModeData: () => api.get('/api/assistant/mom-mode'),
  
  // Privacy
  deleteUserData: () => api.delete('/api/assistant/user-data'),
  updatePrivacyConsent: (data: { voiceDataConsent?: boolean; dataRetentionDays?: number }) => 
    api.patch('/api/assistant/privacy-consent', data),
};

export default api;
