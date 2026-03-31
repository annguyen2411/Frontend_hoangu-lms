import { useState, useEffect } from 'react';
import { BookOpen, Check, X, Volume2, Bookmark, Play, ChevronRight, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  question: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Vocabulary {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
  example_sentence: string;
  audio_url: string;
}

export function Practice() {
  const { user, isAuthenticated } = useAuth();
  const [lessonId, setLessonId] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'exercises' | 'vocabulary'>('exercises');

  useEffect(() => {
    if (lessonId) {
      loadContent();
    }
  }, [lessonId]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [exRes, vocRes] = await Promise.all([
        api.student.getExercises(lessonId),
        api.student.getVocabulary(lessonId),
      ]);
      if (exRes.success) setExercises(exRes.data);
      if (vocRes.success) setVocabulary(vocRes.data);
    } catch (err) {
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !exercises[currentExercise]) return;
    
    try {
      const res = await api.student.submitExercise(exercises[currentExercise].id, selectedAnswer);
      if (res.success) {
        setIsCorrect(res.data.is_correct);
        setShowResult(true);
      }
    } catch (err) {
      console.error('Error submitting:', err);
    }
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      toast.success('Hoàn thành tất cả bài tập!');
    }
  };

  const handleSaveVocabulary = async (vocabId: string) => {
    try {
      await api.student.saveVocabulary(vocabId);
      toast.success('Đã lưu từ vựng!');
    } catch (err) {
      toast.error('Lỗi khi lưu');
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(() => {});
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập để luyện tập</h2>
          <p className="text-gray-600">Bạn cần đăng nhập để sử dụng tính năng này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Luyện tập</h1>
          <p className="text-gray-600 mt-1">Bài tập ngữ pháp và từ vựng</p>
        </div>

        {/* Lesson Selection */}
        <Card className="p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn bài học</label>
          <div className="flex gap-2">
            <Input
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              placeholder="Nhập ID bài học..."
              className="flex-1"
            />
            <Button onClick={loadContent}>Tải bài tập</Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'exercises' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" /> Bài tập ngữ pháp
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'vocabulary' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            <Volume2 className="h-4 w-4 inline mr-2" /> Từ vựng
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : activeTab === 'exercises' ? (
          /* Grammar Exercises */
          exercises.length > 0 ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  Câu {currentExercise + 1} / {exercises.length}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {exercises[currentExercise]?.question_type === 'multiple_choice' ? 'Trắc nghiệm' : 
                   exercises[currentExercise]?.question_type === 'fill_blank' ? 'Điền từ' : 'Sắp xếp'}
                </span>
              </div>

              <h2 className="text-xl font-semibold mb-6">{exercises[currentExercise]?.question}</h2>

              {exercises[currentExercise]?.options?.length > 0 && (
                <div className="space-y-3 mb-6">
                  {exercises[currentExercise].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => !showResult && setSelectedAnswer(option)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        showResult
                          ? option === exercises[currentExercise].correct_answer
                            ? 'border-green-500 bg-green-50'
                            : option === selectedAnswer
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                          : selectedAnswer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {showResult && (
                <div className={`p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />}
                    <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
                    </span>
                  </div>
                  {exercises[currentExercise]?.explanation && (
                    <p className="text-sm text-gray-600">{exercises[currentExercise].explanation}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                {!showResult ? (
                  <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="flex-1">
                    Kiểm tra
                  </Button>
                ) : (
                  <Button onClick={nextExercise} className="flex-1">
                    {currentExercise < exercises.length - 1 ? (
                      <>Tiếp theo <ChevronRight className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>Hoàn thành</>
                    )}
                  </Button>
                )}
                <Button variant="outline" onClick={() => { setCurrentExercise(0); setSelectedAnswer(''); setShowResult(false); }}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bài tập</h3>
              <p className="text-gray-500">Nhập ID bài học để tải bài tập</p>
            </Card>
          )
        ) : (
          /* Vocabulary */
          vocabulary.length > 0 ? (
            <div className="grid gap-4">
              {vocabulary.map((word) => (
                <Card key={word.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                        {word.pinyin && (
                          <span className="text-gray-500">[{word.pinyin}]</span>
                        )}
                        {word.audio_url && (
                          <button onClick={() => playAudio(word.audio_url)} className="p-1 hover:bg-gray-100 rounded">
                            <Volume2 className="h-4 w-4 text-blue-600" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{word.meaning}</p>
                      {word.example_sentence && (
                        <p className="text-sm text-gray-500 italic">"{word.example_sentence}"</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleSaveVocabulary(word.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Bookmark className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Volume2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có từ vựng</h3>
              <p className="text-gray-500">Nhập ID bài học để tải từ vựng</p>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
