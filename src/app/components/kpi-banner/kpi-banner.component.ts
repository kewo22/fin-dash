import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-kpi-banner',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpi-banner.component.html'
})
export class KpiBannerComponent {
  balance = input.required<number>();
  balanceChange = input.required<number>();
  income = input.required<number>();
  expense = input.required<number>();
  tax = input.required<number>();
}
