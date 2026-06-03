import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { StatPill } from '../../interfaces';

@Component({
  selector: 'app-stat-pill',
  imports: [CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-xl bg-gray-50 px-4 py-3" [class]="pill().wrapperClass ?? ''" role="listitem">
      <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{{ pill().label }}</p>
      <p class="tabular-nums leading-none font-bold"
         [class]="(pill().changePct !== undefined ? 'text-lg font-extrabold ' : 'text-sm ') + (pill().valueClass ?? 'text-gray-800')"
         [attr.aria-label]="pill().ariaLabel">
        {{ pill().value | currency:'USD':'symbol':'1.2-2' }}
      </p>
      @if (pill().changePct !== undefined) {
        <p class="text-[10px] mt-1 font-semibold"
           [class]="pill().changePct! >= 0 ? 'text-emerald-500' : 'text-red-400'">
          {{ pill().changePct! >= 0 ? '+' : '' }}{{ pill().changePct! | number:'1.2-2' }}%
        </p>
      }
    </div>
  `,
})
export class StatPillComponent {
  pill = input.required<StatPill>();
}
