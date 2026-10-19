# 🚀 M-Ziv Auto Social - מערכת AI לייצור תוכן עסקי

מערכת מתקדמת לניהול אוטומטי של תוכן ברשתות חברתיות עבור M-Ziv Business Consulting, עם יכולות AI מתקדמות ליצירת תוכן בעברית, פרסום חכם, ואנליטיקה מעמיקה.

## 📚 תיעוד

### מסמכי אפיון ותכנון
- **[SPECIFICATION.md](./SPECIFICATION.md)** - אפיון מלא של המערכת
- **[SHORTCUT_ACTIONS.md](./SHORTCUT_ACTIONS.md)** - רשימת 13 Shortcuts מוכנים לשימוש
- **[AI_PROMPTS.md](./AI_PROMPTS.md)** - 20 Prompts מוכנים ל-AI
- **[AUTOMATION_FLOW.md](./AUTOMATION_FLOW.md)** - 5 Flows אוטומציה מפורטים

## ✨ תכונות עיקריות

### 🤖 יצירת תוכן אוטומטית
- יצירת פוסטים באמצעות GPT-4, Claude, Gemini
- יצירת תמונות עם DALL-E, Midjourney
- יצירת וידאו קצר לסטוריז ו-Reels
- התאמה אוטומטית לכל פלטפורמה

### 📅 תזמון ופרסום חכם
- זיהוי שעות שיא לפרסום
- פרסום בו זמני למספר פלטפורמות
- ניהול תור פרסומים
- תזמון מבוסס AI

### 💬 אינטראקציה אוטומטית
- מענה אוטומטי לתגובות
- ניתוח סנטימנט
- סינון ספאם
- בניית קהילה

### 📊 ניתוח וביצועים
- מעקב אחר engagement, reach, growth
- דוחות יומיים/שבועיים/חודשיים אוטומטיים
- המלצות AI לשיפור
- ניתוח תוכן מצליח

### 🔄 אופטימיזציה מתמדת
- למידה מתמדת מביצועים
- A/B testing אוטומטי
- עדכון אלגוריתמים
- ניתוח מתחרים

## 🎯 פלטפורמות נתמכות

- ✅ Instagram (פוסטים, סטוריז, Reels)
- ✅ Facebook (פוסטים, סטוריז)
- ✅ Twitter/X (טוויטים, threads)
- ✅ LinkedIn (פוסטים, מאמרים)
- ✅ TikTok (וידאו)
- ✅ YouTube (Shorts)

## 🏗️ ארכיטקטורה

```
┌─────────────┐
│   Frontend  │  React + TypeScript + TailwindCSS
│  (Web/Mobile)│
└──────┬──────┘
       │
┌──────▼──────┐
│ API Gateway │  Express.js + JWT Auth
└──────┬──────┘
       │
   ┌───┴───┬────────┬──────────┐
   │       │        │          │
┌──▼──┐ ┌─▼──┐ ┌───▼───┐ ┌────▼────┐
│Content│Publish│Engage│Analytics│
│Service│Service│Service│ Service │
└──┬──┘ └─┬──┘ └───┬───┘ └────┬────┘
   │      │        │          │
   └──────┴────┬───┴──────────┘
               │
        ┌──────▼──────┐
        │  AI Services│  OpenAI, Claude, DALL-E
        │ Social APIs │  Instagram, Facebook, etc.
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │  Data Layer │  PostgreSQL + MongoDB + Redis
        └─────────────┘
```

## 🚀 Quick Start

### דרישות מקדימות
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- MongoDB 6+ (אופציונלי)

### התקנה

```bash
# Clone the repository
git clone https://github.com/yourusername/auto-social.git
cd auto-social

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### משתני סביבה נדרשים

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/autosocial
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017/autosocial

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Social Media APIs
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# App Config
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

## 📱 iOS Shortcuts

המערכת כולל 13 Shortcuts מוכנים לשימוש:

1. **Quick Post Creator** - יצירת פוסט מהיר
2. **Publish Everywhere** - פרסום לכל הפלטפורמות
3. **Content Series Generator** - יצירת 7 פוסטים לשבוע
4. **Daily Analytics Report** - דוח ביצועים יומי
5. **Auto Reply to Comments** - מענה אוטומטי
6. **AI Image Generator** - יצירת תמונה
7. **Smart Scheduler** - תזמון חכם
8. **Content Backup** - גיבוי תוכן
9. **Hashtag Generator** - מחולל hashtags
10. **Quick Dashboard** - סטטוס מהיר

[הוראות מפורטות ב-SHORTCUT_ACTIONS.md](./SHORTCUT_ACTIONS.md)

## 🤖 AI Prompts

המערכת כולל 20 Prompts מוכנים:

### יצירת תוכן
- פוסט Instagram כללי
- Thread ל-Twitter/X
- פוסט LinkedIn מקצועי
- סטורי Instagram (5 סלייד)
- תיאור וידאו YouTube/TikTok

### תמונות
- תמונת פוסט Instagram
- תמונת כיסוי לסטורי

### מענה אוטומטי
- מענה לתגובה חיובית
- מענה לשאלה
- מענה לתלונה

### ניתוח
- ניתוח ביצועי פוסט
- המלצות לשיפור תוכן

### Hashtags
- יצירת Hashtags

### תכנון
- תכנית תוכן שבועית
- רעיונות לסדרת תוכן

[כל ה-Prompts ב-AI_PROMPTS.md](./AI_PROMPTS.md)

## 🔄 Automation Flows

המערכת מורכבת מ-5 flows עיקריים:

1. **Content Creation Flow** - יצירת תוכן אוטומטית
2. **Publishing Flow** - פרסום ותזמון
3. **Engagement Flow** - אינטראקציה אוטומטית
4. **Analytics Flow** - ניתוח וביצועים
5. **Optimization Flow** - שיפור מתמיד

[תרשימי Flow מפורטים ב-AUTOMATION_FLOW.md](./AUTOMATION_FLOW.md)

## 💻 דוגמאות שימוש

### יצירת פוסט עם AI

```javascript
import { createPost } from './services/content';

