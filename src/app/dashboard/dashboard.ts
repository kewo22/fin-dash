import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { FinnhubRealtimeService } from '../services/finnhub-realtime.service';
import { FinnhubQuoteService } from '../services/finnhub-quote.service';
import { AgCharts } from 'ag-charts-angular';
import { HeaderComponent } from '../components/header/header.component';
import { LiveStockTickerComponent } from '../components/live-stock-ticker/live-stock-ticker.component';
import { KpiBannerComponent } from '../components/kpi-banner/kpi-banner.component';
import { PriceChartComponent } from '../components/price-chart/price-chart.component';
import { RecentTransactionsComponent } from '../components/recent-transactions/recent-transactions.component';
import { StockSummaryComponent } from '../components/stock-summary/stock-summary.component';
import { TopEmployeesComponent } from '../components/top-employees/top-employees.component';

import { Transaction, Employee, StockQuote, WatchlistEntry, PriceState } from '../models/dashboard.models';

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-dashboard',
  imports: [
    HeaderComponent,
    LiveStockTickerComponent,
    KpiBannerComponent,
    PriceChartComponent,
    RecentTransactionsComponent,
    StockSummaryComponent,
    TopEmployeesComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly finnhub = inject(FinnhubRealtimeService);
  readonly quoteService = inject(FinnhubQuoteService);

  // ── Watchlist config ───────────────────────────────────────────────────────
  readonly watchlist: WatchlistEntry[] = [
    { symbol: 'AAPL', displaySymbol: 'AAPL', displayName: 'Apple Inc.', initials: 'AAPL', avatarColor: '#6b7280' },
    { symbol: 'AMZN', displaySymbol: 'AMZN', displayName: 'Amazon.com', initials: 'AMZN', avatarColor: '#f97316' },
    { symbol: 'MSFT', displaySymbol: 'MSFT', displayName: 'Microsoft Corp.', initials: 'MSFT', avatarColor: '#3b82f6' },
    { symbol: 'BINANCE:BTCUSDT', displaySymbol: 'BTC/USD', displayName: 'Bitcoin / USDT', initials: 'BTC', avatarColor: '#f59e0b' },
  ];

  // ── Internal price state (symbol → latest + previous price) ───────────────
  private readonly priceState = signal<Record<string, PriceState>>({});

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

  // ── Derived stock quotes ───────────────────────────────────────────────────
  readonly stockQuotes = computed<StockQuote[]>(() => {
    const state = this.priceState();
    return this.watchlist.map((entry) => {
      const data = state[entry.symbol];
      const price = data?.current ?? 0;
      const prev = data?.previous ?? price;
      const change = price - prev;
      const changePct = prev > 0 ? (change / prev) * 100 : 0;
      return { ...entry, price, change, changePct, volume: data?.volume ?? 0, timestamp: data?.timestamp ?? 0, hasData: !!data };
    });
  });

  // Top gainers sorted by % change descending
  readonly topGainers = computed(() =>
    [...this.stockQuotes()].sort((a, b) => b.changePct - a.changePct),
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
    Math.round((this.stockSoldOut() / this.stockTotal()) * 100),
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
  readonly searchQuery = signal('');
  readonly selectedDate = signal('Mar 25, 2024');

  // Expose connection status for template
  readonly wsStatus = this.finnhub.status;

  // ── Real-Time Price Chart ─────────────────────────────────────────────────
  readonly quote = this.quoteService.quote;
  readonly chartLoading = this.quoteService.loading;
  readonly chartError = this.quoteService.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly chartOptions = computed<any>(() => {
    const history = this.quoteService.chartHistory();
    const quote = this.quote();
    const isUp = (quote?.changePct ?? 0) >= 0;
    return {
      data: history.map((p) => ({
        time: new Date(p.time),
        price: p.price,
        open: p.open,
        high: p.high,
        low: p.low
      })),
      background: { fill: 'transparent' },
      padding: { top: 8, right: 16, bottom: 8, left: 8 },
      series: [
        {
          type: 'line',
          xKey: 'time',
          yKey: 'price',
          yName: 'Current',
          stroke: isUp ? '#10b981' : '#ef4444',
          strokeWidth: 2,
          marker: { enabled: false },
          tooltip: {
            renderer: ({ datum }: { datum: { time: Date; price: number } }) => ({
              content: `$${datum.price.toFixed(2)}`,
              title: datum.time.toLocaleTimeString(),
            }),
          },
        },
        {
          type: 'line',
          xKey: 'time',
          yKey: 'open',
          yName: 'Open',
          stroke: '#3b82f6',
          strokeWidth: 2,
          marker: { enabled: false },
        },
        {
          type: 'line',
          xKey: 'time',
          yKey: 'high',
          yName: 'High',
          stroke: '#f59e0b',
          strokeWidth: 2,
          marker: { enabled: false },
        },
        {
          type: 'line',
          xKey: 'time',
          yKey: 'low',
          yName: 'Low',
          stroke: '#8b5cf6',
          strokeWidth: 2,
          marker: { enabled: false },
        },
      ],
      axes: [
        {
          type: 'time',
          position: 'bottom',
          label: { format: '%H:%M:%S', fontSize: 10, color: '#9ca3af' },
          line: { enabled: true },
          tick: { enabled: true },
          gridLine: { enabled: true },
        },
        {
          type: 'number',
          position: 'right',
          label: {
            formatter: ({ value }: { value: number }) => `$${value.toFixed(0)}`,
            fontSize: 10,
            color: '#9ca3af',
          },
          gridLine: { style: [{ stroke: '#f3f4f6', lineDash: [4, 4] }] },
          line: { enabled: true },
          tick: { enabled: true },
        },
      ],
      legend: { enabled: true, position: 'top' },
      minWidth: 0
    };
  });

  readonly chartSymbols = ['AAPL', 'AMZN', 'MSFT', 'GOOGL', 'TSLA'] as const;

  setChartSymbol(symbol: string): void {
    this.quoteService.setSymbol(symbol);
  }
}
