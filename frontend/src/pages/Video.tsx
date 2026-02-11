import { useState } from 'react';
import { Video, Play, Download, RefreshCw, Sparkles } from 'lucide-react';
import { videoApi } from '../services/api';

interface VideoResult {
  id: string;
  url: string;
  thumbnail_url: string;
  status: string;
}

export default function VideoPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    setResult(null);

    try {
      const response = await videoApi.generate({
        prompt,
        duration,
        aspect_ratio: aspectRatio,
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        alert(response.data.error || 'Failed to generate video');
      }
    } catch (error: any) {
      console.error('Error generating video:', error);
      alert(error.response?.data?.error || 'Failed to connect to API');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">יצירת וידאו</h1>
      <p className="text-gray-500 mb-8">צור וידאו קצר עם AI לסטוריז, Reels ו-TikTok</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            הגדרות וידאו
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תיאור הוידאו
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="תאר את הוידאו שאתה רוצה ליצור... לדוגמה: סרטון קצר שמציג מוצר חדש עם אפקטים מודרניים"
                className="input min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  אורך (שניות)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="input"
                >
                  <option value={5}>5 שניות</option>
                  <option value={10}>10 שניות</option>
                  <option value={15}>15 שניות</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  יחס תצוגה
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="input"
                >
                  <option value="9:16">9:16 (סטורי/Reels)</option>
                  <option value="16:9">16:9 (YouTube)</option>
                  <option value="1:1">1:1 (פוסט)</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateVideo}
              disabled={generating || !prompt.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  מייצר וידאו...
                </>
              ) : (
                <>
                  <Video size={18} />
                  צור וידאו
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Preview */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Play className="text-purple-600" />
            תצוגה מקדימה
          </h2>

          {result ? (
            <div className="space-y-4">
              <div className={`bg-gray-900 rounded-lg flex items-center justify-center ${
                aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[200px] mx-auto' :
                aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'
              }`}>
                {result.status === 'completed' && result.url ? (
                  <video 
                    src={result.url} 
                    controls 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-white p-4">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
                    <p className="text-sm">הוידאו בהכנה...</p>
                    <p className="text-xs text-gray-400 mt-1">זה יכול לקחת כמה דקות</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  result.status === 'completed' ? 'bg-green-100 text-green-700' :
                  result.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {result.status === 'completed' ? 'הושלם' :
                   result.status === 'failed' ? 'נכשל' : 'בעיבוד'}
                </span>
              </div>

              {result.status === 'completed' && result.url && (
                <a 
                  href={result.url} 
                  download
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  הורד וידאו
                </a>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Video size={48} className="mx-auto mb-2" />
                <p>הוידאו יופיע כאן</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates */}
      <div className="mt-8 card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">תבניות מהירות</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'סטורי מוצר', prompt: 'סרטון סטורי קצר שמציג מוצר עם אפקטים מודרניים וטקסט דינמי' },
            { name: 'Reel שיווקי', prompt: 'רילס מושך תשומת לב עם מעברים חלקים ואפקטים ויזואליים' },
            { name: 'TikTok טרנדי', prompt: 'סרטון TikTok בסגנון טרנדי עם מוזיקה אנרגטית ותנועה' },
          ].map((template) => (
            <button
              key={template.name}
              onClick={() => setPrompt(template.prompt)}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-right transition-colors"
            >
              <p className="font-medium text-purple-700">{template.name}</p>
              <p className="text-sm text-purple-600 mt-1 line-clamp-2">{template.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">💡 איך זה עובד?</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• יצירת וידאו מבוססת על AI (Runway / Pika / Replicate)</li>
          <li>• זמן עיבוד: 1-5 דקות בהתאם לאורך</li>
          <li>• תומך ב-Reels, Stories, TikTok ו-YouTube Shorts</li>
          <li>• ניתן להוסיף כתוביות אוטומטיות</li>
        </ul>
      </div>
    </div>
  );
}
