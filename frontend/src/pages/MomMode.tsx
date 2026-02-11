import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assistantApi } from '../services/api';

// Custom hook for audio recording
function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('לא הצלחתי לגשת למיקרופון. אנא אשרי גישה למיקרופון.');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            
            try {
              const response = await assistantApi.transcribe({
                audioBase64: base64,
                filename: 'recording.webm',
              });
              
              setIsTranscribing(false);
              resolve(response.data?.data?.transcript || null);
            } catch (error) {
              console.error('Transcription failed:', error);
              setIsTranscribing(false);
              resolve(null);
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Failed to process recording:', error);
          setIsTranscribing(false);
          resolve(null);
        }

        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  return { isRecording, isTranscribing, startRecording, stopRecording };
}

interface DailyIdea {
  filmingIdea: string;
  contentType: string;
  suggestedHook: string;
  difficulty: string;
  estimatedTime: number;
  tips: string[];
}

interface BurnoutStatus {
  status: 'healthy' | 'warning' | 'burnout_risk';
  message: string;
  suggestions: string[];
}

interface MomModeData {
  dailyIdea: DailyIdea;
  pendingIdeas: number;
  burnoutStatus: BurnoutStatus;
  quickActions: string[];
}

export default function MomMode() {
  const queryClient = useQueryClient();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useAudioRecorder();
  const [transcript, setTranscript] = useState('');
  const [showIdeaInput, setShowIdeaInput] = useState(false);
  const [ideaText, setIdeaText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch Mom Mode data
  const { data: momModeData, isLoading } = useQuery<{ data: MomModeData }>({
    queryKey: ['momMode'],
    queryFn: () => assistantApi.getMomModeData(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Voice post mutation
  const voicePostMutation = useMutation({
    mutationFn: (transcriptText: string) => 
      assistantApi.createVoicePost({ transcript: transcriptText, platforms: ['instagram', 'facebook', 'tiktok'] }),
    onSuccess: () => {
      showSuccessToast('הפוסט נוצר בהצלחה! 🎉');
      setTranscript('');
      queryClient.invalidateQueries({ queryKey: ['momMode'] });
    },
  });

  // Capture idea mutation
  const captureIdeaMutation = useMutation({
    mutationFn: (content: string) => 
      assistantApi.captureIdea({ inputType: 'text', content }),
    onSuccess: () => {
      showSuccessToast('הרעיון נשמר! 💡');
      setIdeaText('');
      setShowIdeaInput(false);
      queryClient.invalidateQueries({ queryKey: ['momMode'] });
    },
  });

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Real voice recording with Whisper transcription
  const toggleRecording = async () => {
    if (isRecording) {
      const transcribedText = await stopRecording();
      if (transcribedText) {
        setTranscript(prev => prev ? `${prev}\n${transcribedText}` : transcribedText);
        showSuccessToast('ההקלטה תומללה! ✨');
      }
    } else {
      await startRecording();
    }
  };

  const handleCreatePost = () => {
    if (transcript.trim()) {
      voicePostMutation.mutate(transcript);
    }
  };

  const handleSaveIdea = () => {
    if (ideaText.trim()) {
      captureIdeaMutation.mutate(ideaText);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [transcript]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-purple-600 text-xl">טוען...</div>
      </div>
    );
  }

  const data = momModeData?.data;
  const burnoutStatus = data?.burnoutStatus;
  const dailyIdea = data?.dailyIdea;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6" dir="rtl">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          {successMessage}
        </div>
      )}

      {/* Burnout Alert */}
      {burnoutStatus?.status === 'burnout_risk' && (
        <div className="mb-6 bg-amber-100 border-r-4 border-amber-500 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💆‍♀️</span>
            <div>
              <p className="font-medium text-amber-800">{burnoutStatus.message}</p>
              <p className="text-sm text-amber-600 mt-1">{burnoutStatus.suggestions[0]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">שלום! 👋</h1>
        <p className="text-gray-600">{burnoutStatus?.message || 'מה נעשה היום?'}</p>
      </div>

      {/* Main Action Card - Voice First */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 max-w-md mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">ספרי על הסרטון</h2>
          <p className="text-gray-500 text-sm">הקליטי או כתבי מה צילמת</p>
        </div>

        {/* Recording Button */}
        <button
          onClick={toggleRecording}
          disabled={isTranscribing}
          className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center transition-all ${
            isTranscribing
              ? 'bg-blue-500 animate-spin-slow'
              : isRecording 
                ? 'bg-red-500 animate-pulse scale-110' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'
          } ${isTranscribing ? 'cursor-wait' : ''}`}
        >
          <span className="text-4xl text-white">
            {isTranscribing ? '⏳' : isRecording ? '⏹️' : '🎤'}
          </span>
        </button>
        {isTranscribing && (
          <p className="text-center text-blue-600 text-sm mb-2">מתמלל את ההקלטה...</p>
        )}
        {isRecording && (
          <p className="text-center text-red-600 text-sm mb-2 animate-pulse">מקליט... לחצי שוב לעצור</p>
        )}

        {/* Transcript Input */}
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="או פשוט כתבי כאן..."
          className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
          rows={3}
        />

        {/* Create Post Button */}
        <button
          onClick={handleCreatePost}
          disabled={!transcript.trim() || voicePostMutation.isPending}
          className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all ${
            transcript.trim() && !voicePostMutation.isPending
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {voicePostMutation.isPending ? 'יוצר פוסט... ✨' : 'צרי פוסט 🚀'}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
        {/* Save Idea */}
        <button
          onClick={() => setShowIdeaInput(!showIdeaInput)}
          className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all text-center"
        >
          <span className="text-3xl block mb-2">💡</span>
          <span className="text-gray-700 font-medium">שמרי רעיון</span>
          {data?.pendingIdeas ? (
            <span className="block text-sm text-purple-500 mt-1">
              {data.pendingIdeas} רעיונות מחכים
            </span>
          ) : null}
        </button>

        {/* Daily Idea */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <span className="text-3xl block mb-2">🎬</span>
          <span className="text-gray-700 font-medium block">רעיון להיום</span>
          <span className="text-xs text-gray-500 block mt-1 line-clamp-2">
            {dailyIdea?.filmingIdea || 'טוען...'}
          </span>
        </div>
      </div>

      {/* Idea Input Modal */}
      {showIdeaInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-center">💡 שמרי רעיון</h3>
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="כתבי את הרעיון שלך..."
              className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-300"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowIdeaInput(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium"
              >
                ביטול
              </button>
              <button
                onClick={handleSaveIdea}
                disabled={!ideaText.trim() || captureIdeaMutation.isPending}
                className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-medium disabled:opacity-50"
              >
                {captureIdeaMutation.isPending ? 'שומר...' : 'שמור 💾'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Idea Card */}
      {dailyIdea && (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎬</span>
            <h3 className="font-bold text-lg">רעיון לצילום היום</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              dailyIdea.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              dailyIdea.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {dailyIdea.difficulty === 'easy' ? 'קל' :
               dailyIdea.difficulty === 'medium' ? 'בינוני' : 'מאתגר'}
            </span>
          </div>
          
          <p className="text-gray-700 mb-3">{dailyIdea.filmingIdea}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span>⏱️ {dailyIdea.estimatedTime} דקות</span>
            <span>📱 {dailyIdea.contentType}</span>
          </div>

          {dailyIdea.suggestedHook && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-purple-700">
                <strong>Hook מוצע:</strong> "{dailyIdea.suggestedHook}"
              </p>
            </div>
          )}

          {dailyIdea.tips && dailyIdea.tips.length > 0 && (
            <div className="mt-3 space-y-1">
              {dailyIdea.tips.map((tip, i) => (
                <p key={i} className="text-sm text-gray-600">💡 {tip}</p>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setTranscript(dailyIdea.filmingIdea);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl font-medium"
          >
            השתמשי ברעיון הזה ✨
          </button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="fixed bottom-4 left-4">
        <a
          href="/posts"
          className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm shadow-lg hover:bg-gray-700 transition-all"
        >
          מצב מתקדם →
        </a>
      </div>
    </div>
  );
}
