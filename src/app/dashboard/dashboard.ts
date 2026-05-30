import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

export interface Transaction {
  readonly id: string;
  readonly product: string;
  readonly variant: string;
  readonly status: 'Success' | 'Pending' | 'Failed';
  readonly amount: number;
}

export interface Employee {
  readonly id: string;
  readonly initials: string;
  readonly name: string;
  readonly products: number;
  readonly revenue: number;
  readonly avatarColor: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  // ── KPI Signals ──────────────────────────────────────────────────────────
  readonly kpiBalance = signal(124_254.62);
  readonly kpiBalanceChange = signal(8.2);
  readonly kpiIncome = signal(265_172);
  readonly kpiExpense = signal(98_284);
  readonly kpiTax = signal(46_174);

  // ── Stock Signals ─────────────────────────────────────────────────────────
  readonly stockTotal = signal(13_645);
  readonly stockSoldOut = signal(11_167);
  readonly stockAvailable = signal(2_478);
  readonly stockProgressPct = computed(() =>
    Math.round((this.stockSoldOut() / this.stockTotal()) * 100),
  );

  // ── Recent Transactions ───────────────────────────────────────────────────
  readonly transactions = signal<Transaction[]>([
    {
      id: '476-893',
      product: 'Premium T-Shirt',
      variant: '1 Pcs • Size M',
      status: 'Success',
      amount: 24.51,
    },
    {
      id: '476-892',
      product: 'Maxim Polo New',
      variant: '1 Pcs • Size L',
      status: 'Pending',
      amount: 14.54,
    },
    {
      id: '476-891',
      product: 'Vintage T-Shirt',
      variant: '1 Pcs • Size S',
      status: 'Failed',
      amount: 32.0,
    },
    {
      id: '476-890',
      product: 'Classic Hoodie',
      variant: '1 Pcs • Size XL',
      status: 'Success',
      amount: 45.99,
    },
    {
      id: '476-889',
      product: 'Sport Jogger',
      variant: '1 Pcs • Size M',
      status: 'Pending',
      amount: 28.75,
    },
  ]);

  // ── Top Employees ─────────────────────────────────────────────────────────
  readonly employees = signal<Employee[]>([
    {
      id: '1',
      initials: 'AM',
      name: 'Alexander Munle',
      products: 98,
      revenue: 2386,
      avatarColor: '#1a3d2b',
    },
    {
      id: '2',
      initials: 'DR',
      name: 'Dianne Russell',
      products: 90,
      revenue: 2142,
      avatarColor: '#7ed47e',
    },
    {
      id: '3',
      initials: 'MM',
      name: 'Marvin McKinney',
      products: 82,
      revenue: 1824,
      avatarColor: '#9e9e9e',
    },
    {
      id: '4',
      initials: 'BS',
      name: 'Brooklyn Simmons',
      products: 76,
      revenue: 1494,
      avatarColor: '#2d6a4f',
    },
  ]);

  // ── UI State ──────────────────────────────────────────────────────────────
  readonly searchQuery = signal('');
  readonly selectedDate = signal('Mar 25, 2024');
}
