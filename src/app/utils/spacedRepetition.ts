// Spaced Repetition System (SM-2 Algorithm)
import { offlineStorage } from './offlineStorage';

export interface FlashCard {
  id: string;
  front: string; // Chinese
  back: string; // Vietnamese
  pinyin: string;
  example?: string;
  category: string;
  tags: string[];
  createdAt: Date;
}

export interface CardReview {
  cardId: string;
  easeFactor: number; // 1.3 - 2.5
  interval: number; // days
  repetitions: number;
  nextReview: Date;
  lastReview?: Date;
  quality: number; // 0-5 (SM-2)
}

class SpacedRepetitionSystem {
  private readonly CARDS_KEY = 'hoangu-flashcards';
  private readonly REVIEWS_KEY = 'hoangu-card-reviews';

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // Create flashcard
  createCard(card: Omit<FlashCard, 'id' | 'createdAt'>): FlashCard {
    const newCard: FlashCard = {
      ...card,
      id: this.generateId(),
      createdAt: new Date()
    };

    const cards = this.getAllCards();
    cards.push(newCard);
    offlineStorage.set(this.CARDS_KEY, cards);

    // Initialize review data
    this.initializeReview(newCard.id);

    return newCard;
  }

  // Get all cards
  getAllCards(): FlashCard[] {
    return offlineStorage.get<FlashCard[]>(this.CARDS_KEY) || [];
  }

  // Get cards by category
  getCardsByCategory(category: string): FlashCard[] {
    return this.getAllCards().filter(c => c.category === category);
  }

  // Get due cards for review
  getDueCards(): FlashCard[] {
    const reviews = this.getAllReviews();
    const now = new Date();
    
    const dueCardIds = reviews
      .filter(r => new Date(r.nextReview) <= now)
      .map(r => r.cardId);

    return this.getAllCards().filter(c => dueCardIds.includes(c.id));
  }

  // Get new cards (never reviewed)
  getNewCards(limit: number = 10): FlashCard[] {
    const reviews = this.getAllReviews();
    const reviewedIds = new Set(reviews.map(r => r.cardId));
    
    return this.getAllCards()
      .filter(c => !reviewedIds.has(c.id))
      .slice(0, limit);
  }

  // Initialize review data for new card
  private initializeReview(cardId: string): void {
    const review: CardReview = {
      cardId,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: new Date(),
      quality: 0
    };

    const reviews = this.getAllReviews();
    reviews.push(review);
    offlineStorage.set(this.REVIEWS_KEY, reviews);
  }

  // Review card with SM-2 algorithm
  reviewCard(cardId: string, quality: number): void {
    // quality: 0-5
    // 5: Perfect recall
    // 4: Correct with hesitation
    // 3: Correct with difficulty
    // 2: Incorrect but remembered
    // 1: Incorrect, vague memory
    // 0: Complete blackout

    const reviews = this.getAllReviews();
    const review = reviews.find(r => r.cardId === cardId);

    if (!review) {
      console.error('Review not found for card:', cardId);
      return;
    }

    // SM-2 Algorithm
    if (quality >= 3) {
      // Correct response
      if (review.repetitions === 0) {
        review.interval = 1;
      } else if (review.repetitions === 1) {
        review.interval = 6;
      } else {
        review.interval = Math.round(review.interval * review.easeFactor);
      }
      review.repetitions++;
    } else {
      // Incorrect response - reset
      review.repetitions = 0;
      review.interval = 1;
    }

    // Update ease factor
    review.easeFactor = Math.max(
      1.3,
      review.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Set next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + review.interval);
    review.nextReview = nextReview;
    review.lastReview = new Date();
    review.quality = quality;

    offlineStorage.set(this.REVIEWS_KEY, reviews);
  }

  // Get all reviews
  getAllReviews(): CardReview[] {
    return offlineStorage.get<CardReview[]>(this.REVIEWS_KEY) || [];
  }

  // Get review for specific card
  getCardReview(cardId: string): CardReview | null {
    return this.getAllReviews().find(r => r.cardId === cardId) || null;
  }

