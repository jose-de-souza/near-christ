import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

    getAllParishes() {
        return this.http.get<Parish[]>(`${this.baseUrl}/parishes`);
    }

    getParishById(id: number) {
        return this.http.get<Parish>(`${this.baseUrl}/parishes/${id}`);
    }

    createParish(parish: Partial<Parish>) {
        const payload: any = { ...parish };
        if (payload.stateId) payload.state = { stateId: payload.stateId };
        if (payload.dioceseId) payload.diocese = { dioceseId: payload.dioceseId };
        delete payload.stateId;
        delete payload.dioceseId;
        return this.http.post<Parish>(`${this.baseUrl}/parishes`, payload);
    }

    updateParish(id: number, parish: Partial<Parish>) {
        const payload: any = { ...parish };
        if (payload.stateId) payload.state = { stateId: payload.stateId };
        if (payload.dioceseId) payload.diocese = { dioceseId: payload.dioceseId };
        delete payload.stateId;
        delete payload.dioceseId;
        return this.http.put<Parish>(`${this.baseUrl}/parishes/${id}`, payload);
    }

    deleteParish(id: number) {
        return this.http.delete(`${this.baseUrl}/parishes/${id}`);
    }
}