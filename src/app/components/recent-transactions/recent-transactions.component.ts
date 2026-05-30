import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Transaction } from '../../models/dashboard.models';

@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-transactions.component.html'
})
export class RecentTransactionsComponent {
  transactions = input.required<Transaction[]>();
  selectedDate = input.required<string>();
}
