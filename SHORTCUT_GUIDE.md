# 📱 מדריך בניית iPhone Shortcuts — M-Ziv Auto Social

## 🔗 פרטי חיבור

| פרט | ערך |
|-----|-----|
| **Base URL** | `https://m-ziv-auto-social-production.up.railway.app` |
| **API Key** | הערך של `MZIV_API_KEY` ב-Railway |
| **Auth Header** | `x-api-key: YOUR_API_KEY` |

---

# 📱 Shortcut 1 — חיבור חשבונות (חד-פעמי)

## מה זה עושה?
בודק אילו רשתות מחוברות, ומאפשר לחבר את מה שחסר.

## שלבים לבנייה ב-Shortcuts:

### שלב 1: הגדרת משתנים
1. פתחי את אפליקציית **Shortcuts** באייפון
2. לחצי **+** ליצירת Shortcut חדש
3. שני את השם ל: **🔌 חבר חשבונות**
4. הוסיפי פעולה: **Text**
   - תוכן: `https://m-ziv-auto-social-production.up.railway.app`
   - שני את שם המשתנה ל: `base_url`
5. הוסיפי פעולה: **Text**
   - תוכן: `YOUR_API_KEY` (החליפי ב-API Key האמיתי)
   - שני את שם המשתנה ל: `api_key`

### שלב 2: בדיקת סטטוס חיבורים
6. הוסיפי פעולה: **Get Contents of URL**
   - URL: `base_url/api/v1/connect/status`
   - Method: **GET**
   - Headers:
     - Key: `x-api-key` → Value: `api_key`
7. הוסיפי פעולה: **Get Dictionary Value**
   - Key: `data`
8. שמרי כמשתנה: `statuses`

### שלב 3: בניית הודעת סטטוס
9. הוסיפי פעולה: **Text**
   - תוכן:
```
📊 סטטוס חיבורים:

Instagram: [statuses.instagram]
Facebook Page: [statuses.facebook_page]
TikTok: [statuses.tiktok]
YouTube: [statuses.youtube]
```
   > הערה: גררי את המשתנה `statuses` ובחרי Get Value for Key עבור כל רשת

### שלב 4: תפריט חיבור
10. הוסיפי פעולה: **Choose from Menu**
    - Prompt: `מה לחבר?`
    - אפשרויות:
      - `📸 Instagram + Facebook`
      - `🎵 TikTok`
      - `▶️ YouTube`
      - `✅ סיימתי`

### שלב 5: Instagram + Facebook
11. תחת **📸 Instagram + Facebook**:
    - הוסיפי **Get Contents of URL**
      - URL: `base_url/api/v1/connect/instagram/start`
      - Method: **GET**
      - Headers: `x-api-key` → `api_key`
    - הוסיפי **Get Dictionary Value** → Key: `data`
    - הוסיפי **Get Dictionary Value** → Key: `auth_url`
    - הוסיפי **Open URLs** (פותח את הדפדפן לאישור)
    - הוסיפי **Wait** → 3 seconds
    - הוסיפי **Show Alert**:
      - Title: `Instagram`
      - Message: `אחרי שאישרת בדפדפן, לחצי OK`
    - **חזרי על אותו דבר עבור Facebook:**
    - הוסיפי **Get Contents of URL**
      - URL: `base_url/api/v1/connect/facebook/start`
      - Method: **GET**
      - Headers: `x-api-key` → `api_key`
    - הוסיפי **Get Dictionary Value** → Key: `data`
    - הוסיפי **Get Dictionary Value** → Key: `auth_url`
    - הוסיפי **Open URLs**
    - הוסיפי **Show Alert**: `אחרי שאישרת Facebook, לחצי OK`

### שלב 6: TikTok
12. תחת **🎵 TikTok**:
    - הוסיפי **Get Contents of URL**
      - URL: `base_url/api/v1/connect/tiktok/start`
      - Method: **GET**
      - Headers: `x-api-key` → `api_key`
    - הוסיפי **Get Dictionary Value** → Key: `data`
    - הוסיפי **Get Dictionary Value** → Key: `auth_url`
    - הוסיפי **Open URLs**
    - הוסיפי **Show Alert**: `אחרי שאישרת TikTok, לחצי OK`

