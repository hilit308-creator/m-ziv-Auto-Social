# 📱 מדריך קליק-קליק — בניית iPhone Shortcuts

## 🔑 פרטים קבועים (תשתמשי בהם בכל שלב)

```
Base URL:  https://m-ziv-auto-social-production.up.railway.app
API Key:   mziv_2026_secret_key_for_mom
Header:    x-api-key
```

---

## 💡 Plan B — איפה Headers?

ב-**Get Contents of URL** באייפון:
1. לחצי על החץ הכחול **▶ Show More** (ליד "Advanced")
2. תראי: **Method**, **Headers**, **Request Body**
3. אם לא רואה — לחצי על **"Add new header"** בתחתית

אם עדיין לא רואה:
- לחצי על המילה **"GET"** או **"POST"** → זה פותח את כל האפשרויות
- לחצי על **Headers** → **Add new header**
- Key: `x-api-key`
- Value: `mziv_2026_secret_key_for_mom`

---

# 📱 SHORTCUT 1 — 🔌 חבר חשבונות

## יצירה

1. פתחי **Shortcuts** באייפון
2. לחצי **+** (פינה ימנית עליונה)
3. לחצי על השם למעלה → שני ל: `🔌 חבר חשבונות`

---

## פעולה 1: Text (Base URL)

4. לחצי **Add Action**
5. חפשי: **Text**
6. בחרי **Text**
7. כתבי בתוך התיבה:
```
https://m-ziv-auto-social-production.up.railway.app
```
8. לחצי על **Text** (השם הכחול מתחת) → **Rename** → כתבי: `base_url`

---

## פעולה 2: Text (API Key)

9. לחצי **+** (בתחתית) → חפשי **Text** → בחרי **Text**
10. כתבי:
```
mziv_2026_secret_key_for_mom
```
11. שני שם ל: `api_key`

---

## פעולה 3: בדיקת סטטוס חיבורים

12. לחצי **+** → חפשי: **Get Contents of URL** → בחרי
13. בשדה URL לחצי → גררי את `base_url` (המשתנה הכחול) → כתבי אחריו:
```
/api/v1/connect/status
```
   כך שה-URL המלא יהיה: `base_url/api/v1/connect/status`

14. לחצי **▶ Show More**
15. **Method**: `GET` (ברירת מחדל, לא צריך לשנות)
16. **Headers** → לחצי **Add new header**:
    - Key: `x-api-key`
    - Value: לחצי → בחרי **api_key** (המשתנה)

---

## פעולה 4: שליפת data

17. לחצי **+** → חפשי: **Get Dictionary Value** → בחרי
18. תראי: "Get `Value` for `Key` in `Dictionary`"
19. לחצי על **Key** → כתבי: `data`
20. לחצי על **Dictionary** → בחרי: **Contents of URL** (התוצאה מפעולה 3)

---

## פעולה 5: שליפת platforms

21. לחצי **+** → **Get Dictionary Value**
22. Key: `platforms`
23. Dictionary: **Dictionary Value** (התוצאה מפעולה 4)
24. שני שם ל: `statuses`

---

## פעולה 6: שליפת summary

25. חזרי לתוצאה של פעולה 4
26. לחצי **+** → **Get Dictionary Value**
27. Key: `summary`
28. Dictionary: (תוצאה של פעולה 4)
29. שני שם ל: `summary`

---

## פעולה 7: הצגת סטטוס

30. לחצי **+** → חפשי: **Show Alert**
31. בשדה ההודעה כתבי:

```
📊 סטטוס חיבורים:

מחוברים: [summary.connected] מתוך [summary.total]
```

> כדי לשלוף `connected` מתוך `summary`:
> - לחצי על המקום בטקסט → לחצי **Insert Variable** → בחרי `summary`
> - לחצי על `summary` שהוספת → בחרי **Get Dictionary Value** → Key: `connected`
> - חזרי על זה עבור `total`

---

## פעולה 8: תפריט חיבור

32. לחצי **+** → חפשי: **Choose from Menu**
33. Prompt: `מה לחבר?`
34. שני את האפשרויות:
    - Option 1: `📸 Instagram + Facebook`
    - Option 2: `🎵 TikTok`
    - Option 3: `▶️ YouTube`
    - Option 4: `✅ סיימתי`

> להוסיף אפשרות: לחצי **+ Add new option**

---

