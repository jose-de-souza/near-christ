import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Crusade {
  CrusadeID: number;
  DioceseID: number;
  ParishID: number;
  State: string;
  ConfessionStartTime: string;
  ConfessionEndTime: string;
  MassStartTime: string;
  MassEndTime: string;
  CrusadeStartTime: string;
  CrusadeEndTime: string;
  ContactName: string;
  ContactPhone: string;
  ContactEmail: string;
  Comments: string;
  // Optional nested objects from the backend:
  diocese?: {
    DioceseID: number;
    DioceseName: string;
  };
  parish?: {
    ParishID: number;
    ParishName: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CrusadeService {
  private baseUrl = environment.apiUrl; // e.g. "http://localhost:8000"

  constructor(private http: HttpClient) {}

  getAllCrusades() {
    return this.http.get<Crusade[]>(`${this.baseUrl}/crusades`);
  }

  getCrusadeById(id: number) {
    return this.http.get<Crusade>(`${this.baseUrl}/crusades/${id}`);
  }

  createCrusade(crusade: Partial<Crusade>) {
    return this.http.post<Crusade>(`${this.baseUrl}/crusades`, crusade);
  }

  updateCrusade(id: number, crusade: Partial<Crusade>) {
    return this.http.put<Crusade>(`${this.baseUrl}/crusades/${id}`, crusade);
  }

  deleteCrusade(id: number) {
    return this.http.delete(`${this.baseUrl}/crusades/${id}`);
  }

  searchCrusades(state?: string, dioceseID?: number, parishID?: number) {
    let params = new HttpParams();
    if (state && state.trim()) {
      params = params.set('state', state.trim());
    }
    if (dioceseID && dioceseID > 0) {
      params = params.set('diocese_id', dioceseID.toString());
    }
    if (parishID && parishID > 0) {
      params = params.set('parish_id', parishID.toString());
    }
    return this.http.get<Crusade[]>(`${this.baseUrl}/crusades`, { params });
  }
}
