import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // adjust if needed

/**
 * The Diocese interface, now with a numeric `stateID` foreign key
 * plus an optional `state` object if your backend returns the relationship.
 */
export interface Diocese {
  dioceseId: number;
  dioceseName: string;
  dioceseStreetNo: string;
  dioceseStreetName: string;
  dioceseSuburb: string;
  stateID: number;  // Replaces the old DioceseState string
  diocesePostcode: string;
  diocesePhone: string;
  dioceseEmail: string;
  dioceseWebsite: string;

  // NEW: if Laravel returns state with ->with('state'):
  state?: {
    stateID: number;
    stateName: string;
    stateAbbreviation: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DioceseService {
  private baseUrl = environment.apiUrl; // e.g. "http://localhost:8000"

  constructor(private http: HttpClient) { }

  // GET all dioceses
  getAllDioceses() {
    return this.http.get<Diocese[]>(`${this.baseUrl}/dioceses`);
  }

  // GET single diocese by ID
  getDioceseById(id: number) {
    return this.http.get<Diocese>(`${this.baseUrl}/dioceses/${id}`);
  }

  // POST create new diocese
  createDiocese(diocese: Partial<Diocese>) {
    return this.http.post<Diocese>(`${this.baseUrl}/dioceses`, diocese);
  }

  // PUT update existing diocese by ID
  updateDiocese(id: number, diocese: Partial<Diocese>) {
    return this.http.put<Diocese>(`${this.baseUrl}/dioceses/${id}`, diocese);
  }

  // DELETE a diocese by ID
  deleteDiocese(id: number) {
    return this.http.delete(`${this.baseUrl}/dioceses/${id}`);
  }
}