## פעולה 9: תחת "📸 Instagram + Facebook"

### 9a: קבלת auth_url של Instagram

35. (וודאי שאת בתוך הסעיף של "📸 Instagram + Facebook")
36. לחצי **+** → **Get Contents of URL**
37. URL: `base_url` + `/api/v1/connect/instagram/start`
38. **▶ Show More**:
    - Method: **GET**
    - Headers → Add:
      - Key: `x-api-key`
      - Value: `api_key`

### 9b: שליפת auth_url

39. **+** → **Get Dictionary Value** → Key: `data`
40. **+** → **Get Dictionary Value** → Key: `auth_url`
41. שני שם ל: `ig_auth_url`

### 9c: פתיחה בדפדפן

42. **+** → חפשי: **Open URLs**
43. URL: `ig_auth_url`

### 9d: המתנה לאישור

44. **+** → חפשי: **Show Alert**
45. Title: `Instagram`
46. Message: `אישרת בדפדפן? לחצי OK`

### 9e: חזרי על הכל עבור Facebook

47. **+** → **Get Contents of URL**
48. URL: `base_url` + `/api/v1/connect/facebook/start`
49. **▶ Show More**:
    - Method: **GET**
    - Headers: `x-api-key` → `api_key`
50. **+** → **Get Dictionary Value** → Key: `data`
51. **+** → **Get Dictionary Value** → Key: `auth_url`
52. שני שם ל: `fb_auth_url`
53. **+** → **Open URLs** → `fb_auth_url`
54. **+** → **Show Alert** → `אישרת Facebook? לחצי OK`

---

## פעולה 10: תחת "🎵 TikTok"

55. **+** → **Get Contents of URL**
56. URL: `base_url` + `/api/v1/connect/tiktok/start`
57. Headers: `x-api-key` → `api_key`
58. **+** → **Get Dictionary Value** → Key: `data`
59. **+** → **Get Dictionary Value** → Key: `auth_url`
60. **+** → **Open URLs**
61. **+** → **Show Alert** → `אישרת TikTok? לחצי OK`

---

## פעולה 11: תחת "▶️ YouTube"

62. **+** → **Get Contents of URL**
63. URL: `base_url` + `/api/v1/connect/youtube/start`
64. Headers: `x-api-key` → `api_key`
65. **+** → **Get Dictionary Value** → Key: `data`
66. **+** → **Get Dictionary Value** → Key: `auth_url`
67. **+** → **Open URLs**
68. **+** → **Show Alert** → `אישרת YouTube? לחצי OK`

---

## פעולה 12: תחת "✅ סיימתי" — בדיקה סופית

69. **+** → **Get Contents of URL**
70. URL: `base_url` + `/api/v1/connect/status`
71. Headers: `x-api-key` → `api_key`
72. **+** → **Get Dictionary Value** → Key: `data`
73. **+** → **Get Dictionary Value** → Key: `platforms`
74. שני שם ל: `final`

75. **+** → **Show Alert**:
```
✅ סטטוס סופי:

📸 Instagram: [final → instagram → status]
📘 Facebook: [final → facebook_page → status]
🎵 TikTok: [final → tiktok → status]
▶️ YouTube: [final → youtube → status]
```

> לכל רשת:
> - לחצי **Insert Variable** → בחרי `final`
> - לחצי על המשתנה → **Get Dictionary Value** → Key: `instagram`
> - לחצי שוב → **Get Dictionary Value** → Key: `status`

---

## ✅ Shortcut 1 מוכן! שמרי אותו.

---
---

# 📱 SHORTCUT 2 — 🚀 העלי סרטון

## יצירה

1. פתחי **Shortcuts** → **+** → שם: `🚀 העלי סרטון`

---

## פעולה 1: Text (Base URL)

2. **+** → **Text**:
```
https://m-ziv-auto-social-production.up.railway.app
```
3. שני שם ל: `base_url`

---

## פעולה 2: Text (API Key)

4. **+** → **Text**:
```
mziv_2026_secret_key_for_mom
```
5. שני שם ל: `api_key`

---

## פעולה 3: בחירת סרטון

6. **+** → חפשי: **Select Photos**
7. לחצי על **▶ Show More**:
   - **Selection**: לא לסמן "Select Multiple" (רק סרטון אחד)
8. שני שם ל: `selected_video`

---

## פעולה 4: שאלה — על מה הסרטון?

