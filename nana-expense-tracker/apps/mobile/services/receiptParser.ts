/**
 * Extracts prices and a likely total from receipt text.
 *
 * Pure module (no react-native imports) so it can be unit tested in Node.
 * Used when OCR text is available (e.g. pasted text or a future OCR module
 * in a development build).
 */

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
  const totalKeywords = ['grand total', 'amount due', 'total', 'balance', 'sum', 'pay'];

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

export function parseReceiptText(text: string): { prices: number[]; suggestedTotal: number | null } {
  const prices = extractPricesFromText(text);
  return { prices, suggestedTotal: findLikelyTotal(prices, text) };
}
