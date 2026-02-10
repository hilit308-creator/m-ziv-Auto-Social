# 🎯 M-Ziv AI Social - API Documentation

**Personal tool for Mom - Business Consulting Content Generation**

## 🌐 Base URL

```
http://localhost:3000/api/v1
```

## 🔐 Authentication

All M-Ziv endpoints require API key authentication:

```
Authorization: Bearer mziv_2026_secret_key_for_mom
```

---

## 📡 API Endpoints

### 1️⃣ Generate Caption (קפצ׳ן)

**Endpoint:** `POST /api/v1/generate/caption`

**Description:** יצירת כתובית מקצועית לסרטון עם hook, CTA והתאמה לפלטפורמה

**Request:**
```json
{
  "brand": {
    "name": "M-Ziv",
    "business_type": "Business consulting",
    "tone": "Professional but warm, empowering, clear Hebrew",
    "language": "he-IL",
    "default_cta": "שלחי לי הודעה ואעזור לך לדייק את הצעד הבא בעסק"
  },
  "content": {
    "video_description": "סרטון על איך לבנות אסטרטגיה עסקית ב-3 שלבים",
    "voice_notes": "דיברתי על חשיבות התכנון, הצבת יעדים ברורים, ומדידת תוצאות",
    "key_points": ["תכנון אסטרטגי", "יעדים מדידים", "מעקב ביצועים"],
    "offer_or_service": "ייעוץ אסטרטגי לעסקים קטנים ובינוניים",
    "target_audience": "Israeli small & medium business owners"
  },
  "platform": "instagram",
  "constraints": {
    "max_words": 120,
    "include_hook": true,
    "include_cta": true,
    "avoid": ["overly salesy", "too many emojis", "English slang"],
    "emoji_level": "low"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "caption": "רוצים לבנות אסטרטגיה עסקית שבאמת עובדת? 🎯\n\nהנה 3 שלבים שכל בעל עסק חייב לדעת:\n\n1. תכנון אסטרטגי - לדעת לאן אתם הולכים\n2. יעדים מדידים - לא רק חלומות, אלא מספרים ברורים\n3. מעקב ביצועים - לוודא שאתם בכיוון הנכון\n\nהאסטרטגיה שלכם היא המפה שלכם להצלחה.\n\nשלחי לי הודעה ואעזור לך לדייק את הצעד הבא בעסק 💼",
    "hook": "רוצים לבנות אסטרטגיה עסקית שבאמת עובדת? 🎯",
    "cta": "שלחי לי הודעה ואעזור לך לדייק את הצעד הבא בעסק 💼",
    "style_used": "professional_warm",
    "confidence": 0.85,
    "alternatives": [
      {
        "caption": "אסטרטגיה עסקית ב-3 שלבים פשוטים...",
        "hook": "למה רוב העסקים נכשלים? כי אין להם אסטרטגיה ברורה.",
        "cta": "בואו נבנה ביחד את האסטרטגיה שלכם"
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/generate/caption \
  -H "Authorization: Bearer mziv_2026_secret_key_for_mom" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": {
      "name": "M-Ziv",
      "business_type": "Business consulting",
      "tone": "Professional but warm",
      "language": "he-IL"
    },
    "content": {
      "video_description": "סרטון על בניית אסטרטגיה עסקית",
      "target_audience": "Israeli small & medium business owners"
    },
    "platform": "instagram",
    "constraints": {
      "max_words": 120,
      "include_hook": true,
      "include_cta": true,
      "emoji_level": "low"
    }
  }'
```

---

### 2️⃣ Generate Hashtags (האשטגים)

**Endpoint:** `POST /api/v1/generate/hashtags`

**Description:** יצירת hashtags רלוונטיים עם חלוקה לקטגוריות

**Request:**
```json
{
  "caption": "רוצים לבנות אסטרטגיה עסקית שבאמת עובדת? הנה 3 שלבים...",
  "platform": "instagram",
  "language": "he-IL",
  "business_context": {
    "business_type": "Business consulting",
    "audience": "Israeli small & medium business owners"
  },
  "constraints": {
    "count": 12,
    "mix": {
      "broad": 4,
      "niche": 6,
      "branded": 2
    },
    "include_branded": ["#MZiv", "#מזיו"],
    "avoid": ["irrelevant", "spammy"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hashtags": [
      "#עסקים",
      "#יזמות",
      "#אסטרטגיה",
      "#ייעוץעסקי",
      "#עסקיםקטנים",
      "#הצלחהעסקית",
      "#ניהולעסקי",
      "#תכנוןאסטרטגי",
      "#MZiv",
      "#מזיו",
      "#businessconsulting",
      "#strategy"
    ],
    "branded_hashtags": ["#MZiv", "#מזיו"],
    "notes": "שילוב של האשטגים פופולריים בעברית ואנגלית, ממוקדים לתחום הייעוץ העסקי",
    "hashtags_string": "#עסקים #יזמות #אסטרטגיה #ייעוץעסקי #עסקיםקטנים #הצלחהעסקית #ניהולעסקי #תכנוןאסטרטגי #MZiv #מזיו #businessconsulting #strategy"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/generate/hashtags \
  -H "Authorization: Bearer mziv_2026_secret_key_for_mom" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "רוצים לבנות אסטרטגיה עסקית?",
    "platform": "instagram",
    "language": "he-IL",
    "business_context": {
      "business_type": "Business consulting",
      "audience": "Israeli small & medium business owners"
    },
    "constraints": {
      "count": 12,
      "mix": {"broad": 4, "niche": 6, "branded": 2},
      "include_branded": ["#MZiv", "#מזיו"]
    }
  }'
```

