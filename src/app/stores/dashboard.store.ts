import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { FinnhubRealtimeService } from '../services/finnhub-realtime.service';
import { Transaction, Employee, StockQuote, WatchlistEntry, PriceState } from '../interfaces';
import { FinnhubQuoteService } from '../services/finnhub-quote.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  private readonly finnhub = inject(FinnhubRealtimeService);
  private readonly quoteService = inject(FinnhubQuoteService);

  // ── Watchlist config ───────────────────────────────────────────────────────
  readonly watchlist = signal<WatchlistEntry[]>([
    { symbol: 'AAPL', displaySymbol: 'AAPL', displayName: 'Apple Inc.', initials: 'AAPL', avatarColor: '#6b7280' },
    { symbol: 'AMZN', displaySymbol: 'AMZN', displayName: 'Amazon.com', initials: 'AMZN', avatarColor: '#f97316' },
    { symbol: 'MSFT', displaySymbol: 'MSFT', displayName: 'Microsoft Corp.', initials: 'MSFT', avatarColor: '#3b82f6' },
    { symbol: 'BINANCE:BTCUSDT', displaySymbol: 'BTC/USD', displayName: 'Bitcoin / USDT', initials: 'BTC', avatarColor: '#f59e0b' },
  ]);

  // ── Internal price state (symbol → latest + previous price) ───────────────
  private readonly priceState = signal<Record<string, PriceState>>({});

  // Real-time WS
  readonly wsStatus = this.finnhub.status;

  // ── Real-Time Price Chart (Quote) ─────────────────────────────────────────
  readonly quote = this.quoteService.quote;
  readonly chartHistory = this.quoteService.chartHistory;
  readonly chartLoading = this.quoteService.loading;
  readonly chartError = this.quoteService.error;
  readonly chartSymbol = this.quoteService.symbol;

  setChartSymbol(symbol: string): void {
    this.quoteService.setSymbol(symbol);
  }

  // ── Derived stock quotes ───────────────────────────────────────────────────
  readonly stockQuotes = computed<StockQuote[]>(() => {
    const state = this.priceState();
    return this.watchlist().map((entry) => {
      const data = state[entry.symbol];
      const price = data?.current ?? 0;
      const prev = data?.previous ?? price;
      const change = price - prev;
      const changePct = prev > 0 ? (change / prev) * 100 : 0;
      return {
        ...entry,
        price,
        change,
        changePct,
        volume: data?.volume ?? 0,
        timestamp: data?.timestamp ?? 0,
        hasData: !!data
      };
    });
  });

  // Top gainers sorted by % change descending
  readonly topGainers = computed(() =>
    [...this.stockQuotes()].sort((a, b) => b.changePct - a.changePct)
  );

  // ── KPI Signals ───────────────────────────────────────────────────────────
  readonly kpiBalance = signal(124_254.62);
  readonly kpiBalanceChange = signal(8.2);
  readonly kpiIncome = signal(265_172);
  readonly kpiExpense = signal(98_284);
  readonly kpiTax = signal(46_174);

  // ── Stock Widget ──────────────────────────────────────────────────────────
  readonly stockTotal = signal(13_645);
  readonly stockSoldOut = signal(11_167);
  readonly stockAvailable = signal(2_478);
  readonly stockProgressPct = computed(() =>
    Math.round((this.stockSoldOut() / this.stockTotal()) * 100)
  );

  // ── Transactions ──────────────────────────────────────────────────────────
  readonly transactions = signal<Transaction[]>([
    { id: '476-893', product: 'Premium T-Shirt', variant: '1 Pcs • Size M', status: 'Success', amount: 24.51 },
    { id: '476-892', product: 'Maxim Polo New', variant: '1 Pcs • Size L', status: 'Pending', amount: 14.54 },
    { id: '476-891', product: 'Vintage T-Shirt', variant: '1 Pcs • Size S', status: 'Failed', amount: 32.00 },
    { id: '476-890', product: 'Classic Hoodie', variant: '1 Pcs • Size XL', status: 'Success', amount: 45.99 },
    { id: '476-889', product: 'Sport Jogger', variant: '1 Pcs • Size M', status: 'Pending', amount: 28.75 },
  ]);

  // ── Employees ─────────────────────────────────────────────────────────────
  readonly employees = signal<Employee[]>([
    { id: '1', initials: 'AM', name: 'Alexander Munle', products: 98, revenue: 2386, avatarColor: '#1a3d2b' },
    { id: '2', initials: 'DR', name: 'Dianne Russell', products: 90, revenue: 2142, avatarColor: '#7ed47e' },
    { id: '3', initials: 'MM', name: 'Marvin McKinney', products: 82, revenue: 1824, avatarColor: '#9e9e9e' },
    { id: '4', initials: 'BS', name: 'Brooklyn Simmons', products: 76, revenue: 1494, avatarColor: '#2d6a4f' },
  ]);

  // ── UI State ──────────────────────────────────────────────────────────────
  readonly selectedDate = signal('Mar 25, 2024');

  constructor() {
    // React to batched trade ticks from the service and update price state.
    effect(() => {
      const trades = this.finnhub.lastTrades();
      if (!trades.length) return;

      this.priceState.update((state) => {
        const next: Record<string, PriceState> = { ...state };
        for (const trade of trades) {
          const prev = next[trade.symbol];
          next[trade.symbol] = {
            current: trade.price,
            previous: prev?.current ?? trade.price,
            volume: trade.volume,
            timestamp: trade.timestamp,
          };
        }
        return next;
      });
    });
  }

  // Connects WebSocket and subscribes to watchlist
  initRealtime() {
    this.finnhub.connect();

    // Once connected, subscribe to all symbols
    effect(() => {
      if (this.finnhub.status() === 'connected') {
        this.watchlist().forEach((entry) => this.finnhub.subscribe(entry.symbol));
      }
    });
  }

  destroy() {
    this.finnhub.disconnect();
  }
}
