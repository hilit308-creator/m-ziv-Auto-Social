import { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { calendarApi } from '../services/api';

interface Post {
  id: string;
  topic: string;
  status: string;
  scheduled_at: string;
}

interface Day {
  date: string;
  posts: Post[];
}

export default function Calendar() {
  const [days, setDays] = useState<Day[]>([]);
  const [weekStart, setWeekStart] = useState<string>('');
  const [weekEnd, setWeekEnd] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeek();
  }, []);

  const fetchWeek = async (start?: string) => {
    setLoading(true);
    try {
      const res = await calendarApi.getWeek(start);
      setDays(res.data.data.days);
      setWeekStart(res.data.data.week_start);
      setWeekEnd(res.data.data.week_end);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(weekStart);
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    fetchWeek(current.toISOString().split('T')[0]);
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', { weekday: 'long' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">לוח תוכן</h1>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={24} />
          </button>
          <span className="font-medium text-gray-700">
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </span>
          <button 
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
      </div>

      {/* Weekly View */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => (
          <div 
            key={day.date}
            className={`card min-h-[200px] ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="text-center mb-4 pb-3 border-b">
              <p className="text-sm text-gray-500">{getDayName(day.date)}</p>
              <p className={`text-lg font-bold ${isToday(day.date) ? 'text-blue-600' : 'text-gray-800'}`}>
                {formatDate(day.date)}
              </p>
            </div>

            <div className="space-y-2">
              {day.posts.length === 0 ? (
                <p className="text-xs text-gray-400 text-center">אין פוסטים</p>
              ) : (
                day.posts.map((post) => (
                  <div 
                    key={post.id}
                    className="p-2 bg-blue-50 rounded-lg text-sm"
                  >
                    <p className="font-medium text-gray-700 truncate">{post.topic}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock size={12} />
                      {new Date(post.scheduled_at).toLocaleTimeString('he-IL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
