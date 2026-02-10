# 🚀 M-Ziv API - מדריך פריסה (Deployment)

## אפשרות 1: Render.com (מומלץ - חינם!)

### שלב 1: הכנת הקוד
```bash
# אתחול Git (אם עוד לא עשית)
git init
git add .
git commit -m "Initial commit - M-Ziv API"

# צור repository ב-GitHub והעלה
git remote add origin https://github.com/YOUR_USERNAME/m-ziv-auto-social.git
git push -u origin main
```

### שלב 2: פריסה ב-Render
1. היכנס ל-https://render.com
2. לחץ על "New +" → "Web Service"
3. חבר את GitHub repository שלך
4. הגדרות:
   - **Name:** `m-ziv-auto-social`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### שלב 3: Environment Variables
הוסף את המשתנים הבאים ב-Render:

```
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
MZIV_API_KEY=mziv_2026_secret_key_for_mom
CORS_ORIGIN=*
```

### שלב 4: Deploy!
לחץ על "Create Web Service" והמתן כ-2-3 דקות.

**תקבל URL:**
```
https://m-ziv-auto-social.onrender.com
```

---

## אפשרות 2: Railway.app

### שלב 1: פריסה
1. היכנס ל-https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. בחר את ה-repository
4. Railway יזהה אוטומטית שזה Node.js

### שלב 2: Environment Variables
לחץ על "Variables" והוסף:
```
OPENAI_API_KEY=...
MZIV_API_KEY=mziv_2026_secret_key_for_mom
NODE_ENV=production
```

### שלב 3: קבל URL
לחץ על "Settings" → "Generate Domain"

**תקבל URL:**
```
https://m-ziv-auto-social-production.up.railway.app
```

---

## אפשרות 3: Vercel

### שלב 1: התקנה
```bash
npm install -g vercel
```

### שלב 2: Deploy
```bash
vercel
```

עקוב אחרי ההנחיות:
- Setup and deploy? `Y`
- Which scope? בחר את החשבון שלך
- Link to existing project? `N`
- Project name? `m-ziv-auto-social`
- Directory? `./`
- Override settings? `N`

### שלב 3: Environment Variables
```bash
vercel env add OPENAI_API_KEY
vercel env add MZIV_API_KEY
```

**תקבל URL:**
```
https://m-ziv-auto-social.vercel.app
```

---

## אפשרות 4: Fly.io

### שלב 1: התקנה
```bash
# Mac
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### שלב 2: התחברות
```bash
flyctl auth login
```

### שלב 3: יצירת אפליקציה
```bash
flyctl launch
```

ענה על השאלות:
- App name? `m-ziv-auto-social`
- Region? בחר את הקרוב ביותר
- PostgreSQL? `N`
- Redis? `N`

### שלב 4: הגדרת Secrets
```bash
flyctl secrets set OPENAI_API_KEY="sk-proj-..."
flyctl secrets set MZIV_API_KEY="mziv_2026_secret_key_for_mom"
```

### שלב 5: Deploy
```bash
flyctl deploy
```

**תקבל URL:**
```
https://m-ziv-auto-social.fly.dev
```

---

## 🌐 Domain מותאם אישית (mziv-api.com)

### שלב 1: קנה Domain
- [Namecheap](https://namecheap.com) - ~$10/שנה
- [GoDaddy](https://godaddy.com) - ~$12/שנה
- [Google Domains](https://domains.google) - ~$12/שנה

### שלב 2: חבר ל-Render/Railway/Vercel

**Render:**
1. Settings → Custom Domains
2. הוסף `m-ziv-auto-social.com`
3. עדכן DNS records בספק ה-domain:
   ```
   Type: CNAME
   Name: @
   Value: m-ziv-auto-social.onrender.com
   ```

**Railway:**
1. Settings → Domains → Custom Domain
2. הוסף `m-ziv-auto-social.com`
3. עדכן DNS:
   ```
   Type: CNAME
   Name: @
   Value: [Railway provides this]
   ```

**Vercel:**
1. Settings → Domains
2. הוסף `m-ziv-auto-social.com`
3. עדכן DNS לפי ההנחיות

---

## 📱 עדכון ה-iPhone Shortcut

אחרי הפריסה, עדכן את ה-URL בשורטקאסט:

**מ:**
```
http://localhost:3000/api/v1/generate/post-pack
```

**ל:**
```
https://m-ziv-auto-social.onrender.com/api/v1/generate/post-pack
```

---

## ✅ בדיקה

אחרי הפריסה, בדוק שהכל עובד:

```bash
curl https://YOUR-URL.com/health
```

צריך להחזיר:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

---

## 🔒 אבטחה

אחרי הפריסה:
1. ✅ שנה את `MZIV_API_KEY` למשהו חזק יותר
2. ✅ הגבל `CORS_ORIGIN` לדומיינים ספציפיים
3. ✅ הפעל HTTPS (אוטומטי ברוב השירותים)
4. ✅ עקוב אחרי שימוש ב-OpenAI API

---

## 💰 עלויות

| שירות | תוכנית חינמית | מגבלות |
|-------|---------------|---------|
| **Render** | ✅ כן | 750 שעות/חודש, Sleep after 15min |
| **Railway** | ✅ כן | $5 credit/חודש |
| **Vercel** | ✅ כן | 100GB bandwidth |
| **Fly.io** | ✅ כן | 3 VMs, 160GB/חודש |

**המלצה:** התחל עם Render (חינם) ושדרג לפי הצורך.

---

**בהצלחה! 🚀**
