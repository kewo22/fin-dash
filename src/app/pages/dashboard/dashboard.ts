import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { LiveStockTickerComponent } from '../../components/live-stock-ticker/live-stock-ticker.component';
import { PriceChartComponent } from '../../components/price-chart/price-chart.component';
import { RecentTransactionsComponent } from '../../components/recent-transactions/recent-transactions.component';
import { StockSummaryComponent } from '../../components/stock-summary/stock-summary.component';
import { CompanySearcherComponent } from '../../components/company-searcher/company-searcher.component';
import { DashboardStore } from '../../stores/dashboard.store';

@Component({
  selector: 'app-dashboard',
  imports: [
    LiveStockTickerComponent,
    PriceChartComponent,
    RecentTransactionsComponent,
    StockSummaryComponent,
    CompanySearcherComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnDestroy {
  readonly store = inject(DashboardStore);

  // ── Delegated Store Signals ────────────────────────────────────────────────
  readonly stockQuotes = this.store.stockQuotes;
  readonly topGainers = this.store.topGainers;
  readonly kpiBalance = this.store.kpiBalance;
  readonly kpiBalanceChange = this.store.kpiBalanceChange;
  readonly kpiIncome = this.store.kpiIncome;
  readonly kpiExpense = this.store.kpiExpense;
  readonly kpiTax = this.store.kpiTax;
  readonly stockTotal = this.store.stockTotal;
  readonly stockSoldOut = this.store.stockSoldOut;
  readonly stockAvailable = this.store.stockAvailable;
  readonly stockProgressPct = this.store.stockProgressPct;
  readonly transactions = this.store.transactions;
  readonly employees = this.store.employees;
  readonly selectedDate = this.store.selectedDate;

  // Expose connection status for template
  readonly wsStatus = this.store.wsStatus;

  // ── Real-Time Price Chart ─────────────────────────────────────────────────
  readonly quote = this.store.quote;
  readonly chartLoading = this.store.chartLoading;
  readonly chartError = this.store.chartError;
  readonly chartSymbol = this.store.chartSymbol;
  readonly chartHistoryLength = computed(() => this.store.chartHistory().length);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly chartOptions = computed<any>(() => {
    const history = this.store.chartHistory();
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

  constructor() {
    this.store.initRealtime();
  }

  setChartSymbol(symbol: string): void {
    this.store.setChartSymbol(symbol);
  }

  ngOnDestroy(): void {
    this.store.destroy();
  }
}
