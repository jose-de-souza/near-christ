import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Adjust path if needed

/** 
 * The Crusade interface, with optional 'diocese' and 'parish' 
 * when the backend returns those relationships via Eloquent eager loading.
 */
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
  Observations: string;

  // Optional if the backend includes them:
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
}

@Injectable({ providedIn: 'root' })
export class CrusadeService {
  private baseUrl = environment.apiUrl; // e.g. "http://localhost:8000"

  constructor(private http: HttpClient) {}

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
}
