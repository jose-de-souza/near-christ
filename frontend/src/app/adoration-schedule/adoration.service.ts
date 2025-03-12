import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}

@Injectable({ providedIn: 'root' })
export class AdorationService {
  private baseUrl = environment.apiUrl; // e.g. "http://localhost:8000"

  constructor(private http: HttpClient) {}

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
}
