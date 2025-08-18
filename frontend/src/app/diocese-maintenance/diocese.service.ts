import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // adjust if needed

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