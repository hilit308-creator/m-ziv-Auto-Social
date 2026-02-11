import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Send, RefreshCw } from 'lucide-react';
import { postsApi } from '../services/api';

interface Post {
  id: string;
  topic: string;
  status: string;
  instagramCaption?: string;
  facebookCaption?: string;
  linkedinCaption?: string;
  createdAt: string;
  scheduledAt?: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTopic, setNewPostTopic] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await postsApi.getAll();
      setPosts(res.data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPostTopic.trim()) return;
    
    setCreating(true);
    try {
      await postsApi.create({ topic: newPostTopic });
      setNewPostTopic('');
      setShowCreateModal(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setCreating(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('האם למחוק את הפוסט?')) return;
    
    try {
      await postsApi.delete(id);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600',
      scheduled: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      draft: 'טיוטה',
      scheduled: 'מתוזמן',
      published: 'פורסם',
      failed: 'נכשל',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
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
        <h1 className="text-3xl font-bold text-gray-800">פוסטים</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          פוסט חדש
        </button>
      </div>

      {/* Posts Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">נושא</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">סטטוס</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">תאריך</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  אין פוסטים עדיין. צור את הפוסט הראשון שלך!
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{post.topic}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
                        <Send size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                        <RefreshCw size={18} />
                      </button>
                      <button 
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">יצירת פוסט חדש</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                נושא הפוסט
              </label>
              <input
                type="text"
                value={newPostTopic}
                onChange={(e) => setNewPostTopic(e.target.value)}
                placeholder="לדוגמה: טיפים לשיפור העסק"
                className="input"
              />
              <p className="text-sm text-gray-500 mt-2">
                ה-AI יצור תוכן לכל הפלטפורמות אוטומטית
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                ביטול
              </button>
              <button 
                onClick={createPost}
                disabled={creating || !newPostTopic.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    יוצר...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    צור פוסט
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
