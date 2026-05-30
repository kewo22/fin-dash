import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-stock-summary',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-summary.component.html'
})
export class StockSummaryComponent {
  available = input.required<number>();
  soldOut = input.required<number>();
  total = input.required<number>();
  progressPct = input.required<number>();
}
