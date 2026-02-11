import { useEffect, useState } from 'react';
import { Lightbulb, RefreshCw, Check, Plus, Loader2 } from 'lucide-react';
import { ideasApi, postsApi } from '../services/api';

interface Idea {
  id: string;
  topic: string;
  description: string;
  category: string;
  used: boolean;
  createdAt: string;
}

export default function Ideas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [todayIdea, setTodayIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [creatingPostId, setCreatingPostId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const fetchData = async () => {
    try {
      const [allRes, todayRes] = await Promise.all([
        ideasApi.getAll(),
        ideasApi.getToday(),
      ]);
      setIdeas(allRes.data.data || []);
      setTodayIdea(todayRes.data.data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      showError('שגיאה בטעינת רעיונות');
    } finally {
      setLoading(false);
    }
  };

  const generateNewIdeas = async () => {
    setGenerating(true);
    try {
      await ideasApi.generate(5);
      await fetchData();
      showSuccess('רעיונות חדשים נוצרו! 🎉');
    } catch (error) {
      console.error('Error generating ideas:', error);
      showError('שגיאה ביצירת רעיונות');
    } finally {
      setGenerating(false);
    }
  };

  const createPostFromIdea = async (idea: Idea) => {
    setCreatingPostId(idea.id);
    try {
      console.log('Creating post from idea:', idea.topic);
      
      // Create post with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await postsApi.create({ topic: idea.topic });
      clearTimeout(timeoutId);
      
      console.log('Post created:', response.data);
      
      if (response.data.success) {
        try {
          await ideasApi.markUsed(idea.id);
        } catch (markError) {
          console.log('Could not mark idea as used:', markError);
        }
        await fetchData();
        showSuccess('הפוסט נוצר בהצלחה! 🚀');
      } else {
        showError(response.data.error || 'שגיאה ביצירת הפוסט');
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (error.name === 'AbortError') {
        showError('הבקשה ארכה יותר מדי זמן. נסה שוב.');
      } else {
        showError(error.response?.data?.error || 'שגיאה ביצירת הפוסט - בדוק את החיבור לשרת');
      }
    } finally {
      setCreatingPostId(null);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      tip: 'bg-green-100 text-green-700',
      story: 'bg-brand-light text-brand-primary',
      question: 'bg-blue-100 text-blue-700',
      promotion: 'bg-yellow-100 text-yellow-700',
      educational: 'bg-indigo-100 text-indigo-700',
    };
    const labels: Record<string, string> = {
      tip: 'טיפ',
      story: 'סיפור',
      question: 'שאלה',
      promotion: 'קידום',
      educational: 'חינוכי',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[category] || 'bg-gray-100 text-gray-600'}`}>
        {labels[category] || category}
      </span>
    );
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
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          {successMessage}
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-50">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">רעיונות לתוכן</h1>
        <button 
          onClick={generateNewIdeas}
          disabled={generating}
          className="btn-primary flex items-center gap-2"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              מייצר...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              צור רעיונות חדשים
            </>
          )}
        </button>
      </div>

      {/* Today's Idea */}
      {todayIdea && (
        <div className="card bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Lightbulb className="text-brand-primary" size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-800">הרעיון של היום</h2>
                {getCategoryBadge(todayIdea.category)}
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">{todayIdea.topic}</h3>
              <p className="text-gray-600 mb-4">{todayIdea.description}</p>
              <button 
                onClick={() => createPostFromIdea(todayIdea)}
                disabled={creatingPostId === todayIdea.id}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {creatingPostId === todayIdea.id ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    יוצר פוסט...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    צור פוסט מהרעיון
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Ideas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <div 
            key={idea.id} 
            className={`card ${idea.used ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              {getCategoryBadge(idea.category)}
              {idea.used && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <Check size={16} />
                  נוצל
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2">{idea.topic}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{idea.description}</p>
            
            {!idea.used && (
              <button 
                onClick={() => createPostFromIdea(idea)}
                disabled={creatingPostId === idea.id}
                className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creatingPostId === idea.id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    יוצר פוסט...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    צור פוסט
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {ideas.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500">אין רעיונות עדיין</p>
          <button 
            onClick={generateNewIdeas}
            className="btn-primary mt-4"
          >
            צור רעיונות
          </button>
        </div>
      )}
    </div>
  );
}
