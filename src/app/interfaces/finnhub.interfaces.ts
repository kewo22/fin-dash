export interface FinnhubQuote {
  readonly c: number;  // current price
  readonly o: number;  // open price
  readonly h: number;  // day high
  readonly l: number;  // day low
  readonly pc: number; // previous close
  readonly t: number;  // timestamp (epoch seconds)
}

export interface ChartPoint {
  readonly time: number; // epoch ms
  readonly price: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
}

export interface QuoteSnapshot {
  readonly symbol: string;
  readonly currentPrice: number;
  readonly openPrice: number;
  readonly dayHigh: number;
  readonly dayLow: number;
  readonly prevClose: number;
  readonly change: number;
  readonly changePct: number;
  readonly updatedAt: number;
}

export interface TradeDto {
  readonly price: number;
  readonly symbol: string;
  readonly timestamp: number;
  readonly volume: number;
}

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';