9. **+** → חפשי: **Ask for Input**
10. **Question**: `על מה הסרטון? (תארי בקצרה)`
11. **Input Type**: **Text**
12. שני שם ל: `video_description`

---

## פעולה 5: הודעת התחלה

13. **+** → חפשי: **Show Notification**
14. Title: `⏳ מעלה סרטון...`
15. Body: `זה יכול לקחת כמה שניות`

---

## פעולה 6: העלאת הסרטון ⭐ (חשוב!)

16. **+** → **Get Contents of URL**
17. URL: `base_url` + `/api/media/upload`
18. לחצי **▶ Show More**:
    - **Method**: שני ל-**POST**
    - **Headers** → Add new header:
      - Key: `x-api-key`
      - Value: `api_key`
    - **Request Body**: שני ל-**Form** ⚠️ (לא JSON!)
    - לחצי **Add new field**:
      - Key: `file`
      - Type: שני ל-**File** ⚠️ (לחצי על "Text" ושני ל-"File")
      - Value: לחצי → בחרי `selected_video`

> ⚠️ **חשוב מאוד**: ה-Type חייב להיות **File**, לא Text!
> אם לא רואה אפשרות File — לחצי ארוך על "Text" ליד ה-Key

---

## פעולה 7: שליפת media_id

19. **+** → **Get Dictionary Value**
    - Key: `data`
    - Dictionary: **Contents of URL** (מפעולה 6)

20. **+** → **Get Dictionary Value**
    - Key: `media_id`
    - Dictionary: **Dictionary Value** (מפעולה 19)

21. שני שם ל: `media_id`

### ✅ בשלב הזה יש לך: `media_id` = מזהה הקובץ שהועלה

---

## פעולה 8: פרסום לכל הרשתות ⭐

22. **+** → **Get Contents of URL**
23. URL: `base_url` + `/api/publish/all`
24. **▶ Show More**:
    - **Method**: **POST**
    - **Headers** → Add new header:
      - Key: `x-api-key`
      - Value: `api_key`
    - **Request Body**: שני ל-**JSON** ⚠️ (הפעם JSON, לא Form!)
    - לחצי **Add new field** (3 פעמים):

| Key | Type | Value |
|-----|------|-------|
| `media_id` | **Text** | לחצי → בחרי משתנה `media_id` |
| `video_description` | **Text** | לחצי → בחרי משתנה `video_description` |
| `targets` | **Array** | ראי הסבר למטה 👇 |

### איך להוסיף targets כ-Array:
25. לחצי **Add new field**
26. Key: `targets`
27. Type: לחצי על **Text** → שני ל-**Array**
28. לחצי **Add new item** (4 פעמים):
    - Item 1: `instagram`
    - Item 2: `facebook_page`
    - Item 3: `tiktok`
    - Item 4: `youtube`

> אם אין אפשרות Array — כתבי את ה-JSON ידנית כ-Text:
> שני Request Body ל-**File** ואז הוסיפי פעולת **Text** לפני עם:
> ```json
> {"media_id":"media_id","video_description":"video_description","targets":["instagram","facebook_page","tiktok","youtube"]}
> ```
> (גררי את המשתנים `media_id` ו-`video_description` לתוך הטקסט)

---

## פעולה 9: שליפת job_id

29. **+** → **Get Dictionary Value** → Key: `data`
30. **+** → **Get Dictionary Value** → Key: `job_id`
31. שני שם ל: `job_id`

### ✅ בשלב הזה יש לך: `job_id` = מזהה הפרסום

---

## פעולה 10: Polling — המתנה לתוצאות ⭐

32. **+** → חפשי: **Repeat** → בחרי **Repeat**
33. שני מספר ל: **10** (מקסימום 10 ניסיונות)

### בתוך ה-Repeat:

34. **+** → חפשי: **Wait**
    - Duration: **3** seconds

35. **+** → **Get Contents of URL**
    - URL: `base_url` + `/api/publish/job-status?job_id=` + `job_id`
    
    > איך לבנות את ה-URL:
    > - לחצי בשדה URL
    > - גררי `base_url`
    > - כתבי: `/api/publish/job-status?job_id=`
    > - גררי `job_id`
    
    - **▶ Show More**:
      - Method: **GET**
      - Headers: `x-api-key` → `api_key`

