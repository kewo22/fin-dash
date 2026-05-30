import { Injectable, DestroyRef, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, switchMap, catchError, EMPTY, startWith } from 'rxjs';
import { environment } from '../../environments/environment';

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

const POLL_INTERVAL_MS = 7_000;
const MAX_CHART_POINTS = 60;

@Injectable({ providedIn: 'root' })
export class FinnhubQuoteService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _symbol = signal('AAPL');
  private readonly _quote = signal<FinnhubQuote | null>(null);
  private readonly _chartHistory = signal<ChartPoint[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);

  readonly symbol = this._symbol.asReadonly();
  readonly chartHistory = this._chartHistory.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly quote = computed<QuoteSnapshot | null>(() => {
    const q = this._quote();
    if (!q) return null;
    const change = q.c - q.pc;
    const changePct = q.pc > 0 ? (change / q.pc) * 100 : 0;
    return {
      symbol: this._symbol(),
      currentPrice: q.c,
      openPrice: q.o,
      dayHigh: q.h,
      dayLow: q.l,
      prevClose: q.pc,
      change,
      changePct,
      updatedAt: q.t * 1000,
    };
  });

  constructor() {
    this.startPolling();
  }

  setSymbol(symbol: string): void {
    this._symbol.set(symbol);
    this._chartHistory.set([]);
    this._loading.set(true);
  }

  private startPolling(): void {
    interval(POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() => this.fetchQuote()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((quote) => {
        this._quote.set(quote);
        this._loading.set(false);
        this._error.set(null);
        this._chartHistory.update((history) => {
          const point: ChartPoint = { time: Date.now(), price: quote.c };
          const next = [...history, point];
          return next.length > MAX_CHART_POINTS ? next.slice(-MAX_CHART_POINTS) : next;
        });
      });
  }

  private fetchQuote() {
    const url = `https://finnhub.io/api/v1/quote?symbol=${this._symbol()}&token=${environment.finnhubApiKey}`;
    return this.http.get<FinnhubQuote>(url).pipe(
      catchError((err) => {
        this._loading.set(false);
        this._error.set('Failed to fetch quote: ' + (err?.message ?? 'Unknown error'));
        return EMPTY;
      }),
    );
  }
}
