import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, RotateCcw, Volume2, Play, Mic, 
  ChevronRight, ChevronLeft, HelpCircle, Lightbulb, Target
} from 'lucide-react';

interface Exercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'listening' | 'speaking';
  question: string;
  question_pinyin?: string;
  options?: string[];
  correct_answer: string;
  audio_url?: string;
  image_url?: string;
  explanation?: string;
}

interface InteractiveExercisesProps {
  exercises: Exercise[];
  onSubmit?: (exerciseId: string, answer: string) => Promise<{ correct: boolean; correctAnswer: string; explanation?: string }>;
}

export function InteractiveExercises({ exercises, onSubmit }: InteractiveExercisesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [inputAnswer, setInputAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; correctAnswer: string; explanation?: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: exercises.length });
  const [showHint, setShowHint] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const currentExercise = exercises[currentIndex];
  const isCompleted = currentExercise ? completedExercises.has(currentExercise.id) : false;

  useEffect(() => {
    if (currentExercise?.type === 'listening' && currentExercise.audio_url) {
      playAudio(currentExercise.audio_url);
    }
  }, [currentIndex]);

  const playAudio = (url?: string) => {
    if (url) {
      new Audio(url).play();
    } else if (currentExercise?.correct_answer) {
      const utterance = new SpeechSynthesisUtterance(currentExercise.correct_answer);
      utterance.lang = 'zh-CN';
      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async () => {
    const answer = currentExercise.type === 'fill_blank' ? inputAnswer : selectedAnswer;
    if (!answer.trim()) return;

    setSubmitted(true);
    
    if (onSubmit) {
      const res = await onSubmit(currentExercise.id, answer);
      setResult(res);
      if (res.correct) {
        setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        setCompletedExercises(prev => new Set(prev).add(currentExercise.id));
      }
    } else {
      const isCorrect = answer.toLowerCase().trim() === currentExercise.correct_answer.toLowerCase().trim();
      setResult({
        correct: isCorrect,
        correctAnswer: currentExercise.correct_answer,
        explanation: currentExercise.explanation
      });
      if (isCorrect) {
        setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        setCompletedExercises(prev => new Set(prev).add(currentExercise.id));
      }
    }
  };

  const nextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetState();
    }
  };

  const prevExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedAnswer('');
    setInputAnswer('');
    setSubmitted(false);
    setResult(null);
    setShowHint(false);
  };

  const retryExercise = () => {
    resetState();
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentExercise.id);
      return newSet;
    });
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInputAnswer(currentExercise.correct_answer);
      setSubmitted(true);
      setResult({
        correct: true,
        correctAnswer: currentExercise.correct_answer
      });
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setCompletedExercises(prev => new Set(prev).add(currentExercise.id));
    }, 2000);
  };

  if (!exercises.length) {
    return (
      <div className="text-center py-12 text-white/40">
        <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Chưa có bài tập cho bài học này</p>
        <p className="text-sm mt-2">Hãy hoàn thành video để mở khóa bài tập</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <span className="text-purple-400 font-semibold">{currentIndex + 1}</span>
          </div>
          <div>
            <p className="text-white/60 text-sm">Bài tập</p>
            <p className="text-white font-medium">{exercises.length} câu hỏi</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white/60 text-sm">Điểm</p>
            <p className="text-green-400 font-bold">{score.correct}/{score.total}</p>
          </div>
          <div className="flex gap-1">
            {exercises.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); resetState(); }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-purple-500' :
                  completedExercises.has(exercises[i].id) ? 'bg-green-500' :
                  'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Card */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
        {/* Question */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              currentExercise.type === 'multiple_choice' ? 'bg-blue-500/20 text-blue-400' :
              currentExercise.type === 'fill_blank' ? 'bg-yellow-500/20 text-yellow-400' :
              currentExercise.type === 'listening' ? 'bg-pink-500/20 text-pink-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {currentExercise.type === 'multiple_choice' ? 'Chọn đáp án' :
               currentExercise.type === 'fill_blank' ? 'Điền từ' :
               currentExercise.type === 'listening' ? 'Nghe và chọn' :
               'Nói theo'}
            </span>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-white/40 hover:text-yellow-400 transition-colors"
              title="Gợi ý"
            >
              <Lightbulb className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => playAudio()}
              className="p-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xl text-white font-medium">{currentExercise.question}</p>
              {currentExercise.question_pinyin && (
                <p className="text-white/50 mt-1">{currentExercise.question_pinyin}</p>
              )}
            </div>
          </div>

          {showHint && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                Gợi ý: {currentExercise.correct_answer.charAt(0)}... ({currentExercise.correct_answer.length} ký tự)
              </p>
            </div>
          )}

          {currentExercise.image_url && (
            <img 
              src={currentExercise.image_url} 
              alt="Question" 
              className="mt-4 max-w-xs rounded-lg"
            />
          )}
        </div>

        {/* Answer Input */}
        {currentExercise.type === 'multiple_choice' && currentExercise.options && (
          <div className="grid grid-cols-2 gap-3">
            {currentExercise.options.map((option, i) => (
              <button
                key={i}
                onClick={() => !submitted && setSelectedAnswer(option)}
                disabled={submitted}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  submitted
                    ? option === currentExercise.correct_answer
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : option === selectedAnswer
                        ? 'border-red-500 bg-red-500/20 text-red-400'
                        : 'border-white/10 text-white/40'
                    : selectedAnswer === option
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/10 hover:border-white/30 text-white'
                }`}
              >
                <span className="text-lg">{option}</span>
              </button>
            ))}
          </div>
        )}

        {currentExercise.type === 'fill_blank' && (
          <div className="space-y-3">
            <input
              type="text"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder="Nhập đáp án..."
              disabled={submitted}
              className={`w-full p-4 bg-black/30 border-2 rounded-lg text-white text-center text-xl tracking-widest ${
                submitted
                  ? result?.correct
                    ? 'border-green-500'
                    : 'border-red-500'
                  : 'border-white/10 focus:border-purple-500'
              }`}
            />
            {submitted && !result?.correct && (
              <p className="text-center text-green-400">
                Đáp án đúng: <strong>{currentExercise.correct_answer}</strong>
              </p>
            )}
          </div>
        )}

        {currentExercise.type === 'speaking' && (
          <div className="text-center">
            <button
              onClick={startRecording}
              disabled={submitted || isRecording}
              className={`p-6 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-500 animate-pulse' 
                  : submitted
                    ? 'bg-green-500'
                    : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {isRecording ? (
                <Mic className="h-8 w-8 text-white" />
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </button>
            <p className="text-white/60 mt-3">
              {isRecording ? 'Đang ghi âm...' : submitted ? 'Hoàn thành!' : 'Nhấn để nói'}
            </p>
            {submitted && (
              <p className="text-green-400 mt-2">
                "{currentExercise.correct_answer}"
              </p>
            )}
          </div>
        )}

        {/* Result Feedback */}
        {submitted && result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.correct 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {result.correct ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
              <span className={`font-semibold ${
                result.correct ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.correct ? 'Chính xác!' : 'Chưa đúng'}
              </span>
            </div>
            {result.explanation && (
              <p className="text-white/70 text-sm">{result.explanation}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevExercise}
            disabled={currentIndex === 0}
            className="p-3 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-3">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer && !inputAnswer.trim()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-white/20 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Kiểm tra
              </button>
            ) : result?.correct ? (
              <button
                onClick={nextExercise}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                Tiếp theo <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={retryExercise}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Thử lại
              </button>
            )}
          </div>

          <button
            onClick={nextExercise}
            disabled={currentIndex === exercises.length - 1}
            className="p-3 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
