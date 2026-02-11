# M-Ziv AI Personal Assistant API Documentation

## 🎯 מטרה

שכבת העוזרת האישית של M-Ziv AI Social מספקת ממשק API להפיכת המערכת מכלי ליצירת תוכן לעוזרת AI אישית.

---

## 🔐 Authentication

כל הבקשות דורשות API Key בכותרת:

```
Authorization: Bearer YOUR_API_KEY
```

וכן זיהוי משתמש:

```
X-User-Id: USER_ID
```

---

## ⭐ Component 1: Energy Mode

### GET /api/assistant/energy-profile

קבלת פרופיל האנרגיה של המשתמש.

**Response:**
```json
{
  "success": true,
  "data": {
    "activeDays": [0, 1, 2, 3, 4],
    "preferredStartHour": 9,
    "preferredEndHour": 17,
    "peakCreativityHours": [10, 11, 15, 16],
    "preferBatchCreation": true,
    "batchSize": 3,
    "audienceActiveHours": [8, 12, 18, 20]
  }
}
```

### PATCH /api/assistant/energy-profile

עדכון פרופיל האנרגיה.

**Request Body:**
```json
{
  "activeDays": [0, 1, 2, 3, 4],
  "preferredStartHour": 10,
  "preferredEndHour": 18,
  "batchSize": 5
}
```

### POST /api/assistant/batch-suggest

קבלת הצעה ליצירת תוכן בכמות.

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestedCount": 3,
    "message": "זה הזמן המושלם ליצירה! בואי נצלם 3 סרטונים ברצף 🎬",
    "optimalTimeSlot": "10:00 - 16:00",
    "ideas": [
      {
        "topic": "טיפ לניהול זמן",
        "contentType": "reel",
        "estimatedMinutes": 15
      }
    ]
  }
}
```

---

## ⭐ Component 2: Voice First Creation

### POST /api/assistant/voice-post

יצירת פוסט מתמליל קולי.

**Request Body:**
```json
{
  "transcript": "היום צילמתי סרטון על איך לנהל את הזמן בעסק קטן",
  "audioUrl": "https://...", 
  "platforms": ["instagram", "facebook", "tiktok"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "postPack": {
      "by_platform": {
        "instagram": {
          "caption": "...",
          "hashtags": ["#..."]
        }
      }
    },
    "transcript": "...",
    "processedIdea": "..."
  }
}
```

---

## ⭐ Component 3: Idea Capture Library

### POST /api/assistant/ideas/capture

שמירת רעיון חדש.

**Request Body:**
```json
{
  "inputType": "text",
  "content": "רעיון לסרטון על ניהול עובדים",
  "tags": ["management", "employees"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "rawContent": "רעיון לסרטון על ניהול עובדים",
    "processedContent": "...",
    "suggestedPostType": "reel",
    "suggestedHook": "3 טעויות שכל מנהל חדש עושה",
    "suggestedPlatforms": ["instagram", "linkedin"],
    "suggestedPublishTime": "morning"
  }
}
```

### GET /api/assistant/ideas

קבלת כל הרעיונות השמורים.

**Query Parameters:**
- `status` (optional): captured, processing, ready, converted

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "rawContent": "...",
      "suggestedPostType": "reel",
      "suggestedHook": "..."
    }
  ]
}
```

### POST /api/assistant/ideas/convert-to-post

המרת רעיון לפוסט.

**Request Body:**
```json
{
  "ideaId": "clx...",
  "platforms": ["instagram", "tiktok"]
}
```

---

## ⭐ Component 4: Smart Content Recycling

### GET /api/assistant/recycling-suggestions

