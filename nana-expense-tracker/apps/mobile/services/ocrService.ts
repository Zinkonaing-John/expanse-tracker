import { Platform } from 'react-native';

export interface OcrResult {
  text: string;
  blocks: TextBlock[];
}

export interface TextBlock {
  text: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export async function extractTextFromImage(imageUri: string): Promise<OcrResult> {
  if (Platform.OS === 'web') {
    console.warn('OCR is not supported on web');
    return { text: '', blocks: [] };
  }

  try {
    const { recognizeText } = await import('expo-ocr-kit');
    const result = await recognizeText(imageUri);
    
    return {
      text: result.text || '',
      blocks: result.blocks?.map((block: any) => ({
        text: block.text,
        boundingBox: block.frame ? {
          x: block.frame.x,
          y: block.frame.y,
          width: block.frame.width,
          height: block.frame.height,
        } : undefined,
      })) || [],
    };
  } catch (error) {
    console.error('OCR failed:', error);
    throw new Error('Failed to extract text from image. Make sure expo-ocr-kit is properly installed.');
  }
}

export function extractPricesFromText(text: string): number[] {
  const pricePatterns = [
    /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)/gi,
    /(?:total|amount|price|cost|sum|pay|due)[\s:]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    /(\d{1,3}(?:,\d{3})*\.\d{2})/g,
  ];

  const prices: number[] = [];
  const seen = new Set<number>();

  for (const pattern of pricePatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      const priceStr = match[1] || match[0];
      const cleaned = priceStr.replace(/[$,]/g, '').trim();
      const price = parseFloat(cleaned);
      
      if (!isNaN(price) && price > 0 && price < 100000 && !seen.has(price)) {
        seen.add(price);
        prices.push(price);
      }
    }
  }

  return prices.sort((a, b) => b - a);
}

export function findLikelyTotal(prices: number[], text: string): number | null {
  if (prices.length === 0) return null;
  
  const lowerText = text.toLowerCase();
  const totalKeywords = ['total', 'amount due', 'grand total', 'balance', 'sum', 'pay'];
  
  for (const keyword of totalKeywords) {
    const keywordIndex = lowerText.indexOf(keyword);
    if (keywordIndex !== -1) {
      const nearbyText = lowerText.substring(keywordIndex, keywordIndex + 50);
      const priceMatch = nearbyText.match(/\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(/,/g, ''));
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }
  }

  return prices[0];
}

export async function processReceiptImage(imageUri: string): Promise<{
  extractedText: string;
  prices: number[];
  suggestedTotal: number | null;
}> {
  const result = await extractTextFromImage(imageUri);
  const prices = extractPricesFromText(result.text);
  const suggestedTotal = findLikelyTotal(prices, result.text);

  return {
    extractedText: result.text,
    prices,
    suggestedTotal,
  };
}