---

### 3️⃣ Generate Title (כותרת)

**Endpoint:** `POST /api/v1/generate/title`

**Description:** יצירת כותרת ליוטיוב או לינקדאין

**Request:**
```json
{
  "video_description": "סרטון על 3 שלבים לבניית אסטרטגיה עסקית מנצחת",
  "caption": "רוצים לבנות אסטרטגיה עסקית שבאמת עובדת?...",
  "platform": "youtube",
  "constraints": {
    "max_chars": 60,
    "style": "clear, curiosity, business consulting"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "3 שלבים לאסטרטגיה עסקית מנצחת | M-Ziv",
    "alternatives": [
      "איך לבנות אסטרטגיה עסקית ב-3 שלבים פשוטים",
      "האסטרטגיה שתשנה את העסק שלכם | מדריך מלא"
    ]
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/generate/title \
  -H "Authorization: Bearer mziv_2026_secret_key_for_mom" \
  -H "Content-Type: application/json" \
  -d '{
    "video_description": "סרטון על בניית אסטרטגיה עסקית",
    "caption": "רוצים לבנות אסטרטגיה?",
    "platform": "youtube",
    "constraints": {
      "max_chars": 60,
      "style": "clear, curiosity, business consulting"
    }
  }'
```

---

### 4️⃣ Generate Post Pack (הכל בבת אחת) ⭐ RECOMMENDED

**Endpoint:** `POST /api/v1/generate/post-pack`

**Description:** יצירת תוכן מלא לכל הפלטפורמות בבקשה אחת - מושלם לשורטקאסט!

**Request:**
```json
{
  "video_description": "סרטון על 3 שלבים לבניית אסטרטגיה עסקית: תכנון, יעדים מדידים, ומעקב ביצועים",
  "voice_notes": "דיברתי על חשיבות התכנון המוקדם והצבת יעדים ברורים",
  "platforms": ["instagram", "tiktok", "facebook", "linkedin", "youtube"],
  "brand_profile": {
    "name": "M-Ziv",
    "business_type": "Business consulting",
    "tone": "Professional but warm, empowering, clear Hebrew",
    "language": "he-IL",
    "default_cta": "שלחי לי הודעה ואעזור לך לדייק את הצעד הבא בעסק"
  },
  "constraints": {
    "emoji_level": "low",
    "length_by_platform": {
      "instagram": 120,
      "tiktok": 80,
      "facebook": 120,
      "linkedin": 90,
      "youtube": 90
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "by_platform": {
      "instagram": {
        "hook": "רוצים לבנות אסטרטגיה עסקית שבאמת עובדת? 🎯",
        "caption": "רוצים לבנות אסטרטגיה עסקית שבאמת עובדת? 🎯\n\nהנה 3 שלבים שכל בעל עסק חייב לדעת:\n\n1. תכנון אסטרטגי\n2. יעדים מדידים\n3. מעקב ביצועים\n\nשלחי לי הודעה ואעזור לך לדייק את הצעד הבא בעסק 💼",
        "cta": "שלחי לי הודעה ואעזור לך לדייק את הצעד הבא בעסק 💼",
        "hashtags": ["#עסקים", "#יזמות", "#אסטרטגיה", "#ייעוץעסקי", "#MZiv", "#מזיו"]
      },
      "tiktok": {
        "hook": "3 שלבים לאסטרטגיה מנצחת 🎯",
        "caption": "3 שלבים לאסטרטגיה מנצחת 🎯\n\n1. תכנון\n2. יעדים ברורים\n3. מעקב\n\nשלחי הודעה לעזרה 💼",
        "cta": "שלחי הודעה לעזרה 💼",
        "hashtags": ["#עסקים", "#יזמות", "#טיפיםעסקיים", "#MZiv"]
      },
      "linkedin": {
        "hook": "איך לבנות אסטרטגיה עסקית אפקטיבית?",
        "caption": "איך לבנות אסטרטגיה עסקית אפקטיבית?\n\n3 עקרונות מנחים:\n• תכנון אסטרטגי מוקדם\n• הצבת יעדים מדידים\n• מעקב שוטף אחר ביצועים\n\nשלחו הודעה לייעוץ מקצועי",
        "cta": "שלחו הודעה לייעוץ מקצועי",
        "hashtags": ["#BusinessStrategy", "#Consulting", "#MZiv", "#עסקים", "#אסטרטגיה"]
      },
      "youtube": {
        "title": "3 שלבים לאסטרטגיה עסקית מנצחת | M-Ziv",
        "description": "למדו איך לבנות אסטרטגיה עסקית אפקטיבית ב-3 שלבים פשוטים: תכנון, יעדים מדידים, ומעקב ביצועים.",
        "hashtags": ["#עסקים", "#אסטרטגיה", "#ייעוץעסקי", "#MZiv"]
      }
    },
    "meta": {
      "topic": "Business Strategy",
      "content_type": "educational",
      "best_platform_suggestion": "instagram",
      "publish_time_suggestion": "Morning (8-10 AM) or Evening (6-8 PM)"
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/generate/post-pack \
  -H "Authorization: Bearer mziv_2026_secret_key_for_mom" \
  -H "Content-Type: application/json" \
  -d '{
    "video_description": "סרטון על בניית אסטרטגיה עסקית",
    "platforms": ["instagram", "linkedin", "youtube"],
    "brand_profile": {
      "name": "M-Ziv",
      "business_type": "Business consulting",
      "tone": "Professional but warm",
      "language": "he-IL"
    },
    "constraints": {
      "emoji_level": "low",
      "length_by_platform": {
        "instagram": 120,
        "linkedin": 90,
        "youtube": 90
      }
    }
  }'
```