  // Get review stats
  getStats() {
    const reviews = this.getAllReviews();
    const now = new Date();

    const newCards = this.getNewCards(100).length;
    const dueCards = reviews.filter(r => new Date(r.nextReview) <= now).length;
    const totalCards = this.getAllCards().length;
    const masteredCards = reviews.filter(r => r.repetitions >= 5 && r.easeFactor >= 2.5).length;

    return {
      newCards,
      dueCards,
      totalCards,
      masteredCards,
      learningCards: totalCards - newCards - masteredCards
    };
  }

  // Import predefined cards
  importPredefinedCards(): void {
    const existingCards = this.getAllCards();
    if (existingCards.length > 0) return; // Don't import if cards exist

    const predefinedCards = [
      // HSK 1 Basic
      { front: '你好', back: 'Xin chào', pinyin: 'nǐ hǎo', category: 'HSK 1', tags: ['greetings', 'basic'] },
      { front: '谢谢', back: 'Cảm ơn', pinyin: 'xièxie', category: 'HSK 1', tags: ['greetings', 'basic'] },
      { front: '再见', back: 'Tạm biệt', pinyin: 'zàijiàn', category: 'HSK 1', tags: ['greetings', 'basic'] },
      { front: '对不起', back: 'Xin lỗi', pinyin: 'duìbuqǐ', category: 'HSK 1', tags: ['greetings', 'basic'] },
      { front: '没关系', back: 'Không sao', pinyin: 'méi guānxi', category: 'HSK 1', tags: ['greetings', 'basic'] },
      
      // Numbers
      { front: '一', back: 'Một', pinyin: 'yī', category: 'HSK 1', tags: ['numbers'] },
      { front: '二', back: 'Hai', pinyin: 'èr', category: 'HSK 1', tags: ['numbers'] },
      { front: '三', back: 'Ba', pinyin: 'sān', category: 'HSK 1', tags: ['numbers'] },
      { front: '四', back: 'Bốn', pinyin: 'sì', category: 'HSK 1', tags: ['numbers'] },
      { front: '五', back: 'Năm', pinyin: 'wǔ', category: 'HSK 1', tags: ['numbers'] },
      
      // Family
      { front: '爸爸', back: 'Bố', pinyin: 'bàba', category: 'HSK 1', tags: ['family'] },
      { front: '妈妈', back: 'Mẹ', pinyin: 'māma', category: 'HSK 1', tags: ['family'] },
      { front: '哥哥', back: 'Anh trai', pinyin: 'gēge', category: 'HSK 1', tags: ['family'] },
      { front: '姐姐', back: 'Chị gái', pinyin: 'jiějie', category: 'HSK 1', tags: ['family'] },
      { front: '弟弟', back: 'Em trai', pinyin: 'dìdi', category: 'HSK 1', tags: ['family'] },
      
      // Common verbs
      { front: '是', back: 'Là', pinyin: 'shì', category: 'HSK 1', tags: ['verbs', 'basic'] },
      { front: '有', back: 'Có', pinyin: 'yǒu', category: 'HSK 1', tags: ['verbs', 'basic'] },
      { front: '去', back: 'Đi', pinyin: 'qù', category: 'HSK 1', tags: ['verbs', 'basic'] },
      { front: '来', back: 'Đến', pinyin: 'lái', category: 'HSK 1', tags: ['verbs', 'basic'] },
      { front: '吃', back: 'Ăn', pinyin: 'chī', category: 'HSK 1', tags: ['verbs', 'basic'] },
      
      // HSK 2
      { front: '学习', back: 'Học tập', pinyin: 'xuéxí', category: 'HSK 2', tags: ['verbs'] },
      { front: '工作', back: 'Làm việc', pinyin: 'gōngzuò', category: 'HSK 2', tags: ['verbs'] },
      { front: '时间', back: 'Thời gian', pinyin: 'shíjiān', category: 'HSK 2', tags: ['nouns'] },
      { front: '地方', back: 'Địa điểm', pinyin: 'dìfang', category: 'HSK 2', tags: ['nouns'] },
      { front: '问题', back: 'Vấn đề', pinyin: 'wèntí', category: 'HSK 2', tags: ['nouns'] },
    ];

    predefinedCards.forEach(card => this.createCard(card));
  }
}

export const spacedRepetition = new SpacedRepetitionSystem();
