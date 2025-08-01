import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface State {
    stateID: number;
    stateName: string;
    stateAbbreviation: string;
    // ... any other columns in your "State" table
}

@Injectable({
    providedIn: 'root'
})
export class StateService {
    private baseUrl = environment.apiUrl;  // e.g. http://localhost:8000

    constructor(private http: HttpClient) { }

    // GET all states
    getAllStates() {
        return this.http.get<State[]>(`${this.baseUrl}/states`);
    }

    // GET single state by ID
    getStateById(id: number) {
        return this.http.get<State>(`${this.baseUrl}/states/${id}`);
    }

    // POST create new state
    createState(state: Partial<State>) {
        return this.http.post<State>(`${this.baseUrl}/states`, state);
    }

    // PUT update existing state
    updateState(id: number, state: Partial<State>) {
        return this.http.put<State>(`${this.baseUrl}/states/${id}`, state);
    }

    // DELETE a state
    deleteState(id: number) {
        return this.http.delete(`${this.baseUrl}/states/${id}`);
    }
}
