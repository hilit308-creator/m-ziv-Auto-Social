import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { analyticsApi, reportsApi } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface PlatformData {
  platform: string;
  count: number;
  percentage: number;
}

interface DailyData {
  date: string;
  count: number;
}

export default function Analytics() {
  const [overview, setOverview] = useState<any>(null);
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, platformRes, dailyRes, weeklyRes] = await Promise.all([
          analyticsApi.getOverview(30),
          analyticsApi.getPlatformDistribution(),
          analyticsApi.getPostsPerDay(7),
          reportsApi.getWeekly(),
        ]);
        
        setOverview(overviewRes.data.data);
        setPlatformData(platformRes.data.data);
        setDailyData(dailyRes.data.data);
        setWeeklyReport(weeklyRes.data.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const platformNames: Record<string, string> = {
    instagram: 'אינסטגרם',
    facebook: 'פייסבוק',
    linkedin: 'לינקדאין',
    youtube: 'יוטיוב',
    tiktok: 'טיקטוק',
  };

  const platformColors: Record<string, string> = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    tiktok: '#000000',
  };

  const COLORS = ['#E4405F', '#1877F2', '#0A66C2', '#FF0000', '#000000'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">אנליטיקה</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500">סה״כ פוסטים (30 יום)</p>
          <p className="text-3xl font-bold text-gray-800">{overview?.total_posts || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">פורסמו</p>
          <p className="text-3xl font-bold text-green-600">{overview?.published_posts || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">מתוזמנים</p>
          <p className="text-3xl font-bold text-yellow-600">{overview?.scheduled_posts || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">טיוטות</p>
          <p className="text-3xl font-bold text-gray-600">{overview?.draft_posts || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Platform Distribution - Pie Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            פילוח פלטפורמות
          </h2>
          
          {platformData.some(p => p.count > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData.filter(p => p.count > 0).map(p => ({
                    name: platformNames[p.platform] || p.platform,
                    value: p.count,
                    fill: platformColors[p.platform] || '#888888',
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {platformData.filter(p => p.count > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={platformColors[entry.platform] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">אין נתונים עדיין</p>
          )}
        </div>

        {/* Daily Activity - Bar Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            פעילות יומית (7 ימים)
          </h2>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData.map(d => ({
              ...d,
              day: new Date(d.date).toLocaleDateString('he-IL', { weekday: 'short' }),
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#F28C28" radius={[4, 4, 0, 0]} name="פוסטים" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Trend Line Chart */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          מגמת פוסטים
        </h2>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData.map(d => ({
            ...d,
            day: new Date(d.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#F28C28" strokeWidth={2} dot={{ fill: '#F28C28' }} name="פוסטים" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Recommendations */}
      {weeklyReport?.recommendations && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-brand-primary" />
            המלצות לשיפור
          </h2>
          
          <ul className="space-y-3">
            {weeklyReport.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-brand-light rounded-lg">
                <span className="text-brand-primary font-bold">{index + 1}</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
