export interface Transaction {
  readonly id: string;
  readonly product: string;
  readonly variant: string;
  readonly status: 'Success' | 'Pending' | 'Failed';
  readonly amount: number;
}

export interface Employee {
  readonly id: string;
  readonly initials: string;
  readonly name: string;
  readonly products: number;
  readonly revenue: number;
  readonly avatarColor: string;
}

export interface WatchlistEntry {
  readonly symbol: string;       // Finnhub symbol (e.g. 'BINANCE:BTCUSDT')
  readonly displaySymbol: string; // Short label (e.g. 'BTC/USDT')
  readonly displayName: string;
  readonly initials: string;
  readonly avatarColor: string;
}

export interface PriceState {
  readonly current: number;
  readonly previous: number;
  readonly volume: number;
  readonly timestamp: number;
}

export interface StockQuote extends WatchlistEntry {
  readonly price: number;
  readonly change: number;
  readonly changePct: number;
  readonly volume: number;
  readonly timestamp: number;
  readonly hasData: boolean;
}
