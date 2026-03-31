import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Volume2, History, Star, MessageCircle, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

interface Vocabulary {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
}

interface VoicePractice {
  id: string;
  recording_url: string;
  transcript: string;
  score: number;
  feedback: string;
  word: string;
  pinyin: string;
  created_at: string;
}

export function VoicePractice() {
  const { user, isAuthenticated } = useAuth();
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [currentWord, setCurrentWord] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [history, setHistory] = useState<VoicePractice[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hskLevel, setHskLevel] = useState(1);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadVocabulary();
      loadHistory();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated]);

  const loadVocabulary = async () => {
    try {
      const res = await api.student.getVocabularyByHSK(hskLevel);
      if (res.success) setVocabulary(res.data);
    } catch (err) {
      console.error('Error loading vocabulary:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.student.getVoicePractices();
      if (res.success) setHistory(res.data);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        if (vocabulary[currentWord]) {
          const mockScore = Math.floor(Math.random() * 30) + 70;
          const feedback = mockScore >= 90 ? 'Phát âm rất tốt!' : 
                          mockScore >= 80 ? 'Phát âm tốt!' : 
                          mockScore >= 70 ? 'Cần cải thiện thêm!' : 'Cần luyện tập nhiều hơn!';

          try {
            await api.student.saveVoicePractice({
              vocabulary_id: vocabulary[currentWord].id,
              recording_url: url,
              transcript: vocabulary[currentWord].word,
              score: mockScore,
              feedback,
            });
            toast.success(`Đạt ${mockScore} điểm! ${feedback}`);
            loadHistory();
            
            if (currentWord < vocabulary.length - 1) {
              setCurrentWord(currentWord + 1);
            } else {
              toast.success('Hoàn thành tất cả từ!');
            }
          } catch (err) {
            console.error('Error saving practice:', err);
          }
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('Không thể truy cập microphone');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    speechSynthesis.speak(utterance);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập để luyện nói</h2>
          <p className="text-gray-600">Bạn cần đăng nhập để sử dụng tính năng này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Luyện phát âm</h1>
            <p className="text-gray-600 mt-1">Luyện nói tiếng Hoa với AI</p>
          </div>
          <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
            <History className="h-4 w-4 mr-2" /> Lịch sử
          </Button>
        </div>

        {showHistory ? (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Lịch sử luyện nói</h2>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.word}</span>
                        {item.pinyin && <span className="text-gray-500">[{item.pinyin}]</span>}
                      </div>
                      <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${item.score >= 80 ? 'text-green-600' : item.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {item.score}
                      </div>
                      <p className="text-xs text-gray-500">{item.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có lịch sử luyện nói</p>
            )}
          </Card>
        ) : (
          <>
            {/* Level Selection */}
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="font-medium">Chọn cấp độ HSK:</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <button
                      key={level}
                      onClick={() => { setHskLevel(level); setCurrentWord(0); }}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        hskLevel === level ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      HSK {level}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Practice Card */}
            {vocabulary.length > 0 ? (
              <Card className="p-8 text-center">
                <div className="mb-6">
                  <span className="text-sm text-gray-500">
                    Từ {currentWord + 1} / {vocabulary.length}
                  </span>
                </div>

                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    {vocabulary[currentWord]?.word}
                  </h2>
                  <p className="text-xl text-gray-500 mb-2">
                    [{vocabulary[currentWord]?.pinyin}]
                  </p>
                  <p className="text-lg text-gray-700">
                    {vocabulary[currentWord]?.meaning}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 mb-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => playAudio(vocabulary[currentWord]?.word)}
                  >
                    <Volume2 className="h-5 w-5 mr-2" /> Nghe phát âm
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentWord(currentWord > 0 ? currentWord - 1 : 0)}
                    disabled={currentWord === 0}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>

                {/* Recording Button */}
                <div className="mb-6">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all mx-auto ${
                      isRecording 
                        ? 'bg-red-500 animate-pulse' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="h-12 w-12 text-white" />
                    ) : (
                      <Mic className="h-12 w-12 text-white" />
                    )}
                  </button>
                  <p className="mt-4 text-gray-600">
                    {isRecording 
                      ? `Đang ghi... ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
                      : 'Nhấn để ghi âm'}
                  </p>
                </div>

                <p className="text-sm text-gray-500">
                  Nhấn vào microphone và đọc to từ tiếng Hoa bên trên
                </p>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Mic className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có từ vựng</h3>
                <p className="text-gray-500">Chọn cấp độ HSK để bắt đầu luyện nói</p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
