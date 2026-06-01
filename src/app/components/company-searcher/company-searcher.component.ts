import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, catchError, EMPTY, filter } from 'rxjs';
import { CompanyLookupService, CompanyProfile } from '../../services/company-lookup.service';

@Component({
  selector: 'app-company-searcher',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './company-searcher.component.html',
})
export class CompanySearcherComponent {
  private readonly companyLookup = inject(CompanyLookupService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly profile = signal<CompanyProfile | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(3_000),
      distinctUntilChanged(),
      filter((v) => v.trim().length >= 1),
      switchMap((symbol) => {
        this.loading.set(true);
        this.error.set(null);
        this.profile.set(null);
        return this.companyLookup.searchBySymbol(symbol).pipe(
          catchError(() => {
            this.loading.set(false);
            this.error.set('Could not find company. Check the symbol and try again.');
            return EMPTY;
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((data) => {
      this.loading.set(false);
      if (!data.ticker) {
        this.error.set('No company found for that symbol.');
      } else {
        this.profile.set(data);
      }
    });
  }

  clear(): void {
    this.searchControl.setValue('');
    this.profile.set(null);
    this.error.set(null);
  }
}
