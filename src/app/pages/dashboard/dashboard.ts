import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnDestroy,
  afterNextRender,
} from '@angular/core';
import { LiveStockTickerComponent } from '../../components/live-stock-ticker/live-stock-ticker.component';
import { PriceChartComponent } from '../../components/price-chart/price-chart.component';
import { RecentTransactionsComponent } from '../../components/recent-transactions/recent-transactions.component';
import { StockSummaryComponent } from '../../components/stock-summary/stock-summary.component';
import { CompanySearcherComponent } from '../../components/company-searcher/company-searcher.component';
import { DashboardStore } from '../../stores/dashboard.store';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-dashboard',
  imports: [
    LiveStockTickerComponent,
    PriceChartComponent,
    RecentTransactionsComponent,
    StockSummaryComponent,
    CompanySearcherComponent,
    SkeletonModule
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
  readonly chartHistory = this.store.chartHistory;

  readonly chartSymbols = ['AAPL', 'AMZN', 'MSFT', 'GOOGL', 'TSLA'] as const;

  constructor() {
    afterNextRender(() => this.store.initRealtime());
  }

  setChartSymbol(symbol: string): void {
    this.store.setChartSymbol(symbol);
  }

  ngOnDestroy(): void {
    this.store.destroy();
  }
}
