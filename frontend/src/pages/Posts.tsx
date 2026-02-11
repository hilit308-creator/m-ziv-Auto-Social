import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Send, RefreshCw, Image, Calendar, Instagram, Facebook, Linkedin, Youtube, Clock, Sparkles, Smartphone } from 'lucide-react';
import { postsApi, publishApi } from '../services/api';

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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostImage, setNewPostImage] = useState<string>('');
  const [newPostPlatforms, setNewPostPlatforms] = useState<string[]>(['instagram', 'facebook', 'linkedin']);
  const [newPostSchedule, setNewPostSchedule] = useState<string>('');
  const [newPostTime, setNewPostTime] = useState<string>('');
  const [generateImage, setGenerateImage] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedImagePreview(base64);
        setNewPostImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

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
    if (!newPostTopic.trim()) {
      alert('נא להזין נושא לפוסט');
      return;
    }
    
    setCreating(true);
    try {
      console.log('Creating post with topic:', newPostTopic);
      
      const postData = {
        topic: newPostTopic,
        platforms: newPostPlatforms,
        image_url: newPostImage || undefined,
        generate_image: generateImage,
        scheduled_at: newPostSchedule && newPostTime 
          ? new Date(`${newPostSchedule}T${newPostTime}`).toISOString() 
          : undefined,
      };
      
      console.log('Post data:', postData);
      
      const response = await postsApi.create(postData);
      console.log('Response:', response.data);
      
      if (response.data.success) {
        setNewPostTopic('');
        setNewPostImage('');
        setNewPostSchedule('');
        setNewPostTime('');
        setGenerateImage(false);
        setUploadedImagePreview(null);
        setShowCreateModal(false);
        fetchPosts();
        alert('הפוסט נוצר בהצלחה! 🎉');
      } else {
        alert(response.data.error || 'שגיאה ביצירת הפוסט');
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.error || 'שגיאה בחיבור לשרת - בדוק שהשרת פועל');
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

  const editPost = (post: Post) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const rewritePost = async (id: string) => {
    setRewriting(id);
    try {
      await postsApi.rewrite(id, 'more_professional');
      fetchPosts();
      alert('הפוסט שוכתב בהצלחה!');
    } catch (error) {
      console.error('Error rewriting post:', error);
      alert('שגיאה בשכתוב');
    } finally {
      setRewriting(null);
    }
  };

  const publishPost = async (id: string) => {
    setPublishing(id);
    try {
      await publishApi.publish(id);
      fetchPosts();
      alert('הפוסט פורסם בהצלחה!');
    } catch (error: any) {
      console.error('Error publishing post:', error);
      alert(error.response?.data?.error || 'שגיאה בפרסום');
    } finally {
      setPublishing(null);
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
                      <button 
                        onClick={() => editPost(post)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="עריכה"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => publishPost(post.id)}
                        disabled={publishing === post.id || post.status === 'published'}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                        title="פרסום"
                      >
                        {publishing === post.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                      <button 
                        onClick={() => rewritePost(post.id)}
                        disabled={rewriting === post.id}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                        title="שכתב מחדש"
                      >
                        {rewriting === post.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        ) : (
                          <RefreshCw size={18} />
                        )}
                      </button>
                      <button 
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="מחיקה"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">יצירת פוסט חדש</h2>
            
            {/* Topic */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Sparkles size={16} className="inline ml-1 text-brand-primary" />
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

            {/* Platforms */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                פלטפורמות לפרסום
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'instagram', name: 'אינסטגרם', icon: Instagram, color: 'bg-pink-100 text-pink-600 border-pink-300' },
                  { id: 'facebook', name: 'פייסבוק', icon: Facebook, color: 'bg-blue-100 text-blue-600 border-blue-300' },
                  { id: 'linkedin', name: 'לינקדאין', icon: Linkedin, color: 'bg-sky-100 text-sky-600 border-sky-300' },
                  { id: 'youtube', name: 'יוטיוב', icon: Youtube, color: 'bg-red-100 text-red-600 border-red-300' },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => {
                      if (newPostPlatforms.includes(platform.id)) {
                        setNewPostPlatforms(newPostPlatforms.filter(p => p !== platform.id));
                      } else {
                        setNewPostPlatforms([...newPostPlatforms, platform.id]);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      newPostPlatforms.includes(platform.id) 
                        ? platform.color + ' border-current' 
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    <platform.icon size={18} />
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Image size={16} className="inline ml-1 text-brand-primary" />
                תמונה
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setGenerateImage(true)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    generateImage ? 'border-brand-primary bg-brand-light' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles size={20} className="text-brand-primary" />
                    <span className="font-medium">צור תמונה עם AI</span>
                  </div>
                  <p className="text-sm text-gray-500">DALL-E יצור תמונה מותאמת לפוסט</p>
                </div>
                <div 
                  onClick={() => setGenerateImage(false)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    !generateImage ? 'border-brand-primary bg-brand-light' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Image size={20} className="text-brand-primary" />
                    <span className="font-medium">העלה תמונה</span>
                  </div>
                  <p className="text-sm text-gray-500">העלה תמונה מהמחשב שלך</p>
                </div>
              </div>
              
              {!generateImage && (
                <div className="mt-4 space-y-4">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {/* Upload button */}
                  <div 
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-brand-primary hover:bg-brand-light transition-all"
                  >
                    {uploadedImagePreview ? (
                      <div>
                        <img 
                          src={uploadedImagePreview} 
                          alt="תצוגה מקדימה" 
                          className="max-h-40 mx-auto rounded-lg mb-2"
                        />
                        <p className="text-sm text-gray-500">לחץ להחלפה</p>
                      </div>
                    ) : (
                      <div>
                        <Smartphone size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="font-medium text-gray-700">לחץ להעלאת תמונה</p>
                        <p className="text-sm text-gray-500">מהטלפון או מהמחשב</p>
                      </div>
                    )}
                  </div>

                  {/* Or URL input */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">או</span>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    value={newPostImage.startsWith('data:') ? '' : newPostImage}
                    onChange={(e) => {
                      setNewPostImage(e.target.value);
                      setUploadedImagePreview(null);
                    }}
                    placeholder="הכנס קישור לתמונה (URL)"
                    className="input"
                  />
                </div>
              )}
            </div>

            {/* Scheduling */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar size={16} className="inline ml-1 text-brand-primary" />
                תזמון
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">תאריך</label>
                  <input
                    type="date"
                    value={newPostSchedule}
                    onChange={(e) => setNewPostSchedule(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">שעה</label>
                  <input
                    type="time"
                    value={newPostTime}
                    onChange={(e) => setNewPostTime(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <Clock size={14} />
                השאר ריק לפרסום מיידי
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end border-t pt-4">
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPostTopic('');
                  setNewPostImage('');
                  setNewPostSchedule('');
                  setNewPostTime('');
                  setGenerateImage(false);
                  setUploadedImagePreview(null);
                }}
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
                    יוצר עם AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    צור פוסט עם AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">עריכת פוסט</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">נושא</label>
                <input
                  type="text"
                  value={selectedPost.topic}
                  onChange={(e) => setSelectedPost({ ...selectedPost, topic: e.target.value })}
                  className="input"
                />
              </div>

              {selectedPost.instagramCaption && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">אינסטגרם</label>
                  <textarea
                    value={selectedPost.instagramCaption}
                    onChange={(e) => setSelectedPost({ ...selectedPost, instagramCaption: e.target.value })}
                    className="input min-h-[100px]"
                  />
                </div>
              )}

              {selectedPost.facebookCaption && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">פייסבוק</label>
                  <textarea
                    value={selectedPost.facebookCaption}
                    onChange={(e) => setSelectedPost({ ...selectedPost, facebookCaption: e.target.value })}
                    className="input min-h-[100px]"
                  />
                </div>
              )}

              {selectedPost.linkedinCaption && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">לינקדאין</label>
                  <textarea
                    value={selectedPost.linkedinCaption}
                    onChange={(e) => setSelectedPost({ ...selectedPost, linkedinCaption: e.target.value })}
                    className="input min-h-[100px]"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPost(null);
                }}
                className="btn-secondary"
              >
                ביטול
              </button>
              <button 
                onClick={async () => {
                  try {
                    await postsApi.update(selectedPost.id, selectedPost);
                    setShowEditModal(false);
                    setSelectedPost(null);
                    fetchPosts();
                    alert('הפוסט עודכן בהצלחה!');
                  } catch (error) {
                    console.error('Error updating post:', error);
                    alert('שגיאה בעדכון');
                  }
                }}
                className="btn-primary"
              >
                שמור שינויים
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
