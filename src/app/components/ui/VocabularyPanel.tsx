import { useState } from 'react';
import { 
  BookOpen, Search, Plus, RotateCcw, Volume2, Check, X, 
  ChevronLeft, ChevronRight, Star, Bookmark, Play, Shuffle
} from 'lucide-react';

interface VocabularyItem {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
  example?: string;
  example_translation?: string;
  audio_url?: string;
}

interface VocabularyPanelProps {
  vocabulary: VocabularyItem[];
  lessonId: string;
  onSaveWord?: (word: VocabularyItem) => void;
  savedWords?: string[];
}

export function VocabularyPanel({ vocabulary, lessonId, onSaveWord, savedWords = [] }: VocabularyPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<VocabularyItem[]>([]);
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set());

  const filteredVocab = vocabulary.filter(v => 
    v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const playAudio = (word: VocabularyItem) => {
    if (word.audio_url) {
      new Audio(word.audio_url).play();
    } else {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'zh-CN';
      speechSynthesis.speak(utterance);
    }
  };

  const startFlashcards = () => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setFlashcardMode(true);
  };

  const nextCard = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const markKnown = (wordId: string) => {
    setKnownWords(prev => new Set(prev).add(wordId));
    nextCard();
  };

  const shuffleCards = () => {
    setShuffledCards([...shuffledCards].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (flashcardMode && shuffledCards.length > 0) {
    const currentCard = shuffledCards[currentCardIndex];
    const isKnown = knownWords.has(currentCard.id);

    return (
      <div className="bg-slate-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            Flashcards ({currentCardIndex + 1}/{shuffledCards.length})
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={shuffleCards}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Xáo trộn"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setFlashcardMode(false)}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div 
            className={`min-h-[200px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-8 text-center cursor-pointer transition-all ${
              showAnswer ? 'ring-2 ring-purple-500' : 'hover:ring-2 hover:ring-purple-500/50'
            }`}
            onClick={() => !showAnswer && setShowAnswer(true)}
          >
            {!showAnswer ? (
              <>
                <p className="text-3xl font-bold text-white mb-2">{currentCard.word}</p>
                <p className="text-white/60">{currentCard.pinyin}</p>
                <p className="text-white/40 text-sm mt-4">Click để xem nghĩa</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-white mb-2">{currentCard.word}</p>
                <p className="text-purple-400 mb-2">{currentCard.pinyin}</p>
                <p className="text-white text-lg mb-4">{currentCard.meaning}</p>
                {currentCard.example && (
                  <div className="bg-black/20 rounded-lg p-3 mt-4">
                    <p className="text-white/80">{currentCard.example}</p>
                    {currentCard.example_translation && (
                      <p className="text-white/50 text-sm mt-1">{currentCard.example_translation}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {showAnswer && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="p-3 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => markKnown(currentCard.id)}
                disabled={isKnown}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  isKnown 
                    ? 'bg-green-500/30 text-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Check className="h-5 w-5" />
                {isKnown ? 'Đã biết' : 'Biết rồi'}
              </button>
              <button
                onClick={nextCard}
                disabled={currentCardIndex === shuffledCards.length - 1}
                className="p-3 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button 
              onClick={playAudio}
              className="p-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-white/40">
          <span>Đã biết: {knownWords.size}/{shuffledCards.length}</span>
          <div className="flex gap-1">
            {shuffledCards.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${
                  i === currentCardIndex ? 'bg-purple-500' :
                  i < currentCardIndex ? 'bg-green-500' :
                  'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Tìm từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        {vocabulary.length > 0 && (
          <button
            onClick={startFlashcards}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Flashcards
          </button>
        )}
      </div>

      {/* Word List */}
      {filteredVocab.length === 0 ? (
        <div className="text-center py-8 text-white/40">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có từ vựng cho bài học này</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredVocab.map((word) => (
            <div
              key={word.id}
              className={`p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${
                selectedWord?.id === word.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedWord(word)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(word);
                    }}
                    className="p-1.5 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                  <div>
                    <p className="text-white font-medium">{word.word}</p>
                    <p className="text-white/50 text-sm">{word.pinyin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-white/70 text-sm">{word.meaning}</p>
                  {onSaveWord && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveWord(word);
                      }}
                      className={`p-1.5 rounded transition-colors ${
                        savedWords.includes(word.id)
                          ? 'text-yellow-400'
                          : 'text-white/40 hover:text-yellow-400'
                      }`}
                    >
                      <Bookmark className="h-4 w-4" fill={savedWords.includes(word.id) ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Word Detail */}
      {selectedWord && (
        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold">{selectedWord.word}</h4>
            <button onClick={() => setSelectedWord(null)} className="text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-purple-400 mb-2">{selectedWord.pinyin}</p>
          <p className="text-white/80 mb-3">{selectedWord.meaning}</p>
          {selectedWord.example && (
            <div className="bg-black/20 rounded p-3">
              <p className="text-white/80">{selectedWord.example}</p>
              {selectedWord.example_translation && (
                <p className="text-white/50 text-sm mt-1">{selectedWord.example_translation}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
