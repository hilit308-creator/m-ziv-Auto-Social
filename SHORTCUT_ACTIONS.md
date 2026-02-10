# 📱 רשימת פעולות Shortcut לבנייה

## 🎯 Shortcuts עיקריים למערכת Auto Social

### 1️⃣ יצירת פוסט מהיר (Quick Post Creator)

**מטרה:** יצירת פוסט חדש תוך שניות

**שלבים:**
1. **Get Input** - קבלת נושא/רעיון לפוסט
2. **Call API** - שליחה ל-AI API (OpenAI/Claude)
   - Endpoint: `/api/ai/generate-post`
   - Method: POST
   - Body: `{ "topic": input, "platform": "instagram", "tone": "casual" }`
3. **Parse Response** - קבלת הטקסט שנוצר
4. **Show Preview** - הצגת תצוגה מקדימה
5. **Confirm** - אישור משתמש
6. **Schedule Post** - תזמון הפוסט
   - Endpoint: `/api/posts/schedule`
   - Method: POST
7. **Show Success** - הודעת הצלחה

**משתנים:**
- `topic` - נושא הפוסט
- `platform` - פלטפורמה (instagram/facebook/twitter)
- `scheduleTime` - זמן לפרסום
- `generatedContent` - התוכן שנוצר

---

### 2️⃣ פרסום מיידי לכל הפלטפורמות (Publish Everywhere)

**מטרה:** פרסום תוכן בו-זמני לכל הרשתות

**שלבים:**
1. **Get Text Input** - קבלת טקסט הפוסט
2. **Choose Platforms** - בחירת פלטפורמות
   - List: Instagram, Facebook, Twitter, LinkedIn, TikTok
3. **Get Image** (אופציונלי) - בחירת תמונה
4. **Repeat for Each Platform**:
   - **Adapt Content** - התאמת תוכן לפלטפורמה
   - **Call API** - `/api/posts/publish`
   - **Wait for Response**
5. **Collect Results** - איסוף תוצאות
6. **Show Summary** - הצגת סיכום פרסומים

**משתנים:**
- `postText` - טקסט מקורי
- `selectedPlatforms` - רשימת פלטפורמות
- `imageURL` - קישור לתמונה
- `results` - תוצאות פרסום

---

### 3️⃣ יצירת סדרת פוסטים (Content Series Generator)

**מטרה:** יצירת 7 פוסטים לשבוע בבת אחת

**שלבים:**
1. **Get Input** - נושא כללי לסדרה
2. **Set Parameters**:
   - מספר פוסטים (ברירת מחדל: 7)
   - פלטפורמה
   - טון וסגנון
3. **Loop 7 Times**:
   - **Call AI API** - יצירת פוסט
   - **Add to List** - הוספה לרשימה
   - **Wait 2 seconds** - למנוע rate limiting
4. **Review All Posts** - הצגת כל הפוסטים
5. **Schedule Series**:
   - **Calculate Times** - חישוב זמנים אופטימליים
   - **Bulk Schedule** - תזמון קבוצתי
6. **Save to Calendar** - שמירה ביומן

**משתנים:**
- `seriesTopic` - נושא הסדרה
- `postCount` - מספר פוסטים
- `generatedPosts` - רשימת פוסטים
- `scheduleTimes` - זמני פרסום

---

### 4️⃣ ניתוח ביצועים יומי (Daily Analytics Report)

**מטרה:** קבלת דוח ביצועים יומי

**שלבים:**
1. **Get Current Date** - תאריך נוכחי
2. **Call Analytics API**:
   - Endpoint: `/api/analytics/daily`
   - Method: GET
   - Params: `{ date: today }`
3. **Parse Data**:
   - Total likes
   - Total comments
   - Total shares
   - Reach
   - Best performing post
4. **Format Report** - עיצוב הדוח
5. **Send Notification** - שליחת התראה
6. **Save to Notes** (אופציונלי)

**משתנים:**
- `today` - תאריך
- `analyticsData` - נתוני אנליטיקה
- `reportText` - טקסט הדוח

---

### 5️⃣ מענה אוטומטי לתגובות (Auto Reply to Comments)

**מטרה:** מענה חכם לתגובות חדשות

**שלבים:**
1. **Fetch New Comments**:
   - Endpoint: `/api/comments/unread`
   - Method: GET
2. **Filter Comments** - סינון ספאם
3. **For Each Comment**:
   - **Analyze Sentiment** - ניתוח סנטימנט
   - **Generate Reply** - יצירת תשובה מותאמת
   - **Call AI API** - `/api/ai/generate-reply`
   - **Post Reply** - פרסום התשובה
   - **Mark as Handled** - סימון כטופל
4. **Log Activity** - רישום פעילות

**משתנים:**
- `newComments` - תגובות חדשות
- `commentText` - טקסט תגובה
- `generatedReply` - תשובה שנוצרה
- `sentiment` - סנטימנט (positive/negative/neutral)

---

### 6️⃣ יצירת תמונה עם AI (AI Image Generator)

**מטרה:** יצירת תמונה מותאמת אישית

**שלבים:**
1. **Get Description** - תיאור התמונה הרצויה
2. **Choose Style**:
   - Realistic
   - Cartoon
   - Minimalist
   - Professional
3. **Choose Platform** - בחירת פלטפורמה (לגודל נכון)
4. **Call Image API**:
   - Endpoint: `/api/ai/generate-image`
   - Method: POST
   - Body: `{ "prompt": description, "style": style, "size": platformSize }`