קבלת הצעות למיחזור תוכן.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "postId": "clx...",
      "suggestionType": "refresh",
      "targetPlatform": "linkedin",
      "reason": "הפוסט פורסם לפני יותר מחודש",
      "suggestedChanges": "רענון עם זווית עדכנית",
      "originalCaption": "..."
    }
  ]
}
```

### POST /api/assistant/recycle-post

מיחזור פוסט קיים.

**Request Body:**
```json
{
  "postId": "clx...",
  "suggestionType": "refresh",
  "targetPlatform": "linkedin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recycled_caption": "...",
    "hook": "...",
    "changes_made": "..."
  }
}
```

---

## ⭐ Component 5: Personal Learning Engine

### GET /api/assistant/style-profile

קבלת פרופיל הסגנון של המשתמש.

**Response:**
```json
{
  "success": true,
  "data": {
    "tonePreference": "warm_professional",
    "emojiUsage": "low",
    "signaturePhrases": ["בואו נדבר על זה", "הטיפ שלי"],
    "avoidWords": [],
    "preferredCTAs": ["שתפו בתגובות"],
    "platformPreferences": {},
    "voiceModelStatus": "untrained"
  }
}
```

### PATCH /api/assistant/style-profile

עדכון פרופיל הסגנון.

**Request Body:**
```json
{
  "tonePreference": "casual",
  "emojiUsage": "medium",
  "avoidWords": ["בחינם", "הנחה"]
}
```

### POST /api/assistant/feedback

שליחת משוב ללמידה.

**Request Body:**
```json
{
  "postId": "clx...",
  "contentType": "caption",
  "originalContent": "טקסט מקורי שנוצר",
  "editedContent": "טקסט ערוך על ידי המשתמש",
  "feedbackType": "edit"
}
```

---

## ⭐ Component 7: Burnout Protection

### GET /api/assistant/burnout-status

בדיקת מצב שחיקה.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "את בקצב נהדר! המשיכי ככה 💪",
    "suggestions": ["נראה שמצאת את האיזון המושלם"],
    "stats": {
      "postsThisWeek": 5,
      "averagePostsPerWeek": 4,
      "lastActiveDate": "2026-02-11T10:00:00Z",
      "consecutiveActiveDays": 3
    }
  }
}
```

---

## ⭐ Component 8: Daily Idea Generator

### GET /api/assistant/daily-idea

קבלת רעיון יומי לצילום.

**Response:**
```json
{
  "success": true,
  "data": {
    "filmingIdea": "צלמי סרטון קצר על 3 טעויות נפוצות בניהול זמן",
    "contentType": "reel",
    "suggestedHook": "הטעות הזו עולה לכם כסף כל יום",
    "occasion": "evergreen",
    "difficulty": "easy",
    "estimatedTime": 15,
    "tips": ["השתמשי בתאורה טבעית", "דברי לעניין"]
  }
}
```

---

## ⭐ Component 9: Comment & Message Reply AI

### POST /api/assistant/reply-suggest

יצירת הצעת תגובה.

**Request Body:**
```json
{
  "comment": "וואו איזה תוכן מעולה! איך אפשר לקבל ייעוץ?",
  "platform": "instagram",
  "context": "פוסט על ייעוץ עסקי"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "תודה רבה! 🙏 שמחה שאהבת. שלחי לי הודעה פרטית ונקבע שיחה",
    "tone": "warm",
    "alternatives": [
      "איזה כיף לשמוע! בואי נדבר בפרטי",
      "שמחה מאוד! כתבי לי ונתאם"
    ]
  }
}
```

---

## ⭐ Component 10: Personal Voice Cloning

### POST /api/assistant/train-voice

אימון מודל סגנון כתיבה אישי.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "message": "המודל אומן בהצלחה! עכשיו התוכן שייווצר יהיה יותר \"את\" 🎉"
  }
}
```

---

## ⭐ Mom Mode UI

### GET /api/assistant/mom-mode

קבלת כל הנתונים למסך הפשוט.

**Response:**
```json
{
  "success": true,
  "data": {
    "dailyIdea": {
      "filmingIdea": "...",
      "contentType": "reel",
      "suggestedHook": "...",
      "difficulty": "easy",
      "estimatedTime": 15,
      "tips": []
    },
    "pendingIdeas": 5,
    "burnoutStatus": {
      "status": "healthy",
      "message": "את בקצב נהדר!",
      "suggestions": []
    },
    "quickActions": ["ספרי על הסרטון", "שמרי רעיון"]
  }
}
```

---

## 🔒 Privacy & Data Management

### DELETE /api/assistant/user-data

מחיקת כל נתוני המשתמש (GDPR).

**Response:**
```json
{
  "success": true,
  "message": "כל הנתונים נמחקו בהצלחה"
}
```

### PATCH /api/assistant/privacy-consent

עדכון הסכמת פרטיות.

**Request Body:**
```json
{
  "voiceDataConsent": true,
  "dataRetentionDays": 365
}
```

---

## 📊 Success Metrics

המערכת עוקבת אחר:

- ✔ ירידה בזמן יצירת פוסט
- ✔ ירידה בכמות עריכות ידניות
- ✔ שימוש שבועי קבוע
- ✔ עלייה במספר פוסטים

---

## 🛣️ Roadmap

### Phase 1 ✅
- Voice First Creation
- Idea Capture Library
- Mom Mode UI

### Phase 2 ✅
- Personal Learning Engine
- Smart Content Recycling
- Daily Idea Generator

### Phase 3 ✅
- Energy Mode
- Burnout Protection
- Comment & Message Reply AI
- Personal Voice Cloning
