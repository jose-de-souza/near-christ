import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Parish {
    parishId: number;  // PK from the backend
    dioceseId: number;
    parishName: string;
    parishStNumber: string;
    parishStName: string;
    parishSuburb: string;
    // numeric foreign key => references "State" table
    stateId: number;
    parishPostcode: string;
    parishPhone: string;
    parishEmail: string;
    parishWebsite: string;

    // Optional nested objects if backend returns them (e.g., via joins)
    diocese?: {
        dioceseId: number;
        dioceseName: string;
        associatedStateAbbreviations: string[]; // Added for multi-state support
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
export class ParishService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAllParishes(): Observable<{ success: boolean; status: number; message: string; data: Parish[] }> {
        return this.http.get<{ success: boolean; status: number; message: string; data: Parish[] }>(`${this.baseUrl}/parishes`);
    }

    getParishById(id: number): Observable<{ success: boolean; status: number; message: string; data: Parish }> {
        return this.http.get<{ success: boolean; status: number; message: string; data: Parish }>(`${this.baseUrl}/parishes/${id}`);
    }

    createParish(parish: Partial<Parish>): Observable<{ success: boolean; status: number; message: string; data: Parish }> {
        const payload: Partial<Parish> = {
            parishName: parish.parishName,
            parishStNumber: parish.parishStNumber,
            parishStName: parish.parishStName,
            parishSuburb: parish.parishSuburb,
            parishPostcode: parish.parishPostcode,
            parishPhone: parish.parishPhone,
            parishEmail: parish.parishEmail,
            parishWebsite: parish.parishWebsite,
            stateId: parish.stateId,
            dioceseId: parish.dioceseId
        };
        return this.http.post<{ success: boolean; status: number; message: string; data: Parish }>(`${this.baseUrl}/parishes`, payload);
    }

    updateParish(id: number, parish: Partial<Parish>): Observable<{ success: boolean; status: number; message: string; data: Parish }> {
        const payload: Partial<Parish> = {
            parishName: parish.parishName,
            parishStNumber: parish.parishStNumber,
            parishStName: parish.parishStName,
            parishSuburb: parish.parishSuburb,
            parishPostcode: parish.parishPostcode,
            parishPhone: parish.parishPhone,
            parishEmail: parish.parishEmail,
            parishWebsite: parish.parishWebsite,
            stateId: parish.stateId,
            dioceseId: parish.dioceseId
        };
        return this.http.put<{ success: boolean; status: number; message: string; data: Parish }>(`${this.baseUrl}/parishes/${id}`, payload);
    }

    deleteParish(id: number): Observable<{ success: boolean; status: number; message: string; data: null }> {
        return this.http.delete<{ success: boolean; status: number; message: string; data: null }>(`${this.baseUrl}/parishes/${id}`);
    }
}