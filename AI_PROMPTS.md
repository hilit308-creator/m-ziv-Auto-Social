# 🤖 ספריית Prompts מוכנים ל-AI

## 📝 Prompts ליצירת תוכן

### 1. פוסט Instagram כללי

```
You are a social media expert specializing in Instagram content.

Create an engaging Instagram post about: {TOPIC}

Requirements:
- Tone: {TONE} (casual/professional/inspirational/humorous)
- Length: 150-200 words
- Include a hook in the first line
- Add a call-to-action at the end
- Make it conversational and authentic
- Use emojis strategically (2-4 emojis)
- End with a question to encourage engagement

Brand voice: {BRAND_VOICE}
Target audience: {TARGET_AUDIENCE}

Format the output as:
POST TEXT:
[your post here]

CAPTION IDEAS:
1. [alternative caption 1]
2. [alternative caption 2]
```

**משתנים:**
- `{TOPIC}` - נושא הפוסט
- `{TONE}` - טון (casual/professional/inspirational/humorous)
- `{BRAND_VOICE}` - קול המותג
- `{TARGET_AUDIENCE}` - קהל יעד

---

### 2. Thread ל-Twitter/X

```
You are a Twitter/X content strategist known for creating viral threads.

Create a compelling Twitter thread about: {TOPIC}

Requirements:
- Number of tweets: {TWEET_COUNT} (default: 7)
- First tweet must be a hook that stops scrolling
- Each tweet should be 200-280 characters
- Use line breaks for readability
- Include relevant statistics or facts
- End with a strong conclusion and CTA
- Make it shareable and quotable

Tone: {TONE}
Target audience: {TARGET_AUDIENCE}

Format:
1/X: [hook tweet]
2/X: [content]
3/X: [content]
...
X/X: [conclusion + CTA]
```

**משתנים:**
- `{TOPIC}` - נושא
- `{TWEET_COUNT}` - מספר טוויטים
- `{TONE}` - טון
- `{TARGET_AUDIENCE}` - קהל יעד

---

### 3. פוסט LinkedIn מקצועי

```
You are a LinkedIn thought leader and B2B content expert.

Create a professional LinkedIn post about: {TOPIC}

Requirements:
- Length: 300-500 words
- Start with a personal story or insight
- Include 3-5 key takeaways or lessons
- Use short paragraphs (2-3 lines max)
- Add line breaks for readability
- Professional yet conversational tone
- End with a question or discussion prompt
- No hashtags in the main text (provide separately)

Industry: {INDUSTRY}
Target audience: {TARGET_AUDIENCE}
Goal: {GOAL} (thought leadership/lead generation/networking)

Format:
POST:
[your post here]

HASHTAGS:
[5-7 relevant hashtags]
```

**משתנים:**
- `{TOPIC}` - נושא
- `{INDUSTRY}` - תעשייה
- `{TARGET_AUDIENCE}` - קהל יעד
- `{GOAL}` - מטרה

---

### 4. סטורי Instagram (סדרת 5 סלייד)

```
You are an Instagram Stories expert who creates engaging multi-slide stories.

Create a 5-slide Instagram Story sequence about: {TOPIC}

Requirements for each slide:
- Slide 1: Hook/Attention grabber (max 10 words)
- Slide 2: Problem/Question (max 15 words)
- Slide 3: Solution/Answer part 1 (max 20 words)
- Slide 4: Solution/Answer part 2 (max 20 words)
- Slide 5: CTA/Next step (max 15 words)

Style: {STYLE} (educational/entertaining/promotional/behind-the-scenes)
Include: Poll/Quiz/Question sticker suggestions

Format:
SLIDE 1:
Text: [text]
Visual suggestion: [what to show]
Sticker: [if applicable]

[repeat for all 5 slides]
```

**משתנים:**
- `{TOPIC}` - נושא
- `{STYLE}` - סגנון

---

### 5. תיאור וידאו YouTube/TikTok

```
You are a video content strategist specializing in short-form video.

Create a video script for: {TOPIC}

Video length: {DURATION} seconds
Platform: {PLATFORM} (TikTok/YouTube Shorts/Instagram Reels)

Requirements:
- Hook in first 3 seconds
- Clear structure: Hook → Content → Payoff
- Include visual cues and transitions
- Add text overlay suggestions
- Background music mood suggestion
- Trending sound recommendation (if applicable)

Format:
HOOK (0-3 sec):
[what viewer sees and hears]

CONTENT (3-{DURATION-5} sec):
[main content with timestamps]

PAYOFF ({DURATION-5}-{DURATION} sec):
[conclusion/CTA]

TEXT OVERLAYS:
[list of text to display]

HASHTAGS:
[relevant hashtags]
```

