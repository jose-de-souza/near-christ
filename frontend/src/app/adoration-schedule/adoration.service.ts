import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Adoration {
  adorationId: number;
  dioceseId: number;
  parishId: number;
  stateId: number;
  adorationType: string;
  adorationLocation: string;
  adorationLocationType: string;
  adorationDay: string;
  adorationStart: string;
  adorationEnd: string;
  diocese?: {
    dioceseId: number;
    dioceseName: string;
    dioceseWebsite?: string;
    associatedStateAbbreviations: string[];
  };
  parish?: {
    parishId: number;
    parishName: string;
    parishWebsite?: string;
    state?: {
      stateId: number;
      stateName: string;
      stateAbbreviation: string;
    };
  };
  state?: {
    stateId: number;
    stateName: string;
    stateAbbreviation: string;
  };
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AdorationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllAdorations(): Observable<{ success: boolean; status: number; message: string; data: Adoration[] }> {
    return this.http.get<{ success: boolean; status: number; message: string; data: Adoration[] }>(`${this.baseUrl}/adorations`);
  }

  getAdorationById(id: number): Observable<{ success: boolean; status: number; message: string; data: Adoration }> {
    return this.http.get<{ success: boolean; status: number; message: string; data: Adoration }>(`${this.baseUrl}/adorations/${id}`);
  }

  createAdoration(adoration: Partial<Adoration>): Observable<{ success: boolean; status: number; message: string; data: Adoration }> {
    return this.http.post<{ success: boolean; status: number; message: string; data: Adoration }>(`${this.baseUrl}/adorations`, adoration);
  }

  updateAdoration(id: number, adoration: Partial<Adoration>): Observable<{ success: boolean; status: number; message: string; data: Adoration }> {
    return this.http.put<{ success: boolean; status: number; message: string; data: Adoration }>(`${this.baseUrl}/adorations/${id}`, adoration);
  }

  deleteAdoration(id: number): Observable<{ success: boolean; status: number; message: string; data: null }> {
    return this.http.delete<{ success: boolean; status: number; message: string; data: null }>(`${this.baseUrl}/adorations/${id}`);
  }

  searchAdorations(stateId?: number, dioceseId?: number, parishId?: number): Observable<{ success: boolean; status: number; message: string; data: Adoration[] }> {
    let params = new HttpParams();
    if (stateId && stateId > 0) {
      params = params.set('state_id', stateId.toString());
    }
    if (dioceseId && dioceseId > 0) {
      params = params.set('diocese_id', dioceseId.toString());
    }
    if (parishId && parishId > 0) {
      params = params.set('parish_id', parishId.toString());
    }
    return this.http.get<{ success: boolean; status: number; message: string; data: Adoration[] }>(`${this.baseUrl}/adorations`, { params });
  }
}