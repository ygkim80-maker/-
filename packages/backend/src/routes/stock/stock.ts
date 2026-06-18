import { Router, Request, Response } from 'express';
import yahooFinance from 'yahoo-finance2';

const router = Router();

interface StockInfo {
  symbol: string;
  name: string;
  market: string;
}

const MARKET_STOCKS: Record<string, StockInfo[]> = {
  kospi: [
    { symbol: '005930.KS', name: '삼성전자', market: 'KOSPI' },
    { symbol: '000660.KS', name: 'SK하이닉스', market: 'KOSPI' },
    { symbol: '373220.KS', name: 'LG에너지솔루션', market: 'KOSPI' },
    { symbol: '005380.KS', name: '현대자동차', market: 'KOSPI' },
    { symbol: '006400.KS', name: '삼성SDI', market: 'KOSPI' },
    { symbol: '035420.KS', name: 'NAVER', market: 'KOSPI' },
    { symbol: '035720.KS', name: '카카오', market: 'KOSPI' },
    { symbol: '005490.KS', name: 'POSCO홀딩스', market: 'KOSPI' },
    { symbol: '207940.KS', name: '삼성바이오로직스', market: 'KOSPI' },
    { symbol: '105560.KS', name: 'KB금융', market: 'KOSPI' },
    { symbol: '055550.KS', name: '신한지주', market: 'KOSPI' },
    { symbol: '000270.KS', name: '기아', market: 'KOSPI' },
    { symbol: '051910.KS', name: 'LG화학', market: 'KOSPI' },
    { symbol: '068270.KS', name: '셀트리온', market: 'KOSPI' },
    { symbol: '028260.KS', name: '삼성물산', market: 'KOSPI' },
  ],
  sp500: [
    { symbol: 'AAPL', name: 'Apple', market: 'S&P 500' },
    { symbol: 'MSFT', name: 'Microsoft', market: 'S&P 500' },
    { symbol: 'GOOGL', name: 'Alphabet', market: 'S&P 500' },
    { symbol: 'AMZN', name: 'Amazon', market: 'S&P 500' },
    { symbol: 'NVDA', name: 'NVIDIA', market: 'S&P 500' },
    { symbol: 'META', name: 'Meta Platforms', market: 'S&P 500' },
    { symbol: 'TSLA', name: 'Tesla', market: 'S&P 500' },
    { symbol: 'BRK-B', name: 'Berkshire Hathaway', market: 'S&P 500' },
    { symbol: 'JPM', name: 'JPMorgan Chase', market: 'S&P 500' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', market: 'S&P 500' },
    { symbol: 'V', name: 'Visa', market: 'S&P 500' },
    { symbol: 'UNH', name: 'UnitedHealth', market: 'S&P 500' },
    { symbol: 'XOM', name: 'Exxon Mobil', market: 'S&P 500' },
    { symbol: 'WMT', name: 'Walmart', market: 'S&P 500' },
    { symbol: 'PG', name: 'Procter & Gamble', market: 'S&P 500' },
  ],
  nasdaq: [
    { symbol: 'NVDA', name: 'NVIDIA', market: 'NASDAQ' },
    { symbol: 'AAPL', name: 'Apple', market: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft', market: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon', market: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet', market: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms', market: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla', market: 'NASDAQ' },
    { symbol: 'AVGO', name: 'Broadcom', market: 'NASDAQ' },
    { symbol: 'NFLX', name: 'Netflix', market: 'NASDAQ' },
    { symbol: 'AMD', name: 'AMD', market: 'NASDAQ' },
    { symbol: 'COST', name: 'Costco', market: 'NASDAQ' },
    { symbol: 'ADBE', name: 'Adobe', market: 'NASDAQ' },
    { symbol: 'CRM', name: 'Salesforce', market: 'NASDAQ' },
    { symbol: 'INTC', name: 'Intel', market: 'NASDAQ' },
    { symbol: 'QCOM', name: 'Qualcomm', market: 'NASDAQ' },
  ],
};

const INDEX_SYMBOLS: Record<string, string> = {
  kospi: '^KS11',
  sp500: '^GSPC',
  nasdaq: '^IXIC',
};

const INDEX_NAMES: Record<string, string> = {
  kospi: 'KOSPI',
  sp500: 'S&P 500',
  nasdaq: 'NASDAQ',
};

interface QuoteResult {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketCap: number | null;
  sharesOutstanding: number | null;
  per: number | null;
  pbr: number | null;
  volume: number | null;
  high52w: number | null;
  low52w: number | null;
  prevClose: number | null;
  currency: string;
}

async function fetchQuotes(symbols: string[]): Promise<Map<string, any>> {
  const results = new Map<string, any>();
  const batchFetch = async (syms: string[]) => {
    const quotes: any = await (yahooFinance as any).quote(syms);
    const quoteArray = Array.isArray(quotes) ? quotes : [quotes];
    for (const q of quoteArray) {
      if (q && q.symbol) {
        results.set(q.symbol, q);
      }
    }
  };

  try {
    await batchFetch(symbols);
  } catch {
    for (const symbol of symbols) {
      try {
        const q: any = await (yahooFinance as any).quote(symbol);
        if (q && q.symbol) {
          results.set(q.symbol, q);
        }
      } catch {
        // skip individual failures
      }
    }
  }
  return results;
}

function mapQuote(raw: any, stockInfo: StockInfo): QuoteResult {
  return {
    symbol: stockInfo.symbol,
    name: stockInfo.name,
    price: raw?.regularMarketPrice ?? null,
    change: raw?.regularMarketChange ?? null,
    changePercent: raw?.regularMarketChangePercent ?? null,
    marketCap: raw?.marketCap ?? null,
    sharesOutstanding: raw?.sharesOutstanding ?? null,
    per: raw?.trailingPE ?? null,
    pbr: raw?.priceToBook ?? null,
    volume: raw?.regularMarketVolume ?? null,
    high52w: raw?.fiftyTwoWeekHigh ?? null,
    low52w: raw?.fiftyTwoWeekLow ?? null,
    prevClose: raw?.regularMarketPreviousClose ?? null,
    currency: raw?.currency || (stockInfo.market === 'KOSPI' ? 'KRW' : 'USD'),
  };
}

router.get('/quotes', async (req: Request, res: Response) => {
  const market = (req.query.market as string) || 'kospi';
  const stocks = MARKET_STOCKS[market];
  if (!stocks) {
    res.status(400).json({ error: `Invalid market: ${market}. Use kospi, sp500, or nasdaq.` });
    return;
  }

  try {
    const symbols = stocks.map((s) => s.symbol);
    const indexSymbol = INDEX_SYMBOLS[market];
    const allSymbols = [indexSymbol, ...symbols];

    const quotesMap = await fetchQuotes(allSymbols);

    const indexRaw = quotesMap.get(indexSymbol);
    const index = {
      name: INDEX_NAMES[market],
      symbol: indexSymbol,
      price: indexRaw?.regularMarketPrice ?? null,
      change: indexRaw?.regularMarketChange ?? null,
      changePercent: indexRaw?.regularMarketChangePercent ?? null,
      prevClose: indexRaw?.regularMarketPreviousClose ?? null,
      high52w: indexRaw?.fiftyTwoWeekHigh ?? null,
      low52w: indexRaw?.fiftyTwoWeekLow ?? null,
    };

    const quotes: QuoteResult[] = stocks.map((stock) => {
      const raw = quotesMap.get(stock.symbol);
      return mapQuote(raw, stock);
    });

    res.json({
      market,
      index,
      quotes,
      updatedAt: new Date().toISOString(),
      isLive: quotesMap.size > 0,
    });
  } catch (err: any) {
    console.error('[stock] Error fetching quotes:', err.message);
    res.status(500).json({ error: 'Failed to fetch stock data', detail: err.message });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query || query.length < 1) {
    res.json({ results: [] });
    return;
  }

  try {
    const results: any = await (yahooFinance as any).search(query);
    const stocks = (results.quotes || [])
      .filter((q: any) => q.quoteType === 'EQUITY')
      .slice(0, 10)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
      }));
    res.json({ results: stocks });
  } catch (err: any) {
    res.status(500).json({ error: 'Search failed', detail: err.message });
  }
});

router.get('/detail/:symbol', async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    const [quote, summary]: [any, any] = await Promise.all([
      (yahooFinance as any).quote(symbol),
      (yahooFinance as any).quoteSummary(symbol, { modules: ['price', 'defaultKeyStatistics', 'financialData'] }).catch(() => null),
    ]);

    const keyStats = summary?.defaultKeyStatistics;
    const financialData = summary?.financialData;

    res.json({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      marketCap: quote.marketCap,
      sharesOutstanding: quote.sharesOutstanding,
      per: quote.trailingPE,
      forwardPer: quote.forwardPE,
      pbr: quote.priceToBook,
      volume: quote.regularMarketVolume,
      avgVolume: quote.averageDailyVolume3Month,
      high52w: quote.fiftyTwoWeekHigh,
      low52w: quote.fiftyTwoWeekLow,
      prevClose: quote.regularMarketPreviousClose,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      currency: quote.currency,
      eps: keyStats?.trailingEps ?? null,
      beta: keyStats?.beta ?? null,
      dividendYield: quote.dividendYield ?? null,
      roe: financialData?.returnOnEquity ?? null,
      debtToEquity: financialData?.debtToEquity ?? null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch stock detail', detail: err.message });
  }
});

export default router;
