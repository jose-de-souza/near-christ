import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * The Crusade interface references optional `diocese` and `parish` objects
 * that can include `DioceseWebsite` and `ParishWebsite`.
 */
export interface Crusade {
  CrusadeID: number;
  StateID: number;
  DioceseID: number;
  ParishID: number;
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

  // Optional relationships if Laravel returns them via ->with('diocese','parish','state')
  diocese?: {
    DioceseID: number;
    DioceseName: string;
    DioceseWebsite?: string; // NEW: so we can reference it in the front end
  };
  parish?: {
    ParishID: number;
    ParishName: string;
    ParishWebsite?: string; // NEW: so we can reference it in the front end
  };
  state?: {
    StateID: number;
    StateName: string;
    StateAbbreviation: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CrusadeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

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

  /**
   * Filter method for searching by state_id, diocese_id, parish_id
   */
  searchCrusades(stateID?: number, dioceseID?: number, parishID?: number) {
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
    return this.http.get<Crusade[]>(`${this.baseUrl}/crusades`, { params });
  }
}