### שלב 7: YouTube
13. תחת **▶️ YouTube**:
    - הוסיפי **Get Contents of URL**
      - URL: `base_url/api/v1/connect/youtube/start`
      - Method: **GET**
      - Headers: `x-api-key` → `api_key`
    - הוסיפי **Get Dictionary Value** → Key: `data`
    - הוסיפי **Get Dictionary Value** → Key: `auth_url`
    - הוסיפי **Open URLs**
    - הוסיפי **Show Alert**: `אחרי שאישרת YouTube, לחצי OK`

### שלב 8: סיום
14. תחת **✅ סיימתי** (ואחרי כל חיבור):
    - הוסיפי **Get Contents of URL**
      - URL: `base_url/api/v1/connect/status`
      - Method: **GET**
      - Headers: `x-api-key` → `api_key`
    - הוסיפי **Get Dictionary Value** → Key: `data`
    - שמרי כ: `final_status`
    - הוסיפי **Show Alert**:
```
✅ סטטוס סופי:

Instagram: [final_status.instagram]
Facebook: [final_status.facebook_page]
TikTok: [final_status.tiktok]
YouTube: [final_status.youtube]
```

---

# 📱 Shortcut 2 — העלי סרטון 🚀

## מה זה עושה?
בוחרת סרטון → כותבת במה מדובר → מעלה → מפרסמת לכל הרשתות → מציגה תוצאות.

## שלבים לבנייה ב-Shortcuts:

### שלב 1: הגדרת משתנים
1. פתחי Shortcut חדש, שם: **🚀 העלי סרטון**
2. הוסיפי **Text**: `https://m-ziv-auto-social-production.up.railway.app`
   - שם: `base_url`
3. הוסיפי **Text**: `YOUR_API_KEY`
   - שם: `api_key`

### שלב 2: בחירת סרטון
4. הוסיפי פעולה: **Select Photos**
   - Selection: **Single**
   > זה יפתח את הגלריה לבחירת סרטון
5. שמרי כמשתנה: `selected_video`

### שלב 3: שאלה — על מה הסרטון?
6. הוסיפי פעולה: **Ask for Input**
   - Question: `על מה הסרטון? (תארי בקצרה)`
   - Input Type: **Text**
7. שמרי כמשתנה: `video_description`

### שלב 4: הודעת התחלה
8. הוסיפי פעולה: **Show Notification**
   - Title: `⏳ מעלה סרטון...`
   - Body: `זה יכול לקחת כמה שניות`

### שלב 5: העלאת הסרטון
9. הוסיפי פעולה: **Get Contents of URL**
   - URL: `base_url/api/media/upload`
   - Method: **POST**
   - Headers:
     - Key: `x-api-key` → Value: `api_key`
   - Request Body: **Form**
     - Key: `file` → Value: `selected_video` (גררי את המשתנה)
10. שמרי כמשתנה: `upload_response`
11. הוסיפי **Get Dictionary Value** → Key: `data`
12. הוסיפי **Get Dictionary Value** → Key: `media_id`
13. שמרי כמשתנה: `media_id`

### שלב 6: פרסום לכל הרשתות
14. הוסיפי פעולה: **Get Contents of URL**
    - URL: `base_url/api/publish/all`
    - Method: **POST**
    - Headers:
      - Key: `x-api-key` → `api_key`
      - Key: `Content-Type` → `application/json`
    - Request Body: **JSON**
```json
{
  "media_id": "media_id",
  "video_description": "video_description",
  "targets": ["instagram", "facebook_page", "tiktok", "youtube"]
}
```
   > חשוב: גררי את המשתנים `media_id` ו-`video_description` לתוך ה-JSON

15. שמרי כמשתנה: `publish_response`
16. הוסיפי **Get Dictionary Value** → Key: `data`
17. הוסיפי **Get Dictionary Value** → Key: `job_id`
18. שמרי כמשתנה: `job_id`

