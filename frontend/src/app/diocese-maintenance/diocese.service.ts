import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * The Diocese interface, without state reference.
 * States are now inferred from parishes and provided as associatedStateAbbreviations.
 */
export interface Diocese {
  dioceseId: number;
  dioceseName: string;
  dioceseStreetNo: string;
  dioceseStreetName: string;
  dioceseSuburb: string;
  diocesePostcode: string;
  diocesePhone: string;
  dioceseEmail: string;
  dioceseWebsite: string;
  associatedStateAbbreviations: string[]; // e.g., ['NSW', 'VIC']
}

@Injectable({
  providedIn: 'root'
})
export class DioceseService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllDioceses(): Observable<{ success: boolean; status: number; message: string; data: Diocese[] }> {
    return this.http.get<{ success: boolean; status: number; message: string; data: Diocese[] }>(`${this.baseUrl}/dioceses`);
  }

  getDioceseById(id: number): Observable<{ success: boolean; status: number; message: string; data: Diocese }> {
    return this.http.get<{ success: boolean; status: number; message: string; data: Diocese }>(`${this.baseUrl}/dioceses/${id}`);
  }

  createDiocese(diocese: Partial<Diocese>): Observable<{ success: boolean; status: number; message: string; data: Diocese }> {
    return this.http.post<{ success: boolean; status: number; message: string; data: Diocese }>(`${this.baseUrl}/dioceses`, diocese);
  }

  updateDiocese(id: number, diocese: Partial<Diocese>): Observable<{ success: boolean; status: number; message: string; data: Diocese }> {
    return this.http.put<{ success: boolean; status: number; message: string; data: Diocese }>(`${this.baseUrl}/dioceses/${id}`, diocese);
  }

  deleteDiocese(id: number): Observable<{ success: boolean; status: number; message: string; data: null }> {
    return this.http.delete<{ success: boolean; status: number; message: string; data: null }>(`${this.baseUrl}/dioceses/${id}`)
      .pipe(
        catchError(error => {
          if (error.status === 400 && error.error.message.includes('associated to it')) {
            return throwError(() => new Error(error.error.message));
          }
          return throwError(() => new Error(error.error.message || 'Fatal error deleting diocese! Please contact support.'));
        })
      );
  }
}