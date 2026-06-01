import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://finnhub.io/api/v1';

  /** GET request with the Finnhub API key automatically appended. */
  get<T>(path: string, params: Record<string, string> = {}): Observable<T> {
    const httpParams = new HttpParams({ fromObject: { ...params, token: environment.finnhubApiKey } });
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams });
  }
}
