import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { StockQuote } from '../../models/dashboard.models';

@Component({
  selector: 'app-live-stock-ticker',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-stock-ticker.component.html'
})
export class LiveStockTickerComponent {
  wsStatus = input.required<'connected' | 'connecting' | 'error' | 'disconnected'>();
  stockQuotes = input.required<StockQuote[]>();
  topGainers = input.required<StockQuote[]>();
}
