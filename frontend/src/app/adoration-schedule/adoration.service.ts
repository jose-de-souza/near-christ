import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

// If the backend returns diocese / parish objects,  can define them optionally
export interface Adoration {
  AdorationID: number;
  DioceseID: number;             // must match a valid DioceseID
  ParishID: number;              // must match a valid ParishID
  State: string;
  AdorationType: string;
  AdorationLocation: string;
  AdorationLocationType: string;
  AdorationDay: string;
  AdorationStart: string;
  AdorationEnd: string;

  // (Optional) Relationship objects if Laravel returns them with ->with('diocese','parish')
  diocese?: {
    DioceseID: number;
    DioceseName: string;
    // etc...
  };
  parish?: {
    ParishID: number;
    ParishName: string;
    // etc...
  };
  [key: string]: any;
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

  // SEARCH with optional filters
  /**
  * SEARCH with optional filters.
  * If 'state' or 'dioceseID' or 'parishID' is not provided or is zero/blank,
  * it won't be sent as a query param.
  */
  searchAdorations(state?: string, dioceseID?: number, parishID?: number) {
    let params = new HttpParams();

    // Only set param if it’s actually provided and non-empty
    if (state && state.trim()) {
      params = params.set('state', state.trim());
    }
    if (dioceseID && dioceseID > 0) {
      params = params.set('diocese_id', dioceseID.toString());
    }
    if (parishID && parishID > 0) {
      params = params.set('parish_id', parishID.toString());
    }

    return this.http.get<Adoration[]>(`${this.baseUrl}/adorations`, { params });
  }

}