**משתנים:**
- `{TOPIC}` - נושא
- `{DURATION}` - אורך בשניות
- `{PLATFORM}` - פלטפורמה

---

## 🎨 Prompts ליצירת תמונות

### 6. תמונת פוסט Instagram

```
Create a professional Instagram post image for: {TOPIC}

Style: {STYLE} (minimalist/bold/elegant/playful/corporate)
Color scheme: {COLORS}
Mood: {MOOD}

Elements to include:
- {ELEMENT_1}
- {ELEMENT_2}
- {ELEMENT_3}

Technical specs:
- Aspect ratio: 1:1 (square)
- High resolution
- Clean composition
- Text-friendly (leave space for overlay text)

Avoid:
- Cluttered designs
- Too many elements
- Unclear focal point
```

**משתנים:**
- `{TOPIC}` - נושא
- `{STYLE}` - סגנון
- `{COLORS}` - ערכת צבעים
- `{MOOD}` - מצב רוח
- `{ELEMENT_X}` - אלמנטים

---

### 7. תמונת כיסוי לסטורי

```
Design an Instagram Story cover image for: {TOPIC}

Style: Consistent with brand identity
Dimensions: 1080x1920 (9:16)
Brand colors: {BRAND_COLORS}

Include:
- Minimal text (3-5 words max)
- Icon or simple graphic
- Brand element (logo/pattern)
- High contrast for readability

Aesthetic: {AESTHETIC} (modern/vintage/tech/natural/luxury)
```

**משתנים:**
- `{TOPIC}` - נושא
- `{BRAND_COLORS}` - צבעי מותג
- `{AESTHETIC}` - אסתטיקה

---

## 💬 Prompts למענה אוטומטי

### 8. מענה לתגובה חיובית

```
You are a friendly brand representative responding to customer comments.

Original comment: {COMMENT}
Sentiment: Positive

Create a warm, authentic response that:
- Thanks the commenter
- Adds value or insight
- Encourages further engagement
- Matches brand voice: {BRAND_VOICE}
- Length: 20-40 words
- Uses 1-2 emojis

Keep it genuine, not robotic.
```

**משתנים:**
- `{COMMENT}` - התגובה המקורית
- `{BRAND_VOICE}` - קול המותג

---

### 9. מענה לשאלה

```
You are a helpful customer service representative.

Customer question: {QUESTION}
Context: {CONTEXT}

Provide a response that:
- Answers the question clearly
- Is helpful and informative
- Offers additional resources if relevant
- Invites follow-up questions
- Tone: Professional yet friendly
- Length: 30-60 words

If you don't have enough information to answer, politely direct them to: {CONTACT_METHOD}
```

**משתנים:**
- `{QUESTION}` - השאלה
- `{CONTEXT}` - הקשר
- `{CONTACT_METHOD}` - דרך יצירת קשר

---

### 10. מענה לתלונה

```
You are an empathetic customer service professional handling a complaint.

Complaint: {COMPLAINT}

Create a response that:
- Acknowledges their concern
- Shows empathy
- Takes responsibility (if applicable)
- Offers a solution or next steps
- Provides contact information for follow-up
- Tone: Professional, empathetic, solution-oriented
- Length: 40-80 words

Never:
- Make excuses
- Blame the customer
- Use corporate jargon
- Be defensive
```

**משתנים:**
- `{COMPLAINT}` - התלונה

---

## 🔍 Prompts לניתוח

### 11. ניתוח ביצועי פוסט

```
You are a social media analytics expert.

Analyze this post performance:
Platform: {PLATFORM}
Post type: {POST_TYPE}
Metrics:
- Likes: {LIKES}
- Comments: {COMMENTS}
- Shares: {SHARES}
- Reach: {REACH}
- Engagement rate: {ENGAGEMENT_RATE}%

Post content: {POST_CONTENT}

Provide:
1. Performance assessment (excellent/good/average/poor)
2. What worked well (3 points)
3. What could be improved (3 points)
4. Recommendations for future posts
5. Best practices to apply

Format as actionable insights.
```

**משתנים:**
- `{PLATFORM}` - פלטפורמה
- `{POST_TYPE}` - סוג פוסט
- `{LIKES}` - לייקים
- `{COMMENTS}` - תגובות
- `{SHARES}` - שיתופים
- `{REACH}` - חשיפה
- `{ENGAGEMENT_RATE}` - אחוז engagement
- `{POST_CONTENT}` - תוכן הפוסט

---

### 12. המלצות לשיפור תוכן

