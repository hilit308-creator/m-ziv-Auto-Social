import { useEffect, useState } from 'react';
import { Instagram, Facebook, Linkedin, Youtube, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { authApi, publishApi } from '../services/api';

interface Connection {
  platform: string;
  connected: boolean;
  account_name?: string;
}

interface PublishStatus {
  configured: string[];
  not_configured: string[];
  instructions: Record<string, string[]>;
}

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: () => <span className="text-2xl">🎵</span>,
};

const platformNames: Record<string, string> = {
  instagram: 'אינסטגרם',
  facebook: 'פייסבוק',
  linkedin: 'לינקדאין',
  youtube: 'יוטיוב',
  tiktok: 'טיקטוק',
};

export default function Connections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authRes, publishRes] = await Promise.all([
          authApi.getStatus(),
          publishApi.getStatus(),
        ]);
        setConnections(authRes.data.data.connections);
        setPublishStatus(publishRes.data.data);
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const connectPlatform = async (platform: string) => {
    try {
      const res = await authApi.connect(platform);
      if (res.data.data?.auth_url) {
        window.open(res.data.data.auth_url, '_blank');
      } else {
        alert('לא ניתן להתחבר כרגע. בדוק את ההגדרות.');
      }
    } catch (error: any) {
      const requiredVars = error.response?.data?.required_vars || [];
      alert(`צריך להגדיר משתנים ב-Railway:\n${requiredVars.join('\n')}`);
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
      <h1 className="text-3xl font-bold text-gray-800 mb-2">חיבורים לרשתות</h1>
      <p className="text-gray-500 mb-8">חבר את חשבונות הרשתות החברתיות שלך לפרסום אוטומטי</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((conn) => {
          const Icon = platformIcons[conn.platform] || Instagram;
          const isConfigured = publishStatus?.configured.includes(conn.platform);
          
          return (
            <div key={conn.platform} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {platformNames[conn.platform]}
                    </h3>
                    {conn.account_name && (
                      <p className="text-sm text-gray-500">{conn.account_name}</p>
                    )}
                  </div>
                </div>
                
                {conn.connected ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <XCircle className="text-gray-300" size={24} />
                )}
              </div>

              <div className="border-t pt-4">
                {isConfigured ? (
                  <div className="flex items-center gap-2 text-green-600 mb-3">
                    <CheckCircle size={16} />
                    <span className="text-sm">מוגדר ומוכן לפרסום</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mb-3">
                    <p className="font-medium mb-1">משתנים נדרשים:</p>
                    <ul className="list-disc list-inside">
                      {publishStatus?.instructions[conn.platform]?.map((v) => (
                        <li key={v} className="text-xs font-mono">{v}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => connectPlatform(conn.platform)}
                  className={conn.connected ? 'btn-secondary w-full' : 'btn-primary w-full'}
                >
                  {conn.connected ? (
                    'נתק'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ExternalLink size={16} />
                      התחבר
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Setup Instructions */}
      <div className="mt-8 card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">איך לחבר רשת חברתית?</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-2 text-sm">
          <li>צור אפליקציה בפורטל המפתחים של הרשת (Meta, TikTok, Google)</li>
          <li>הגדר את ה-Redirect URI לכתובת ה-API שלך</li>
          <li>הוסף את המשתנים הנדרשים ל-Railway</li>
          <li>לחץ על "התחבר" והרשה גישה</li>
        </ol>
      </div>
    </div>
  );
}
