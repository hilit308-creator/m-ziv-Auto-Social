# 🚀 Quick Start Guide - Auto Social

מדריך התחלה מהירה למערכת Auto Social

## 📋 תוכן עניינים

1. [התקנה מהירה](#התקנה-מהירה)
2. [הגדרת API Keys](#הגדרת-api-keys)
3. [הרצת המערכת](#הרצת-המערכת)
4. [דוגמאות שימוש](#דוגמאות-שימוש)
5. [iOS Shortcuts](#ios-shortcuts)
6. [בעיות נפוצות](#בעיות-נפוצות)

---

## 🎯 התקנה מהירה

### שלב 1: דרישות מקדימות

וודא שמותקן:
- Node.js 20+ ([הורד כאן](https://nodejs.org/))
- PostgreSQL 15+ ([הורד כאן](https://www.postgresql.org/download/))
- Redis 7+ ([הורד כאן](https://redis.io/download))

### שלב 2: Clone והתקנה

```bash
# Clone the repository
git clone https://github.com/yourusername/auto-social.git
cd auto-social

# Install dependencies
npm install
```

### שלב 3: הגדרת Database

```bash
# Create PostgreSQL database
createdb autosocial

# Copy environment file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgresql://user:password@localhost:5432/autosocial
```

### שלב 4: הרצה ראשונית

```bash
# Run migrations
npm run migrate

# Start development server
npm run dev
```

המערכת תרוץ על: `http://localhost:3000`

---

## 🔑 הגדרת API Keys

### OpenAI (חובה)

1. היכנס ל-[OpenAI Platform](https://platform.openai.com/)
2. צור API Key חדש
3. הוסף ל-`.env`:
```env
OPENAI_API_KEY=sk-...
```

### Instagram & Facebook

1. היכנס ל-[Meta for Developers](https://developers.facebook.com/)
2. צור אפליקציה חדשה
3. הוסף Instagram Graph API
4. קבל App ID ו-App Secret
5. הוסף ל-`.env`:
```env
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

### Twitter/X

1. היכנס ל-[Twitter Developer Portal](https://developer.twitter.com/)
2. צור פרויקט ואפליקציה
3. קבל API Keys
4. הוסף ל-`.env`:
```env
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_BEARER_TOKEN=...
```

### LinkedIn

1. היכנס ל-[LinkedIn Developers](https://www.linkedin.com/developers/)
2. צור אפליקציה
3. קבל Client ID ו-Client Secret
4. הוסף ל-`.env`:
```env
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
```

---

## 🏃 הרצת המערכת

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

### עם Docker

```bash
# Build image
docker build -t auto-social .

# Run container
docker run -p 3000:3000 --env-file .env auto-social
```

---

## 💡 דוגמאות שימוש

### 1. יצירת פוסט עם AI

**cURL:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-post \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in marketing",
    "platform": "instagram",
    "tone": "professional"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:3000/api/ai/generate-post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'AI in marketing',
    platform: 'instagram',
    tone: 'professional'
  })
});

const data = await response.json();
console.log(data.data.text);
```

**תשובה:**
```json
{
  "success": true,
  "data": {
    "text": "🚀 AI is revolutionizing marketing...",
    "hashtags": ["#AIMarketing", "#DigitalMarketing", ...],
    "alternatives": [...],
    "confidence": 0.85
  }
}
```

### 2. פרסום לכל הפלטפורמות

**cURL:**
```bash
curl -X POST http://localhost:3000/api/posts/publish \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your amazing post content here!",
    "platforms": ["instagram", "facebook", "twitter"],
    "imageUrl": "https://example.com/image.jpg"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:3000/api/posts/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Your amazing post content here!',
    platforms: ['instagram', 'facebook', 'twitter'],
    imageUrl: 'https://example.com/image.jpg'
  })
});

const data = await response.json();
console.log(data.data.results);
```

### 3. יצירת Hashtags

**cURL:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-hashtags \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Amazing sunset at the beach",
    "platform": "instagram",
    "count": 30
  }'
```

### 4. תזמון פוסט

**cURL:**
```bash
curl -X POST http://localhost:3000/api/posts/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Scheduled post",
    "platforms": ["instagram"],
    "scheduleTime": "2024-02-15T10:00:00Z"
  }'
```

### 5. מענה אוטומטי

**cURL:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-reply \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Love your content!",
    "sentiment": "positive",
    "brandVoice": "friendly and enthusiastic"
  }'
```

---

## 📱 iOS Shortcuts

### התקנת Shortcut ראשון

1. פתח אפליקציית **Shortcuts** ב-iPhone
2. לחץ על **+** ליצירת Shortcut חדש
3. הוסף פעולה: **Get Contents of URL**
4. הגדר:
   - URL: `http://your-server.com/api/ai/generate-post`
   - Method: `POST`
   - Headers: `Content-Type: application/json`
   - Body: 
   ```json
   {
     "topic": "Ask Each Time",
     "platform": "instagram",
     "tone": "casual"
   }
   ```
5. הוסף פעולה: **Show Result**
6. שמור בשם "Quick Post"

### דוגמה: Quick Post Creator

```
[Shortcut Flow]
1. Ask for Input → "What's your post topic?"
2. Get Contents of URL
   - URL: http://localhost:3000/api/ai/generate-post
   - Method: POST
   - Body: {"topic": "[Input]", "platform": "instagram"}
3. Get Dictionary Value → "text" from Response
4. Show Result
5. Ask: "Post now?"
6. If Yes → Call publish API
```

### דוגמה: Daily Analytics

```
[Shortcut Flow]
1. Get Contents of URL
   - URL: http://localhost:3000/api/analytics/daily
   - Method: GET
2. Show Notification
   - Title: "Daily Report"
   - Body: [Response]
```

---

## 🔧 בעיות נפוצות

### בעיה: "Cannot connect to database"

**פתרון:**
```bash
# Check PostgreSQL is running
pg_isready

# If not running, start it
brew services start postgresql
# or
sudo systemctl start postgresql
```

### בעיה: "Redis connection failed"

**פתרון:**
```bash
# Check Redis is running
redis-cli ping

# If not running, start it
brew services start redis
# or
sudo systemctl start redis
```

### בעיה: "OpenAI API error"

**פתרון:**
1. בדוק ש-API Key תקין
2. בדוק יתרה ב-[OpenAI Account](https://platform.openai.com/account/billing)
3. בדוק rate limits

### בעיה: "Instagram API error"

**פתרון:**
1. וודא שהאפליקציה אושרה ב-Meta
2. בדוק שיש Instagram Business Account מחובר
3. רענן Access Token

### בעיה: Port 3000 already in use

**פתרון:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 [PID]

# Or use different port
PORT=3001 npm run dev
```

---

## 📚 משאבים נוספים

- [תיעוד מלא](./SPECIFICATION.md)
- [רשימת Shortcuts](./SHORTCUT_ACTIONS.md)
- [AI Prompts](./AI_PROMPTS.md)
- [Automation Flows](./AUTOMATION_FLOW.md)

---

## 🆘 קבלת עזרה

אם נתקלת בבעיה:

1. בדוק את [Issues](https://github.com/yourusername/auto-social/issues)
2. צור Issue חדש עם פרטים
3. הצטרף ל-[Discord](https://discord.gg/autosocial)
4. שלח מייל ל-support@autosocial.com

---

## ✅ Checklist להתחלה

- [ ] Node.js 20+ מותקן
- [ ] PostgreSQL 15+ מותקן ורץ
- [ ] Redis 7+ מותקן ורץ
- [ ] Dependencies מותקנים (`npm install`)
- [ ] `.env` מוגדר עם API keys
- [ ] Database migrations רצו (`npm run migrate`)
- [ ] Server רץ (`npm run dev`)
- [ ] Health check עובד (`curl http://localhost:3000/health`)
- [ ] יצרת פוסט ראשון בהצלחה
- [ ] הגדרת Shortcut ראשון ב-iOS

---

**מוכן לעבודה! 🎉**

עכשיו אתה יכול להתחיל ליצור תוכן אוטומטי לרשתות חברתיות!