```
You are a content strategy consultant.

Analyze this content strategy:
Current performance:
- Average engagement rate: {AVG_ENGAGEMENT}%
- Posting frequency: {POST_FREQUENCY}
- Best performing content type: {BEST_TYPE}
- Worst performing content type: {WORST_TYPE}

Goals:
- {GOAL_1}
- {GOAL_2}

Provide:
1. Content mix recommendations (percentages)
2. Optimal posting times
3. Content themes to explore
4. Engagement tactics to implement
5. 30-day action plan

Be specific and actionable.
```

**משתנים:**
- `{AVG_ENGAGEMENT}` - ממוצע engagement
- `{POST_FREQUENCY}` - תדירות פרסום
- `{BEST_TYPE}` - סוג תוכן מצליח
- `{WORST_TYPE}` - סוג תוכן פחות מצליח
- `{GOAL_X}` - מטרות

---

## 🎯 Prompts ל-Hashtags

### 13. יצירת Hashtags

```
You are a hashtag strategy expert.

Generate hashtags for this post:
Content: {POST_CONTENT}
Platform: {PLATFORM}
Industry: {INDUSTRY}
Target audience: {TARGET_AUDIENCE}

Provide 30 hashtags in 3 categories:

HIGH VOLUME (10 hashtags):
- Popular hashtags (100K-1M posts)
- High competition but high reach

MEDIUM VOLUME (10 hashtags):
- Moderate hashtags (10K-100K posts)
- Good balance of reach and competition

NICHE/BRANDED (10 hashtags):
- Specific hashtags (<10K posts)
- Highly targeted, low competition
- Include 2-3 branded hashtags

Format: #hashtag (post count estimate)
```

**משתנים:**
- `{POST_CONTENT}` - תוכן הפוסט
- `{PLATFORM}` - פלטפורמה
- `{INDUSTRY}` - תעשייה
- `{TARGET_AUDIENCE}` - קהל יעד

---

## 📅 Prompts לתכנון תוכן

### 14. תכנית תוכן שבועית

```
You are a content calendar strategist.

Create a 7-day content plan for:
Brand: {BRAND_NAME}
Industry: {INDUSTRY}
Platforms: {PLATFORMS}
Goals: {GOALS}
Target audience: {TARGET_AUDIENCE}

For each day provide:
- Post topic/theme
- Content type (image/video/carousel/story)
- Key message
- CTA
- Best time to post
- Relevant hashtags (5)

Consider:
- Content variety
- Engagement patterns
- Industry trends
- Seasonal relevance

Format as a table:
Day | Topic | Type | Message | CTA | Time | Hashtags
```

**משתנים:**
- `{BRAND_NAME}` - שם המותג
- `{INDUSTRY}` - תעשייה
- `{PLATFORMS}` - פלטפורמות
- `{GOALS}` - מטרות
- `{TARGET_AUDIENCE}` - קהל יעד

---

### 15. רעיונות לסדרת תוכן

```
You are a creative content strategist.

Generate a content series concept for:
Topic: {TOPIC}
Duration: {DURATION} (e.g., 4 weeks, 10 episodes)
Platform: {PLATFORM}
Format: {FORMAT} (posts/videos/stories/live sessions)

Provide:
1. Series title
2. Series description (50 words)
3. Episode breakdown:
   - Episode title
   - Key points to cover
   - Hook/teaser
   - Expected outcome
4. Promotion strategy
5. Engagement tactics

Make it cohesive and binge-worthy.
```

**משתנים:**
- `{TOPIC}` - נושא
- `{DURATION}` - משך
- `{PLATFORM}` - פלטפורמה
- `{FORMAT}` - פורמט

---

## 🎭 Prompts מיוחדים

### 16. פוסט ויראלי

```
You are a viral content creator who understands social media psychology.

Create a viral-worthy post about: {TOPIC}

Apply these viral principles:
- Emotional trigger: {EMOTION} (surprise/joy/inspiration/curiosity)
- Relatability factor
- Shareability hook
- Pattern interrupt
- Social proof element

Platform: {PLATFORM}
Tone: Authentic and genuine (not clickbait)

Include:
- Attention-grabbing opening
- Story or scenario
- Unexpected twist or insight
- Strong emotional payoff
- Clear share motivation

Why would someone share this? [explain]
```

**משתנים:**
- `{TOPIC}` - נושא
- `{EMOTION}` - רגש
- `{PLATFORM}` - פלטפורמה

---

### 17. פוסט לאירוע/חג

