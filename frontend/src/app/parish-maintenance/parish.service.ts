import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Environment config (adjust if you have a different path)
import { environment } from '../../environments/environment';

export interface Parish {
    ParishID: number; // The real PK from the backend
    ParishName: string;
    ParishStNumber: string;
    ParishStName: string;
    ParishSuburb: string;
    ParishState: string;
    ParishPostcode: string;
    ParishPhone: string;
    ParishEmail: string;
    ParishWebsite: string;
}

@Injectable({
    providedIn: 'root'
})
export class ParishService {
    private baseUrl = environment.apiUrl; // e.g., "http://localhost:8000"

    constructor(private http: HttpClient) { }

    // GET all parishes
    getAllParishes() {
        return this.http.get<Parish[]>(`${this.baseUrl}/parishes`);
    }

    // GET single parish by ID
    getParishById(id: number) {
        return this.http.get<Parish>(`${this.baseUrl}/parishes/${id}`);
    }

    // POST create new parish
    createParish(parish: Partial<Parish>) {
        return this.http.post<Parish>(`${this.baseUrl}/parishes`, parish);
    }

    // PUT update existing parish by ID
    updateParish(id: number, parish: Partial<Parish>) {
        return this.http.put<Parish>(`${this.baseUrl}/parishes/${id}`, parish);
    }

    // DELETE a parish by ID
    deleteParish(id: number) {
        return this.http.delete(`${this.baseUrl}/parishes/${id}`);
    }
}
