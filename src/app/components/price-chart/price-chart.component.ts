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
import { StatPillComponent } from './stat-pill.component';
import { StatPill } from '../../interfaces';

const POLL_MS = 5_000;
const TICK_MS = 50;
const STEPS = POLL_MS / TICK_MS; // 100 steps

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [DecimalPipe, AgCharts, StatPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './price-chart.component.html',
})
export class PriceChartComponent {
  private readonly destroyRef = inject(DestroyRef);

  symbols = input.required<readonly string[]>();
  symbol = input.required<string>();
  quote = input.required<any>();
  chartLoading = input.required<boolean>();
  chartError = input.required<string | null>();
  chartOptions = input.required<any>();
  chartHistoryLength = input.required<number>();

  symbolChange = output<string>();

  readonly countdown = signal(STEPS);

  readonly statPills = computed<StatPill[]>(() => {
    const q = this.quote();
    if (!q) return [];
    const up = q.changePct >= 0;
    return [
      {
        label: 'Current',
        ariaLabel: `Current price ${q.currentPrice}`,
        value: q.currentPrice,
        valueClass: up ? 'text-emerald-600' : 'text-red-500',
        changePct: q.changePct,
        wrapperClass: 'col-span-2 sm:col-span-1',
      },
      {
        label: 'Open',
        ariaLabel: `Open price ${q.openPrice}`,
        value: q.openPrice,
      },
      {
        label: 'High',
        ariaLabel: `Day high ${q.dayHigh}`,
        value: q.dayHigh,
        valueClass: 'text-emerald-600',
      },
      {
        label: 'Low',
        ariaLabel: `Day low ${q.dayLow}`,
        value: q.dayLow,
        valueClass: 'text-red-500',
      },
      {
        label: 'Prev Close',
        ariaLabel: `Previous close ${q.prevClose}`,
        value: q.prevClose,
      },
    ];
  });

  constructor() {
    // Reset countdown to 100 whenever new data arrives.
    effect(() => {
      this.chartHistoryLength();
      this.countdown.set(STEPS);
    });

    // Tick every 50 ms, decrementing toward 0.
    const timer = setInterval(() => {
      this.countdown.update((v) => Math.max(0, v - 1));
    }, TICK_MS);

    this.destroyRef.onDestroy(() => clearInterval(timer));
  }
}