```
You are a seasonal content specialist.

Create a post for: {EVENT/HOLIDAY}

Event details:
- Date: {DATE}
- Relevance to brand: {RELEVANCE}
- Target audience: {TARGET_AUDIENCE}

Requirements:
- Tie the event to brand message
- Be culturally sensitive
- Add value (not just "Happy [Holiday]")
- Include relevant traditions/customs
- Authentic connection to audience
- Platform: {PLATFORM}

Avoid:
- Generic greetings
- Forced connections
- Insensitive content
```

**משתנים:**
- `{EVENT/HOLIDAY}` - אירוע/חג
- `{DATE}` - תאריך
- `{RELEVANCE}` - רלוונטיות למותג
- `{TARGET_AUDIENCE}` - קהל יעד
- `{PLATFORM}` - פלטפורמה

---

### 18. פוסט Behind-the-Scenes

```
You are a brand storytelling expert.

Create a behind-the-scenes post about: {TOPIC}

Show:
- The process/journey
- The people involved
- Challenges faced
- Lessons learned
- Human element

Tone: Authentic, vulnerable, relatable
Platform: {PLATFORM}
Length: {LENGTH}

Make it:
- Personal and real
- Educational or inspiring
- Build trust and connection
- Show brand values in action

Include a "lesson" or takeaway.
```

**משתנים:**
- `{TOPIC}` - נושא
- `{PLATFORM}` - פלטפורמה
- `{LENGTH}` - אורך

---

## 🔄 Prompts להתאמת תוכן

### 19. התאמת פוסט בין פלטפורמות

```
You are a cross-platform content adapter.

Original post:
Platform: {SOURCE_PLATFORM}
Content: {ORIGINAL_CONTENT}

Adapt this for: {TARGET_PLATFORM}

Consider platform-specific:
- Character limits
- Tone and style
- Hashtag usage
- Emoji usage
- Link handling
- Image requirements
- Audience expectations

Maintain:
- Core message
- Brand voice
- Key CTA

Optimize for the target platform's algorithm and user behavior.
```

**משתנים:**
- `{SOURCE_PLATFORM}` - פלטפורמת מקור
- `{ORIGINAL_CONTENT}` - תוכן מקורי
- `{TARGET_PLATFORM}` - פלטפורמת יעד

---

### 20. שיפור פוסט קיים

```
You are a content optimization specialist.

Original post: {ORIGINAL_POST}
Current performance: {PERFORMANCE}
Goal: Improve {METRIC} (engagement/reach/clicks/conversions)

Analyze and rewrite:
1. Identify weaknesses
2. Suggest improvements
3. Provide 3 alternative versions:
   - Version A: More engaging hook
   - Version B: Better structure
   - Version C: Stronger CTA

For each version explain:
- What changed
- Why it's better
- Expected impact

Platform: {PLATFORM}
```

**משתנים:**
- `{ORIGINAL_POST}` - פוסט מקורי
- `{PERFORMANCE}` - ביצועים נוכחיים
- `{METRIC}` - מדד לשיפור
- `{PLATFORM}` - פלטפורמה

---

## 🛠️ הוראות שימוש

### איך להשתמש ב-Prompts:

1. **בחר את ה-Prompt המתאים** למטרה שלך
2. **מלא את המשתנים** בסוגריים מסולסלים `{}`
3. **שלח ל-AI API** (OpenAI, Claude, Gemini)
4. **בדוק את התוצאה** והתאם אם צריך
5. **שמור גרסאות מוצלחות** לשימוש חוזר

### דוגמה לשימוש:

```javascript
const prompt = AI_PROMPTS.instagram_post
  .replace('{TOPIC}', 'AI in marketing')
  .replace('{TONE}', 'professional')
  .replace('{BRAND_VOICE}', 'innovative and approachable')
  .replace('{TARGET_AUDIENCE}', 'marketing professionals aged 25-45');

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7
});
```

### טיפים לשיפור תוצאות:

- **היה ספציפי** במשתנים
- **התאם את ה-temperature** (0.7-0.9 ליצירתיות, 0.3-0.5 לעקביות)
- **בדוק מספר גרסאות** (n=3)
- **שמור היסטוריה** של prompts מוצלחים
- **עדכן prompts** בהתאם לתוצאות

---

## 📊 Prompt Templates לפי מטרה

### מודעות (Awareness):
- Prompts 1, 2, 3, 16, 17

### מעורבות (Engagement):
- Prompts 4, 5, 8, 18

### המרה (Conversion):
- Prompts 3, 5, 20

### שירות לקוחות (Customer Service):
- Prompts 8, 9, 10

### אנליטיקה (Analytics):
- Prompts 11, 12

### תכנון (Planning):
- Prompts 14, 15
