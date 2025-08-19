import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

/**
 * The Crusade interface references optional `diocese` and `parish` objects
 * that can include `dioceseWebsite` and `parishWebsite`.
 */
export interface Crusade {
  crusadeId: number;
  stateId: number;
  dioceseId: number;
  parishId: number;
  confessionStartTime: string;
  confessionEndTime: string;
  massStartTime: string;
  massEndTime: string;
  crusadeStartTime: string;
  crusadeEndTime: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  comments: string;

  // Optional relationships if backend returns them via ->with('diocese','parish','state')
  diocese?: {
    dioceseId: number;
    dioceseName: string;
    dioceseWebsite?: string;
    associatedStateAbbreviations: string[]; // Added for multi-state support
  };
  parish?: {
    parishId: number;
    parishName: string;
    parishWebsite?: string;
    state?: { // Added for state filtering
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
}

@Injectable({
    providedIn: 'root'
})
export class CrusadeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllCrusades(): Observable<{ success: boolean; status: number; message: string; data: Crusade[] }> {
    return this.http.get<{ success: boolean; status: number; message: string; data: Crusade[] }>(`${this.baseUrl}/crusades`);
  }

  getCrusadeById(id: number): Observable<{ success: boolean; status: number; message: string; data: Crusade }> {
    return this.http.get<{ success: boolean; status: number; message: string; data: Crusade }>(`${this.baseUrl}/crusades/${id}`);
  }

  createCrusade(crusade: Partial<Crusade>): Observable<{ success: boolean; status: number; message: string; data: Crusade }> {
    return this.http.post<{ success: boolean; status: number; message: string; data: Crusade }>(`${this.baseUrl}/crusades`, crusade);
  }

  updateCrusade(id: number, crusade: Partial<Crusade>): Observable<{ success: boolean; status: number; message: string; data: Crusade }> {
    return this.http.put<{ success: boolean; status: number; message: string; data: Crusade }>(`${this.baseUrl}/crusades/${id}`, crusade);
  }

  deleteCrusade(id: number): Observable<{ success: boolean; status: number; message: string; data: null }> {
    return this.http.delete<{ success: boolean; status: number; message: string; data: null }>(`${this.baseUrl}/crusades/${id}`);
  }

  /**
   * Filter method for searching by state_id, diocese_id, parish_id
   */
  searchCrusades(stateId?: number, dioceseId?: number, parishId?: number): Observable<{ success: boolean; status: number; message: string; data: Crusade[] }> {
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
    return this.http.get<{ success: boolean; status: number; message: string; data: Crusade[] }>(`${this.baseUrl}/crusades`, { params });
  }
}