const post = await createPost({
  topic: 'AI in marketing',
  platform: 'instagram',
  tone: 'professional',
  brandVoice: 'innovative and approachable',
  targetAudience: 'marketing professionals aged 25-45'
});

console.log(post.content);
// "🚀 AI is revolutionizing marketing..."
```

### פרסום לכל הפלטפורמות

```javascript
import { publishEverywhere } from './services/publishing';

const results = await publishEverywhere({
  content: 'Your post content here',
  platforms: ['instagram', 'facebook', 'twitter', 'linkedin'],
  imageUrl: 'https://example.com/image.jpg',
  scheduleTime: new Date('2024-02-11T10:00:00Z')
});

console.log(results);
// { instagram: 'success', facebook: 'success', ... }
```

### מענה אוטומטי לתגובות

```javascript
import { autoReply } from './services/engagement';

const replies = await autoReply({
  platform: 'instagram',
  postId: '123456789',
  autoApprove: true
});

console.log(replies);
// [{ commentId: '...', reply: '...', status: 'posted' }]
```

### קבלת דוח אנליטיקה

```javascript
import { getDailyReport } from './services/analytics';

const report = await getDailyReport({
  date: new Date(),
  platforms: ['instagram', 'facebook']
});

console.log(report);
// { totalLikes: 1234, totalComments: 56, ... }
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📦 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build Docker image
docker build -t auto-social .

# Run container
docker run -p 3000:3000 --env-file .env auto-social
```

### Deploy to Cloud

```bash
# Deploy to Vercel
vercel deploy --prod

# Deploy to Railway
railway up

# Deploy to AWS
npm run deploy:aws
```

## 📊 Monitoring

המערכת כולל monitoring מובנה:

- **Health Check:** `GET /health`
- **Metrics:** `GET /metrics`
- **Logs:** Winston + CloudWatch
- **Errors:** Sentry integration
- **Performance:** DataDog APM

## 🔒 Security

- JWT authentication
- OAuth 2.0 for social platforms
- Encrypted tokens (AES-256)
- Rate limiting
- CORS policies
- Input validation (Zod)
- SQL injection prevention
- XSS protection

## 📈 Performance

- Response time: <200ms (p95)
- Availability: >99.9%
- Error rate: <0.1%
- Concurrent users: 10,000+
- Posts/minute: 1,000+

## 🤝 Contributing

תרומות מתקבלות בברכה! אנא קרא את [CONTRIBUTING.md](./CONTRIBUTING.md) לפני שליחת PR.

## 📄 License

MIT License - ראה [LICENSE](./LICENSE) לפרטים

## 🆘 Support

- 📧 Email: support@autosocial.com
- 💬 Discord: [Join our community](https://discord.gg/autosocial)
- 📚 Documentation: [docs.autosocial.com](https://docs.autosocial.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/auto-social/issues)

## 🗺️ Roadmap

### Q1 2024
- ✅ MVP Launch
- ✅ Instagram & Facebook support
- ✅ Basic AI content generation
- 🔄 Twitter/X integration

### Q2 2024
- 📅 LinkedIn & TikTok support
- 📅 Video generation
- 📅 Advanced analytics
- 📅 Mobile app (iOS)

### Q3 2024
- 📅 YouTube integration
- 📅 Influencer collaboration tools
- 📅 White label solution
- 📅 API for developers

### Q4 2024
- 📅 AI-powered insights
- 📅 Competitive intelligence
- 📅 Advanced automation rules
- 📅 Enterprise features

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Anthropic for Claude API
- Meta for Instagram & Facebook APIs
- Twitter for X API
- LinkedIn for LinkedIn API

---

**Built with ❤️ by the Auto Social Team**

🌟 אם המערכת עזרה לך, תן לנו כוכב ב-GitHub!
