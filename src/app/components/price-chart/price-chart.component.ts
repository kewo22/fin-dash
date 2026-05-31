import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { AgCharts } from 'ag-charts-angular';

const POLL_MS = 5_000;
const TICK_MS = 50;
const STEPS = POLL_MS / TICK_MS; // 100 steps

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, AgCharts],
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

  constructor() {
    // Reset countdown to 100 whenever new data arrives.
    effect(() => {
      // Reading chartHistoryLength() tracks it as a dependency.
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
