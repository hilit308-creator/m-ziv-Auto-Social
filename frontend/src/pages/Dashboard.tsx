import { useEffect, useState } from 'react';
import { FileText, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { analyticsApi, calendarApi, ideasApi } from '../services/api';

interface Stats {
  total_posts: number;
  published_posts: number;
  scheduled_posts: number;
  draft_posts: number;
  failed_posts: number;
}

interface Idea {
  id: string;
  topic: string;
  description: string;
  category: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayIdea, setTodayIdea] = useState<Idea | null>(null);
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ideaRes, calendarRes] = await Promise.all([
          analyticsApi.getOverview(30),
          ideasApi.getToday(),
          calendarApi.getWeek(),
        ]);
        
        setStats(statsRes.data.data);
        setTodayIdea(ideaRes.data.data);
        
        // Extract scheduled posts from calendar
        const scheduledPosts = calendarRes.data.data.days
          .flatMap((day: any) => day.posts)
          .filter((post: any) => post.status === 'scheduled')
          .slice(0, 5);
        setUpcomingPosts(scheduledPosts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">דשבורד</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="סה״כ פוסטים"
          value={stats?.total_posts || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="פורסמו"
          value={stats?.published_posts || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="מתוזמנים"
          value={stats?.scheduled_posts || 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="טיוטות"
          value={stats?.draft_posts || 0}
          icon={FileText}
          color="gray"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Idea */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            רעיון להיום
          </h2>
          {todayIdea ? (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">{todayIdea.topic}</h3>
              <p className="text-gray-600 mb-3">{todayIdea.description}</p>
              <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                {todayIdea.category}
              </span>
              <button className="btn-primary mt-4 block">
                צור פוסט מהרעיון
              </button>
            </div>
          ) : (
            <p className="text-gray-500">אין רעיון להיום</p>
          )}
        </div>

        {/* Upcoming Posts */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" />
            פוסטים קרובים
          </h2>
          {upcomingPosts.length > 0 ? (
            <ul className="space-y-3">
              {upcomingPosts.map((post: any) => (
                <li key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">{post.topic}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.scheduled_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <span className="text-blue-600">
                    <Clock size={20} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">אין פוסטים מתוזמנים</p>
          )}
        </div>
      </div>

      {/* Failed Posts Alert */}
      {stats && stats.failed_posts > 0 && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" />
          <div>
            <p className="font-medium text-red-800">
              {stats.failed_posts} פוסטים נכשלו בפרסום
            </p>
            <p className="text-red-600 text-sm">בדוק את החיבורים לרשתות החברתיות</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    gray: 'bg-gray-50 text-gray-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
