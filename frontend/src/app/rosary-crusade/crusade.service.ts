import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Adjust if needed

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

  // If backend includes them:
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

  constructor(private http: HttpClient) { }

  // GET all
  getAllCrusades() {
    return this.http.get<Crusade[]>(`${this.baseUrl}/crusades`);
  }

  // GET by ID
  getCrusadeById(id: number) {
    return this.http.get<Crusade>(`${this.baseUrl}/crusades/${id}`);
  }

  // POST create
  createCrusade(crusade: Partial<Crusade>) {
    return this.http.post<Crusade>(`${this.baseUrl}/crusades`, crusade);
  }

  // PUT update
  updateCrusade(id: number, crusade: Partial<Crusade>) {
    return this.http.put<Crusade>(`${this.baseUrl}/crusades/${id}`, crusade);
  }

  // DELETE
  deleteCrusade(id: number) {
    return this.http.delete(`${this.baseUrl}/crusades/${id}`);
  }

  // SEARCH with optional filters (similar to Adoration)
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
