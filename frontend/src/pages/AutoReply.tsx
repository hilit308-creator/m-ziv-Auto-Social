import { useEffect, useState } from 'react';
import { MessageSquare, Settings, Send, AlertTriangle } from 'lucide-react';
import { autoReplyApi } from '../services/api';

interface Config {
  enabled: boolean;
  tone: string;
  language: string;
  escalate_keywords: string[];
  ignore_keywords: string[];
  max_reply_length: number;
}

export default function AutoReply() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [testComment, setTestComment] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await autoReplyApi.getConfig();
      setConfig(res.data.data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<Config>) => {
    try {
      const res = await autoReplyApi.updateConfig(updates);
      setConfig(res.data.data);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const testReply = async () => {
    if (!testComment.trim()) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const res = await autoReplyApi.analyze({
        text: testComment,
        platform: 'instagram',
        author: 'משתמש לדוגמה',
      });
      setTestResult(res.data.data);
    } catch (error) {
      console.error('Error testing reply:', error);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">מענה אוטומטי</h1>
      <p className="text-gray-500 mb-8">הגדר תשובות אוטומטיות לתגובות ברשתות החברתיות</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="text-blue-600" />
            הגדרות
          </h2>

          <div className="space-y-4">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">מענה אוטומטי פעיל</span>
              <button
                onClick={() => updateConfig({ enabled: !config?.enabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  config?.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  config?.enabled ? 'translate-x-1' : 'translate-x-6'
                }`}></div>
              </button>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">טון התשובות</label>
              <select
                value={config?.tone}
                onChange={(e) => updateConfig({ tone: e.target.value })}
                className="input"
              >
                <option value="מקצועי וחם">מקצועי וחם</option>
                <option value="מקצועי ופורמלי">מקצועי ופורמלי</option>
                <option value="ידידותי וקליל">ידידותי וקליל</option>
                <option value="צעיר ודינמי">צעיר ודינמי</option>
              </select>
            </div>

            {/* Max Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                אורך תשובה מקסימלי: {config?.max_reply_length} תווים
              </label>
              <input
                type="range"
                min="100"
                max="500"
                value={config?.max_reply_length}
                onChange={(e) => updateConfig({ max_reply_length: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Escalate Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מילות מפתח להעברה לטיפול אנושי
              </label>
              <div className="flex flex-wrap gap-2">
                {config?.escalate_keywords.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Ignore Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מילות מפתח להתעלמות (ספאם)
              </label>
              <div className="flex flex-wrap gap-2">
                {config?.ignore_keywords.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Test Reply */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="text-blue-600" />
            בדיקת תשובה
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                הזן תגובה לדוגמה
              </label>
              <textarea
                value={testComment}
                onChange={(e) => setTestComment(e.target.value)}
                placeholder="לדוגמה: מה המחיר? או: יפה מאוד!"
                className="input min-h-[100px]"
              />
            </div>

            <button
              onClick={testReply}
              disabled={testing || !testComment.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  מנתח...
                </>
              ) : (
                <>
                  <Send size={18} />
                  בדוק תשובה
                </>
              )}
            </button>

            {/* Result */}
            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.action === 'auto_reply' ? 'bg-green-50 border border-green-200' :
                testResult.action === 'escalate' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    testResult.action === 'auto_reply' ? 'bg-green-100 text-green-700' :
                    testResult.action === 'escalate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {testResult.action === 'auto_reply' ? 'תשובה אוטומטית' :
                     testResult.action === 'escalate' ? 'העברה לטיפול' : 'התעלמות'}
                  </span>
                </div>
                
                {testResult.reply_text && (
                  <div className="bg-white p-3 rounded-lg mt-2">
                    <p className="text-gray-700">{testResult.reply_text}</p>
                  </div>
                )}
                
                {testResult.reason && (
                  <p className="text-sm text-gray-500 mt-2">{testResult.reason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