36. **+** → **Get Dictionary Value** → Key: `data`
37. **+** → **Get Dictionary Value** → Key: `status`
38. שני שם ל: `job_status`

39. **+** → חפשי: **If**
    - Input: `job_status`
    - Condition: **is not**
    - Value: `processing`

40. בתוך ה-If (כשהסתיים):
    - **+** → חפשי: **Exit Repeat**

41. סגרי את ה-If: **End If**

42. סגרי את ה-Repeat: **End Repeat**

---

## פעולה 11: קריאה אחרונה לתוצאות

43. **+** → **Get Contents of URL**
    - URL: `base_url` + `/api/publish/job-status?job_id=` + `job_id`
    - Headers: `x-api-key` → `api_key`

44. **+** → **Get Dictionary Value** → Key: `data`
45. **+** → **Get Dictionary Value** → Key: `platforms`
46. שני שם ל: `platforms`

---

## פעולה 12: שליפת סטטוס לכל רשת

### Instagram:
47. **+** → **Get Dictionary Value**
    - Key: `instagram`
    - Dictionary: `platforms`
48. **+** → **Get Dictionary Value** → Key: `status`
49. שני שם ל: `ig_status`
50. **+** → **Get Dictionary Value** (מתוך תוצאה 47)
    - Key: `url`
51. שני שם ל: `ig_url`

### Facebook:
52. **+** → **Get Dictionary Value**
    - Key: `facebook_page`
    - Dictionary: `platforms`
53. **+** → **Get Dictionary Value** → Key: `status`
54. שני שם ל: `fb_status`
55. **+** → **Get Dictionary Value** (מתוך 52) → Key: `url`
56. שני שם ל: `fb_url`

### TikTok:
57. **+** → **Get Dictionary Value**
    - Key: `tiktok`
    - Dictionary: `platforms`
58. **+** → **Get Dictionary Value** → Key: `status`
59. שני שם ל: `tt_status`
60. **+** → **Get Dictionary Value** (מתוך 57) → Key: `url`
61. שני שם ל: `tt_url`

### YouTube:
62. **+** → **Get Dictionary Value**
    - Key: `youtube`
    - Dictionary: `platforms`
63. **+** → **Get Dictionary Value** → Key: `status`
64. שני שם ל: `yt_status`
65. **+** → **Get Dictionary Value** (מתוך 62) → Key: `url`
66. שני שם ל: `yt_url`

---

## פעולה 13: הצגת תוצאות 🎉

67. **+** → **Text**:
```
🎬 הסרטון פורסם!

📸 Instagram: [ig_status]
[ig_url]

📘 Facebook: [fb_status]
[fb_url]

🎵 TikTok: [tt_status]
[tt_url]

▶️ YouTube: [yt_status]
[yt_url]
```

> לכל שורה: לחצי → **Insert Variable** → בחרי את המשתנה המתאים

68. שני שם ל: `result_text`

69. **+** → חפשי: **Show Result**
    - Value: `result_text`

---

## ✅ Shortcut 2 מוכן! שמרי אותו.

---

# 🏠 הוספה למסך הבית

לכל Shortcut:
1. פתחי את ה-Shortcut
2. לחצי **⋯** (שלוש נקודות למעלה)
3. לחצי **Add to Home Screen**
4. בחרי אייקון:
   - Shortcut 1: 🔌 כחול
   - Shortcut 2: 🚀 כתום

---

# 🧪 בדיקה

## Shortcut 1:
1. הריצי → תראי סטטוס חיבורים
2. בחרי רשת → אשרי בדפדפן
3. לחצי "סיימתי" → תראי `connected`

## Shortcut 2:
1. הריצי → בחרי סרטון
2. כתבי תיאור
3. חכי לתוצאות
4. תראי ✅/❌ לכל רשת + לינקים

---

# ⚠️ טיפים חשובים

1. **File, לא Text** — ב-upload, ה-Type של `file` חייב להיות **File**
2. **Form, לא JSON** — ב-upload, ה-Body חייב להיות **Form**
3. **JSON, לא Form** — ב-publish/all, ה-Body חייב להיות **JSON**
4. **Array** — ב-targets, חייב להיות Array (או Text ידני של JSON)
5. **Polling** — ה-Repeat עם Wait 3s מחכה עד שהפרסום מסתיים
6. **Headers** — אם לא רואה, לחצי **▶ Show More** ליד Advanced
