import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  effect,
  computed,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions, ModuleRegistry, CategoryAxisModule, LegendModule, LineSeriesModule, NumberAxisModule, TimeAxisModule } from 'ag-charts-community';
import { StatPillComponent } from './stat-pill.component';
import { ChartPoint, QuoteSnapshot, StatPill } from '../../interfaces';

ModuleRegistry.registerModules([
  CategoryAxisModule,
  LegendModule,
  LineSeriesModule,
  NumberAxisModule,
  TimeAxisModule
]);

const POLL_MS = 5_000;
const TICK_MS = 50;
const STEPS = POLL_MS / TICK_MS; // 100 steps

@Component({
  selector: 'app-price-chart',
  imports: [DecimalPipe, AgCharts, StatPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './price-chart.component.html',
})
export class PriceChartComponent {
  private readonly destroyRef = inject(DestroyRef);

  symbols = input.required<readonly string[]>();
  symbol = input.required<string>();
  quote = input.required<QuoteSnapshot | null>();
  chartLoading = input.required<boolean>();
  chartError = input.required<string | null>();
  chartHistory = input.required<ChartPoint[]>();

  symbolChange = output<string>();

  readonly countdown = signal(STEPS);

  readonly chartHistoryLength = computed(() => this.chartHistory().length);

  readonly chartOptions = computed(() => {
    const history = this.chartHistory();
    const q = this.quote();
    const isUp = (q?.changePct ?? 0) >= 0;
    return {
      data: history.map((p) => ({
        time: new Date(p.time),
        price: p.price,
        open: p.open,
        high: p.high,
        low: p.low,
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
        { type: 'line', xKey: 'time', yKey: 'open', yName: 'Open', stroke: '#3b82f6', strokeWidth: 2, marker: { enabled: false } },
        { type: 'line', xKey: 'time', yKey: 'high', yName: 'High', stroke: '#f59e0b', strokeWidth: 2, marker: { enabled: false } },
        { type: 'line', xKey: 'time', yKey: 'low', yName: 'Low', stroke: '#8b5cf6', strokeWidth: 2, marker: { enabled: false } },
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
      minWidth: 0,
    } as unknown as AgChartOptions;
  });

  readonly statPills = computed<StatPill[]>(() => {
    const q = this.quote();
    if (!q) return [];
    const up = q.changePct >= 0;
    return [
      { label: 'Current', ariaLabel: `Current price ${q.currentPrice}`, value: q.currentPrice, valueClass: up ? 'text-emerald-600' : 'text-red-500', changePct: q.changePct, wrapperClass: 'col-span-2 sm:col-span-1' },
      { label: 'Open', ariaLabel: `Open price ${q.openPrice}`, value: q.openPrice },
      { label: 'High', ariaLabel: `Day high ${q.dayHigh}`, value: q.dayHigh, valueClass: 'text-emerald-600' },
      { label: 'Low', ariaLabel: `Day low ${q.dayLow}`, value: q.dayLow, valueClass: 'text-red-500' },
      { label: 'Prev Close', ariaLabel: `Previous close ${q.prevClose}`, value: q.prevClose },
    ];
  });

  constructor() {
    effect(() => {
      this.chartHistoryLength();
      this.countdown.set(STEPS);
    });

    const timer = setInterval(() => {
      this.countdown.update((v) => Math.max(0, v - 1));
    }, TICK_MS);

    this.destroyRef.onDestroy(() => clearInterval(timer));
  }
}
