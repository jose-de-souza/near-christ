import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

// If the backend returns diocese / parish objects, define them optionally:
export interface Adoration {
  AdorationID: number;
  DioceseID: number;           // references a valid Diocese
  ParishID: number;            // references a valid Parish
  StateID: number;             // numeric foreign key => references State table
  AdorationType: string;       // 'Regular' or 'Perpetual'
  AdorationLocation: string;
  AdorationLocationType: string;
  AdorationDay: string;        // e.g. 'Monday', or empty if Perpetual
  AdorationStart: string;      // e.g. '09:00:00'
  AdorationEnd: string;        // e.g. '17:00:00'

  // (Optional) Relationship objects if Laravel returns them with ->with('diocese','parish','state')
  diocese?: {
    DioceseID: number;
    DioceseName: string;
    // ...
  };
  parish?: {
    ParishID: number;
    ParishName: string;
    // ...
  };
  state?: {
    StateID: number;
    StateName: string;
    StateAbbreviation: string;
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

  // Optionally: search with filters (state_id, diocese_id, parish_id)
  searchAdorations(stateID?: number, dioceseID?: number, parishID?: number) {
    let params = new HttpParams();
    if (stateID && stateID > 0) {
      params = params.set('state_id', stateID.toString());
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
