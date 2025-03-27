import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Parish {
    ParishID: number;  // PK from the backend
    DioceseID: number;
    ParishName: string;
    ParishStNumber: string;
    ParishStName: string;
    ParishSuburb: string;
    // numeric foreign key => references "State" table
    StateID: number;
    ParishPostcode: string;
    ParishPhone: string;
    ParishEmail: string;
    ParishWebsite: string;
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
        return this.http.post<Parish>(`${this.baseUrl}/parishes`, parish);
    }

    updateParish(id: number, parish: Partial<Parish>) {
        return this.http.put<Parish>(`${this.baseUrl}/parishes/${id}`, parish);
    }

    deleteParish(id: number) {
        return this.http.delete(`${this.baseUrl}/parishes/${id}`);
    }
}
