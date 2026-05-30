import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { AgCharts } from 'ag-charts-angular';

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, DatePipe, AgCharts],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './price-chart.component.html'
})
export class PriceChartComponent {
  symbols = input.required<readonly string[]>();
  symbol = input.required<string>();
  quote = input.required<any>(); // typing from FinnhubQuote
  chartLoading = input.required<boolean>();
  chartError = input.required<string | null>();
  chartOptions = input.required<any>();
  chartHistoryLength = input.required<number>();

  symbolChange = output<string>();
}
