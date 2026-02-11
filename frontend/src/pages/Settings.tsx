import { useEffect, useState } from 'react';
import { Save, User, Palette, Hash } from 'lucide-react';
import { profileApi } from '../services/api';

interface Profile {
  id: string;
  name: string;
  business_type: string;
  tone: string;
  language: string;
  target_audience: string;
  default_cta: string;
  emoji_level: string;
  branded_hashtags: string[];
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHashtag, setNewHashtag] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileApi.get();
      setProfile(res.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await profileApi.update(profile);
      alert('הפרופיל נשמר בהצלחה!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const addHashtag = () => {
    if (!newHashtag.trim() || !profile) return;
    const hashtag = newHashtag.startsWith('#') ? newHashtag : `#${newHashtag}`;
    setProfile({
      ...profile,
      branded_hashtags: [...(profile.branded_hashtags || []), hashtag],
    });
    setNewHashtag('');
  };

  const removeHashtag = (index: number) => {
    if (!profile) return;
    const updated = [...profile.branded_hashtags];
    updated.splice(index, 1);
    setProfile({ ...profile, branded_hashtags: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">הגדרות</h1>
        <button 
          onClick={saveProfile}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              שומר...
            </>
          ) : (
            <>
              <Save size={18} />
              שמור שינויים
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Info */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="text-brand-primary" />
            פרטי העסק
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שם העסק</label>
              <input
                type="text"
                value={profile?.name || ''}
                onChange={(e) => setProfile({ ...profile!, name: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סוג העסק</label>
              <input
                type="text"
                value={profile?.business_type || ''}
                onChange={(e) => setProfile({ ...profile!, business_type: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">קהל יעד</label>
              <textarea
                value={profile?.target_audience || ''}
                onChange={(e) => setProfile({ ...profile!, target_audience: e.target.value })}
                className="input min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">קריאה לפעולה ברירת מחדל</label>
              <input
                type="text"
                value={profile?.default_cta || ''}
                onChange={(e) => setProfile({ ...profile!, default_cta: e.target.value })}
                placeholder="לדוגמה: צרו קשר עוד היום!"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Tone & Style */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Palette className="text-brand-primary" />
            טון וסגנון
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">טון הכתיבה</label>
              <select
                value={profile?.tone || ''}
                onChange={(e) => setProfile({ ...profile!, tone: e.target.value })}
                className="input"
              >
                <option value="מקצועי וחם">מקצועי וחם</option>
                <option value="מקצועי ופורמלי">מקצועי ופורמלי</option>
                <option value="ידידותי וקליל">ידידותי וקליל</option>
                <option value="צעיר ודינמי">צעיר ודינמי</option>
                <option value="יוקרתי ואקסקלוסיבי">יוקרתי ואקסקלוסיבי</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שפה</label>
              <select
                value={profile?.language || ''}
                onChange={(e) => setProfile({ ...profile!, language: e.target.value })}
                className="input"
              >
                <option value="עברית">עברית</option>
                <option value="אנגלית">אנגלית</option>
                <option value="עברית ואנגלית">עברית ואנגלית</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">רמת אימוג׳ים</label>
              <select
                value={profile?.emoji_level || ''}
                onChange={(e) => setProfile({ ...profile!, emoji_level: e.target.value })}
                className="input"
              >
                <option value="none">ללא אימוג׳ים</option>
                <option value="low">מעט (1-2)</option>
                <option value="medium">בינוני (3-5)</option>
                <option value="high">הרבה (6+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hashtags */}
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Hash className="text-brand-primary" />
            האשטגים של המותג
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
              placeholder="הוסף האשטג..."
              className="input flex-1"
            />
            <button onClick={addHashtag} className="btn-primary">
              הוסף
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile?.branded_hashtags?.map((tag, index) => (
              <span 
                key={index} 
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2"
              >
                {tag}
                <button 
                  onClick={() => removeHashtag(index)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
