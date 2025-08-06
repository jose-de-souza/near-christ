import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Diocese } from '../diocese-maintenance/diocese.service'; // ADDED import so we can reference Diocese
import { Parish } from '../parish-maintenance/parish.service';   // ADDED import so we can reference Parish

// If the backend returns diocese/parish objects, define them optionally:
export interface Adoration {
  adorationId: number;
  dioceseId: number;           // references a valid Diocese
  parishId: number;            // references a valid Parish
  stateID: number;             // numeric foreign key => references State
  adorationType: string;       // 'Regular' or 'Perpetual'
  adorationLocation: string;
  adorationLocationType: string;
  adorationDay: string;        // e.g. 'Monday', or empty if Perpetual
  adorationStart: string;      // e.g. '09:00:00'
  adorationEnd: string;        // e.g. '17:00:00'

  // NEW: if Laravel ->with('diocese','parish','state'), they include the full objects:
  diocese?: Diocese; // so row.diocese?.dioceseWebsite is recognized
  parish?: Parish;   // so row.parish?.parishWebsite is recognized
  state?: {
    stateID: number;
    stateName: string;
    stateAbbreviation: string;
  };
  [key: string]: any; // optional for expansion
}

@Injectable({ providedIn: 'root' })
export class AdorationService {
  private baseUrl = environment.apiUrl; // e.g. "http://localhost:8000"

  constructor(private http: HttpClient) { }

  // GET all adorations
  getAllAdorations() {
    return this.http.get<Adoration[]>(`${this.baseUrl}/adorations`);
  }

  // GET single adoration
  getAdorationById(id: number) {
    return this.http.get<Adoration>(`${this.baseUrl}/adorations/${id}`);
  }

  // POST create new adoration
  createAdoration(adoration: Partial<Adoration>) {
    return this.http.post<Adoration>(`${this.baseUrl}/adorations`, adoration);
  }

  // PUT update existing adoration
  updateAdoration(id: number, adoration: Partial<Adoration>) {
    return this.http.put<Adoration>(`${this.baseUrl}/adorations/${id}`, adoration);
  }

  // DELETE an adoration
  deleteAdoration(id: number) {
    return this.http.delete(`${this.baseUrl}/adorations/${id}`);
  }

  // SEARCH: optionally pass (stateID, dioceseId, parishId) as query params
  searchAdorations(stateID?: number, dioceseId?: number, parishId?: number) {
    let params = new HttpParams();
    if (stateID && stateID > 0) {
      params = params.set('state_id', stateID.toString());
    }
    if (dioceseId && dioceseId > 0) {
      params = params.set('diocese_id', dioceseId.toString());
    }
    if (parishId && parishId > 0) {
      params = params.set('parish_id', parishId.toString());
    }
    return this.http.get<Adoration[]>(`${this.baseUrl}/adorations`, { params });
  }
}
