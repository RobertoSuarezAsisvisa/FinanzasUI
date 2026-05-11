import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { CreatedApiKeyResponse, UserApiKeySummary } from './auth.models';

@Injectable({ providedIn: 'root' })
export class ApiKeysService {
  private readonly api = inject(ApiService);

  list(): Observable<UserApiKeySummary[]> {
    return this.api.get<UserApiKeySummary[]>('auth/api-keys');
  }

  create(name: string): Observable<CreatedApiKeyResponse> {
    return this.api.post<CreatedApiKeyResponse>('auth/api-keys', { name });
  }

  revoke(id: string): Observable<void> {
    return this.api.post<void>(`auth/api-keys/${id}/revoke`, {});
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`auth/api-keys/${id}`);
  }
}