### שלב 7: Polling — המתנה לתוצאות
19. הוסיפי פעולה: **Repeat** → 10 פעמים (מקסימום 10 ניסיונות)
20. בתוך ה-Repeat:
    - הוסיפי **Wait** → 3 seconds
    - הוסיפי **Get Contents of URL**
      - URL: `base_url/api/publish/job-status?job_id=job_id`
      - Method: **GET**
      - Headers: `x-api-key` → `api_key`
    - הוסיפי **Get Dictionary Value** → Key: `data`
    - הוסיפי **Get Dictionary Value** → Key: `status`
    - שמרי כ: `job_status`
    - הוסיפי **If** → `job_status` **is not** `processing`
      - הוסיפי **Exit Repeat** (יציאה מהלולאה)
    - **End If**
21. **End Repeat**

### שלב 8: הצגת תוצאות
22. הוסיפי **Get Contents of URL** (קריאה אחרונה לסטטוס)
    - URL: `base_url/api/publish/job-status?job_id=job_id`
    - Method: **GET**
    - Headers: `x-api-key` → `api_key`
23. הוסיפי **Get Dictionary Value** → Key: `data`
24. הוסיפי **Get Dictionary Value** → Key: `platforms`
25. שמרי כ: `platforms`

26. הוסיפי **Text** (בניית הודעת סיכום):
```
🎬 הסרטון פורסם!

📸 Instagram: [platforms.instagram.status]
📘 Facebook: [platforms.facebook_page.status]
🎵 TikTok: [platforms.tiktok.status]
▶️ YouTube: [platforms.youtube.status]
```
   > גררי את `platforms` ובחרי Get Value for Key עבור כל רשת

27. הוסיפי **Show Result** (מציג את הטקסט)

---

# 🎨 טיפים לעיצוב

## אייקון ל-Shortcut 1 (חיבור):
- אייקון: 🔌
- צבע: כחול

## אייקון ל-Shortcut 2 (פרסום):
- אייקון: 🚀
- צבע: כתום

## הוספה למסך הבית:
1. לחצי על ה-Shortcut
2. לחצי על **⋯** (שלוש נקודות)
3. לחצי על **Add to Home Screen**
4. בחרי אייקון ושם

---

# ⚠️ דברים חשובים

1. **API Key** — החליפי `YOUR_API_KEY` ב-API Key האמיתי מ-Railway
2. **חיבור חד-פעמי** — Shortcut 1 צריך לרוץ רק פעם אחת (או כשפג תוקף)
3. **Facebook Page בלבד** — לא Facebook אישי
4. **גודל קובץ** — עד 500MB
5. **פורמטים נתמכים** — MP4, MOV, WebM, JPEG, PNG, WebP

---

# 🧪 בדיקה

## לבדוק שהכל עובד:
1. הריצי Shortcut 1 → ודאי שכל הרשתות `connected`
2. הריצי Shortcut 2 עם סרטון קצר → ודאי שמופיע `published` לכל רשת

## אם משהו לא עובד:
- בדקי שה-API Key נכון
- בדקי שה-Base URL נכון
- בדקי שהחשבונות מחוברים (הריצי Shortcut 1)
- אם רשת מציגה `expired` — חברי אותה מחדש

---

# 📋 סיכום Endpoints

| Endpoint | Method | שימוש |
|----------|--------|-------|
| `/api/v1/connect/status` | GET | בדיקת חיבורים |
| `/api/v1/connect/:provider/start` | GET | התחלת OAuth |
| `/api/v1/connect/:provider/callback` | GET | callback (אוטומטי) |
| `/api/v1/connect/:provider/disconnect` | POST | ניתוק חשבון |
| `/api/media/upload` | POST | העלאת קובץ |
| `/api/publish/all` | POST | פרסום לכל הרשתות |
| `/api/publish/job-status?job_id=X` | GET | בדיקת סטטוס פרסום |
