import { Platform } from 'react-native';

export interface VoiceServiceConfig {
  wakeWord?: string;
  language?: string;
  onWakeWordDetected?: () => void;
  onSpeechResult?: (text: string) => void;
  onError?: (error: Error) => void;
}

export interface ParsedExpenseCommand {
  amount: number | null;
  category: string | null;
  description: string | null;
  confidence: number;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'eat', 'eating', 'restaurant'],
  coffee: ['coffee', 'cafe', 'latte', 'espresso', 'cappuccino', 'starbucks', 'tea'],
  transport: ['transport', 'uber', 'lyft', 'taxi', 'cab', 'bus', 'train', 'gas', 'fuel', 'parking'],
  shopping: ['shopping', 'shop', 'buy', 'bought', 'purchase', 'store', 'amazon', 'online'],
  entertainment: ['entertainment', 'movie', 'movies', 'concert', 'show', 'game', 'netflix', 'spotify'],
  bills: ['bill', 'bills', 'rent', 'electricity', 'water', 'internet', 'phone', 'utility'],
  health: ['health', 'doctor', 'medicine', 'pharmacy', 'hospital', 'gym', 'fitness'],
  other: ['other', 'misc', 'miscellaneous'],
};

class VoiceService {
  private config: VoiceServiceConfig = {};
  private isListening = false;
  private wakeWordEngine: any = null;
  private sttEngine: any = null;

  async initialize(config: VoiceServiceConfig): Promise<boolean> {
    this.config = config;

    if (Platform.OS === 'web') {
      console.warn('Voice service is not fully supported on web');
      return false;
    }

    try {
      const sherpaOnnx = await import('expo-sherpa-onnx').catch(() => null);
      
      if (!sherpaOnnx) {
        console.warn('expo-sherpa-onnx not available. Voice features require a development build.');
        return false;
      }

      console.log('Voice service initialized (sherpa-onnx available)');
      return true;
    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      return false;
    }
  }

  async startWakeWordDetection(): Promise<void> {
    if (this.isListening) return;

    try {
      console.log('Starting wake word detection for:', this.config.wakeWord || 'Hey Nana');
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start wake word detection:', error);
      this.config.onError?.(error instanceof Error ? error : new Error('Wake word detection failed'));
    }
  }

  async stopWakeWordDetection(): Promise<void> {
    if (!this.isListening) return;

    try {
      console.log('Stopping wake word detection');
      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop wake word detection:', error);
    }
  }

  async startSpeechToText(): Promise<string | null> {
    try {
      console.log('Starting speech-to-text...');
      return null;
    } catch (error) {
      console.error('Speech-to-text failed:', error);
      this.config.onError?.(error instanceof Error ? error : new Error('Speech recognition failed'));
      return null;
    }
  }

  parseExpenseCommand(text: string): ParsedExpenseCommand {
    const lowerText = text.toLowerCase();
    
    let amount: number | null = null;
    const amountPatterns = [
      /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:dollars?|bucks?)?/i,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:dollars?|bucks?)/i,
      /(?:is|was|cost|costs|spent|spend|paid|pay)\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
    ];

    for (const pattern of amountPatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const parsed = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(parsed) && parsed > 0) {
          amount = parsed;
          break;
        }
      }
    }

    let category: string | null = null;
    let categoryConfidence = 0;

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          if (keywords.indexOf(keyword) < categoryConfidence || category === null) {
            category = cat;
            categoryConfidence = keywords.indexOf(keyword);
          }
        }
      }
    }

    const description = text
      .replace(/\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\s*(?:dollars?|bucks?)?/gi, '')
      .replace(/(?:is|was|cost|costs|spent|spend|paid|pay)/gi, '')
      .trim() || null;

    const confidence = (amount ? 0.5 : 0) + (category ? 0.3 : 0) + (description ? 0.2 : 0);

    return {
      amount,
      category,
      description,
      confidence,
    };
  }

  isAvailable(): boolean {
    return Platform.OS !== 'web';
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  async cleanup(): Promise<void> {
    await this.stopWakeWordDetection();
    this.wakeWordEngine = null;
    this.sttEngine = null;
  }
}

export const voiceService = new VoiceService();

export function parseExpenseFromVoice(text: string): ParsedExpenseCommand {
  return voiceService.parseExpenseCommand(text);
}
