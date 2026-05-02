import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Id } from '../models/finance.models';
import { ApiService, QueryParams } from './api.service';

@Injectable()
export abstract class CrudService<T extends { id?: Id }> {
  protected constructor(
    protected readonly api: ApiService,
    protected readonly resourcePath: string
  ) {}

  list(query?: QueryParams): Observable<T[]> {
    return this.api.get<T[]>(this.resourcePath, query);
  }

  create(payload: Partial<T>): Observable<T> {
    return this.api.post<T>(this.resourcePath, payload);
  }

  update(id: Id, payload: Partial<T>): Observable<T> {
    return this.api.put<T>(`${this.resourcePath}/${id}`, payload);
  }

  delete(id: Id): Observable<void> {
    return this.api.delete<void>(`${this.resourcePath}/${id}`);
  }
}
