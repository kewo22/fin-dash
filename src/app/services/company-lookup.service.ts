import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from './http-client.service';
import { CompanyProfile } from '../interfaces';


@Injectable({ providedIn: 'root' })
export class CompanyLookupService {
  private readonly http = inject(HttpClientService);

  searchBySymbol(symbol: string): Observable<CompanyProfile> {
    return this.http.get<CompanyProfile>('/stock/profile2', { symbol: symbol.trim().toUpperCase() });
  }
}