---

### 5️⃣ Rewrite Text (עריכה מהירה)

**Endpoint:** `POST /api/v1/rewrite`

**Description:** עריכה מהירה של טקסט לפי פקודה

**Request:**
```json
{
  "text": "אסטרטגיה עסקית היא דבר חשוב מאוד לכל עסק. צריך לתכנן ולהגדיר יעדים.",
  "command": "more_professional",
  "platform": "linkedin",
  "language": "he-IL"
}
```

**Available Commands:**
- `shorter` - קצר יותר
- `more_professional` - מקצועי יותר
- `more_warm` - חם ואישי יותר
- `more_salesy` - שיווקי יותר
- `add_cta` - הוסף קריאה לפעולה
- `remove_emojis` - הסר אימוג'ים
- `add_emojis_low` - הוסף 1-2 אימוג'ים
- `make_linkedin_style` - התאם ללינקדאין

**Response:**
```json
{
  "success": true,
  "data": {
    "rewritten_text": "אסטרטגיה עסקית מהווה תשתית קריטית להצלחת כל ארגון. תכנון אסטרטגי והגדרת יעדים מדידים הם אבני היסוד לצמיחה עסקית בת-קיימא.",
    "diff_summary": "הטקסט הפך למקצועי יותר עם שימוש במינוחים עסקיים מדויקים"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/rewrite \
  -H "Authorization: Bearer mziv_2026_secret_key_for_mom" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "אסטרטגיה חשובה לעסק",
    "command": "more_professional",
    "platform": "linkedin",
    "language": "he-IL"
  }'
```

---

## 📱 iPhone Shortcut Integration

### Setup Instructions:

1. **Get API Key:** `mziv_2026_secret_key_for_mom`

2. **Base URL:** `http://localhost:3000/api/v1` (or your deployed URL)

3. **Recommended Endpoint:** `/generate/post-pack` (all-in-one)

### Shortcut Flow Example:

```
1. Ask for Input → "תאר את הסרטון"
2. Get Contents of URL
   - URL: http://localhost:3000/api/v1/generate/post-pack
   - Method: POST
   - Headers:
     * Authorization: Bearer mziv_2026_secret_key_for_mom
     * Content-Type: application/json
   - Body: {
       "video_description": [Input],
       "platforms": ["instagram", "linkedin"],
       "brand_profile": {...}
     }
3. Get Dictionary Value → "by_platform.instagram.caption"
4. Copy to Clipboard
5. Show Result
```

---

## 🎨 Brand Guidelines

**Colors:**
- Primary: `#F38B1F` (Orange)
- Dark Text: `#2B2B2B`
- Background: `#F7F7F7`
- White: `#FFFFFF`

**Tone:**
- Hebrew language
- Professional but warm
- Empowering and clear
- Minimal emojis (1-2 max)
- Business consulting authority

---

## ⚠️ Error Responses

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Errors:**
- `401` - Invalid or missing API key
- `400` - Bad request (missing required fields)
- `429` - OpenAI quota exceeded
- `500` - Server error

---

## 🚀 Quick Test

```bash
# Test authentication
curl http://localhost:3000/api/v1/generate/caption \
  -H "Authorization: Bearer mziv_2026_secret_key_for_mom"

# Should return 400 (missing body) but proves auth works
```

---

**Built with ❤️ for Mom's M-Ziv Business Consulting**
