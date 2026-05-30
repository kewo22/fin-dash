import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FinnhubRealtimeService } from './services/finnhub-realtime.service';

/** Default symbols to stream on app start. */
const DEFAULT_SYMBOLS = ['AMZN', 'MSFT', 'BINANCE:BTCUSDT', 'AAPL'] as const;
// const DEFAULT_SYMBOLS = ['AAPL'] as const;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly finnhub = inject(FinnhubRealtimeService);

  constructor() {
    // Kick off the WebSocket connection immediately.
    // this.finnhub.connect();

    // Subscribe to default symbols once the connection is established.
    effect(() => {
      if (this.finnhub.status() === 'connected') {
        DEFAULT_SYMBOLS.forEach((sym) => this.finnhub.subscribe(sym));
      }
    });

    // Log connection state changes for observability.
    effect(() => {
      const status = this.finnhub.status();
      const err = this.finnhub.wsError();
      if (err) {
        console.error('[App] Finnhub error:', err);
      } else {
        console.log('[App] Finnhub status →', status);
      }
    });
  }
}
