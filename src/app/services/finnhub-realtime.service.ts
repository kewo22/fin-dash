import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subject, filter, auditTime, scan } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConnectionStatus, PriceState } from '../interfaces';

/** Raw trade object as received from Finnhub WebSocket. */
interface FinnhubRawTrade {
  readonly p: number; // price
  readonly s: string; // symbol
  readonly t: number; // timestamp (epoch ms)
  readonly v: number; // volume
}

/** Raw envelope from Finnhub WebSocket. */
interface FinnhubRawMessage {
  readonly type: 'trade' | 'ping' | 'error';
  readonly data?: FinnhubRawTrade[];
  readonly msg?: string;
}

/**
 * Manages the Finnhub WebSocket connection.
 *
 * Rules:
 * - All WebSocket logic lives here — never in components.
 * - High-frequency trade ticks are batched with `auditTime(500)`.
 * - Public state is exposed exclusively via signals.
 * - Uses RxJS Subject only as a bridge for the external WS API.
 */
@Injectable({ providedIn: 'root' })
export class FinnhubRealtimeService {
  private readonly destroyRef = inject(DestroyRef);

  // Internal WS bridge (Subject is allowed when integrating external APIs)
  private readonly rawMessage$ = new Subject<FinnhubRawMessage>();

  private ws: WebSocket | null = null;
  private readonly subscribedSymbols = new Set<string>();

  // ── Public signals ──────────────────────────────────────────────────────────
  readonly status = signal<ConnectionStatus>('disconnected');
  readonly wsError = signal<string | null>(null);

  private readonly trade$ = this.rawMessage$.pipe(
    filter((msg) => msg.type === 'trade' && !!msg.data?.length),
    auditTime(500),
    scan((state, msg) => {
      const next = { ...state };
      for (const raw of msg.data ?? []) {
        const prev = next[raw.s];
        next[raw.s] = {
          current: raw.p,
          previous: prev?.current ?? raw.p,
          volume: raw.v,
          timestamp: raw.t,
        };
      }
      return next;
    }, {} as Record<string, PriceState>),
    takeUntilDestroyed(this.destroyRef),
  );

  readonly priceState = toSignal(this.trade$, { initialValue: {} as Record<string, PriceState> });

  constructor() {

    // Tear down WebSocket when the app is destroyed.
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Opens the WebSocket connection. Safe to call multiple times. */
  connect(): void {
    if (this.ws !== null) return;

    console.log('[FinnhubRealtimeService] Connecting…');
    this.status.set('connecting');
    this.wsError.set(null);

    this.ws = new WebSocket(
      `${environment.finnhubWsUrl}?token=${environment.finnhubApiKey}`,
    );

    this.ws.onopen = () => {
      console.log('[FinnhubRealtimeService] ✅ Connected');
      this.status.set('connected');
      // Re-subscribe to all tracked symbols (handles reconnects).
      this.subscribedSymbols.forEach((sym) => this.sendSubscribe(sym));
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg = JSON.parse(event.data) as FinnhubRawMessage;
        this.rawMessage$.next(msg);
      } catch {
        console.warn(
          '[FinnhubRealtimeService] Failed to parse message:',
          event.data,
        );
      }
    };

    this.ws.onerror = (event) => {
      console.error('[FinnhubRealtimeService] ❌ WebSocket error:', event);
      this.status.set('error');
      this.wsError.set('WebSocket connection error. Check your API key.');
    };

    this.ws.onclose = (event) => {
      console.log(
        `[FinnhubRealtimeService] 🔌 Disconnected (code: ${event.code})`,
      );
      this.ws = null;
      this.status.set('disconnected');
    };
  }

  /** Subscribes to real-time trades for the given symbol. */
  subscribe(symbol: string): void {
    this.subscribedSymbols.add(symbol);
    this.sendSubscribe(symbol);
  }

  /** Unsubscribes from real-time trades for the given symbol. */
  unsubscribe(symbol: string): void {
    this.subscribedSymbols.delete(symbol);
    this.sendMessage({ type: 'unsubscribe', symbol });
  }

  /** Closes the WebSocket connection. */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.status.set('disconnected');
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private sendSubscribe(symbol: string): void {
    this.sendMessage({ type: 'subscribe', symbol });
  }

  private sendMessage(payload: Record<string, string>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }
}