5. **Wait for Generation** - המתנה ליצירה (10-30 שניות)
6. **Download Image** - הורדת התמונה
7. **Show Preview** - תצוגה מקדימה
8. **Save to Library** - שמירה בספרייה

**משתנים:**
- `imagePrompt` - תיאור התמונה
- `imageStyle` - סגנון
- `platform` - פלטפורמה
- `imageURL` - קישור לתמונה

---

### 7️⃣ תזמון חכם (Smart Scheduler)

**מטרה:** מציאת הזמן הטוב ביותר לפרסום

**שלבים:**
1. **Get Post Content** - קבלת תוכן
2. **Get Platform** - בחירת פלטפורמה
3. **Call Analytics API**:
   - Endpoint: `/api/analytics/best-times`
   - Method: GET
   - Params: `{ platform: platform, lookback: 30 }`
4. **Get Recommendations** - קבלת המלצות
5. **Show Options** - הצגת 3 אפשרויות מובילות
6. **User Selects Time** - בחירת זמן
7. **Schedule Post** - תזמון
8. **Add to Calendar** - הוספה ליומן

**משתנים:**
- `postContent` - תוכן הפוסט
- `platform` - פלטפורמה
- `bestTimes` - זמנים מומלצים
- `selectedTime` - זמן נבחר

---

### 8️⃣ גיבוי תוכן (Content Backup)

**מטרה:** גיבוי כל התוכן והפוסטים

**שלבים:**
1. **Call Backup API**:
   - Endpoint: `/api/backup/create`
   - Method: POST
2. **Wait for Backup** - המתנה ליצירת גיבוי
3. **Get Download Link** - קבלת קישור להורדה
4. **Save to iCloud/Dropbox** - שמירה בענן
5. **Send Confirmation** - אישור הצלחה

**משתנים:**
- `backupURL` - קישור לגיבוי
- `backupDate` - תאריך גיבוי

---

### 9️⃣ מחולל Hashtags (Hashtag Generator)

**מטרה:** יצירת hashtags רלוונטיים

**שלבים:**
1. **Get Post Text** - טקסט הפוסט
2. **Get Platform** - פלטפורמה
3. **Call AI API**:
   - Endpoint: `/api/ai/generate-hashtags`
   - Method: POST
   - Body: `{ "content": text, "platform": platform, "count": 30 }`
4. **Get Hashtags** - קבלת רשימת hashtags
5. **Analyze Popularity** - ניתוח פופולריות
6. **Sort by Relevance** - מיון לפי רלוונטיות
7. **Copy to Clipboard** - העתקה ללוח
8. **Show in List** - הצגה ברשימה

**משתנים:**
- `postText` - טקסט
- `platform` - פלטפורמה
- `hashtags` - רשימת hashtags
- `hashtagString` - מחרוזת מוכנה

---

### 🔟 סטטוס דשבורד (Quick Dashboard)

**מטרה:** צפייה מהירה בסטטוס המערכת

**שלבים:**
1. **Get User Data**:
   - Endpoint: `/api/user/dashboard`
   - Method: GET
2. **Parse Data**:
   - Scheduled posts count
   - Published today
   - Total followers (all platforms)
   - Engagement rate
   - Pending comments
3. **Format Display** - עיצוב תצוגה
4. **Show Notification** - הצגה כהתראה
5. **Add Quick Actions**:
   - Create new post
   - View analytics
   - Check comments

**משתנים:**
- `scheduledCount` - פוסטים מתוזמנים
- `publishedToday` - פורסמו היום
- `totalFollowers` - סך עוקבים
- `engagementRate` - אחוז engagement

---

## 🔧 Shortcuts טכניים (Backend)

### 11. רענון Tokens (Refresh Social Tokens)
- בדיקת תוקף tokens
- רענון אוטומטי
- שמירה במאגר

### 12. ניקוי Database (Database Cleanup)
- מחיקת פוסטים ישנים
- ארכוב נתונים
- אופטימיזציה

### 13. בדיקת תקינות (Health Check)
- בדיקת כל ה-APIs
- בדיקת חיבורי DB
- בדיקת Queue system

---

## 📲 הוראות התקנה

### iOS Shortcuts App:
1. פתח אפליקציית Shortcuts
2. לחץ על "+" ליצירת Shortcut חדש
3. העתק את השלבים מהרשימה למעלה
4. התאם את ה-URLs ל-API שלך
5. הוסף Authentication headers
6. שמור ובדוק

### Integration עם המערכת:
```javascript
// Example API endpoint structure
POST /api/shortcuts/execute
{
  "shortcutId": "quick-post-creator",
  "parameters": {
    "topic": "AI in marketing",
    "platform": "instagram"
  }
}
```

### Authentication:
כל Shortcut צריך לכלול:
```
Headers:
- Authorization: Bearer {USER_TOKEN}
- Content-Type: application/json
```

---

## 🎨 Customization

כל Shortcut ניתן להתאמה אישית:
- שינוי פרמטרים
- הוספת שלבים
- שינוי UI
- הוספת תנאים (if/else)
- לולאות מותאמות

---

## 🚀 Quick Start Guide

1. **התחל עם הבסיסי:** Quick Post Creator
2. **הוסף אוטומציה:** Smart Scheduler
3. **הרחב:** Content Series Generator
4. **נתח:** Daily Analytics Report
5. **אוטומט אינטראקציה:** Auto Reply to Comments
