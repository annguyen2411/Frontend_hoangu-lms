import { pool } from '../db/pool';
import logger from './logger';

export interface PronunciationResult {
  score: number;
  transcript: string;
  feedback: string;
  phonemeScores?: PhonemeScore[];
  fluency?: number;
  accuracy?: number;
  completeness?: number;
}

export interface PhonemeScore {
  phoneme: string;
  expected: string;
  score: number;
  feedback: string;
}

export interface AudioAnalysisResult {
  duration: number;
  sampleRate: number;
  volume: number;
  hasSpeech: boolean;
}

class PronunciationService {
  private openaiApiKey: string;
  private enableAI: boolean;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.enableAI = !!this.openaiApiKey;
  }

  async analyzePronunciation(
    audioUrl: string,
    expectedText: string,
    language: string = 'zh-CN'
  ): Promise<PronunciationResult> {
    if (!this.enableAI) {
      return this.getMockPronunciationResult(expectedText);
    }

    try {
      const transcript = await this.transcribeAudio(audioUrl, language);
      
      const comparison = await this.comparePronunciation(expectedText, transcript);
      
      const feedback = await this.generateFeedback(expectedText, transcript, comparison);

      return {
        score: comparison.overallScore,
        transcript,
        feedback,
        fluency: comparison.fluency,
        accuracy: comparison.accuracy,
        completeness: comparison.completeness,
        phonemeScores: comparison.phonemeScores
      };
    } catch (error) {
      logger.error('Pronunciation analysis error:', error);
      return this.getMockPronunciationResult(expectedText);
    }
  }

  private async transcribeAudio(audioUrl: string, language: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'whisper-1',
          file: audioUrl,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json() as { text: string };
      return data.text;
    } catch (error) {
      logger.error('Transcription error:', error);
      return '';
    }
  }

  private async comparePronunciation(expected: string, actual: string): Promise<{
    overallScore: number;
    accuracy: number;
    fluency: number;
    completeness: number;
    phonemeScores: PhonemeScore[];
  }> {
    const expectedChars = expected.split('').filter(c => c.trim());
    const actualChars = actual.split('').filter(c => c.trim());

    let correctChars = 0;
    for (let i = 0; i < Math.min(expectedChars.length, actualChars.length); i++) {
      if (expectedChars[i] === actualChars[i]) {
        correctChars++;
      }
    }

    const accuracy = expectedChars.length > 0 
      ? (correctChars / expectedChars.length) * 100 
      : 0;

    const completeness = actualChars.length > 0 
      ? Math.min(100, (actualChars.length / expectedChars.length) * 100) 
      : 0;

    const fluency = Math.min(100, (accuracy + completeness) / 2);

    const overallScore = Math.round((accuracy * 0.5 + fluency * 0.3 + completeness * 0.2));

    const phonemeScores: PhonemeScore[] = expectedChars.map((char, index) => ({
      phoneme: char,
      expected: char,
      score: index < actualChars.length && actualChars[index] === char ? 100 : 0,
      feedback: index < actualChars.length && actualChars[index] === char 
        ? 'Correct' 
        : index < actualChars.length 
          ? `Expected ${char}, got ${actualChars[index]}` 
          : 'Missing'
    }));

    return {
      overallScore,
      accuracy: Math.round(accuracy),
      fluency: Math.round(fluency),
      completeness: Math.round(completeness),
      phonemeScores
    };
  }

  private async generateFeedback(
    expected: string, 
    actual: string, 
    comparison: { accuracy: number; fluency: number; completeness: number }
  ): Promise<string> {
    const parts: string[] = [];

    if (comparison.accuracy >= 90) {
      parts.push('Excellent pronunciation accuracy!');
    } else if (comparison.accuracy >= 70) {
      parts.push('Good pronunciation. Keep practicing to improve accuracy.');
    } else if (comparison.accuracy >= 50) {
      parts.push('Fair pronunciation. Try to focus on clearer articulation.');
    } else {
      parts.push('Needs improvement. Listen to native speakers and practice more.');
    }

    if (comparison.completeness < 80) {
      parts.push('Try to complete the full phrase when practicing.');
    }

    if (comparison.fluency < 70) {
      parts.push('Work on speaking at a steady pace without pauses.');
    }

    return parts.join(' ');
  }

  private getMockPronunciationResult(expectedText: string): PronunciationResult {
    const charCount = expectedText.length;
    const mockScore = Math.floor(60 + Math.random() * 35);

    return {
      score: mockScore,
      transcript: expectedText,
      feedback: 'AI pronunciation analysis is not configured. Please add OPENAI_API_KEY to enable AI scoring.',
      accuracy: mockScore,
      fluency: Math.floor(mockScore * 0.9),
      completeness: Math.min(100, Math.floor(charCount * 10))
    };
  }

  async analyzeAudio(audioBuffer: Buffer): Promise<AudioAnalysisResult> {
    return {
      duration: 0,
      sampleRate: 16000,
      volume: 0.5,
      hasSpeech: true
    };
  }

  async getPronunciationHistory(userId: string, limit: number = 20) {
    const result = await pool.query(
      `SELECT vp.*, v.word, v.pinyin, v.meaning
       FROM voice_practices vp
       LEFT JOIN vocabulary v ON vp.vocabulary_id = v.id
       WHERE vp.user_id = $1
       ORDER BY vp.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  async getPronunciationStats(userId: string) {
    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_practices,
         AVG(score) as average_score,
         MAX(score) as best_score,
         COUNT(CASE WHEN score >= 80 THEN 1 END) as excellent_count,
         COUNT(CASE WHEN score >= 60 AND score < 80 THEN 1 END) as good_count,
         COUNT(CASE WHEN score < 60 THEN 1 END) as needs_improvement_count,
         AVG(LENGTH(transcript)) as avg_transcript_length
       FROM voice_practices
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  async getLeaderboard(limit: number = 10) {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.avatar_url, 
         COUNT(vp.id) as total_practices,
         AVG(vp.score) as average_score,
         MAX(vp.score) as best_score
       FROM users u
       JOIN voice_practices vp ON u.id = vp.user_id
       GROUP BY u.id
       ORDER BY average_score DESC, total_practices DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

export const pronunciationService = new PronunciationService();
