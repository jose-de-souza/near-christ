import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdorationService, Adoration } from '../adoration-schedule/adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  standalone: true,
  selector: 'app-adoration-query',
  templateUrl: './adoration-query.component.html',
  styleUrls: ['./adoration-query.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class AdorationQueryComponent implements OnInit {

  // For the dropdowns
  states = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // The user’s current selections. If empty, that means “All”
  selectedState: string = '';
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;

  // Results from the backend
  results: Adoration[] = [];

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService
  ) {}

  ngOnInit(): void {
    // Load real diocese/parish data
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => { this.dioceseList = data; },
      error: (err) => { console.error('Failed to load dioceses:', err); }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => { this.parishList = data; },
      error: (err) => { console.error('Failed to load parishes:', err); }
    });
  }

  // Called when user clicks the search button
  searchAdoration(): void {
    console.log('User selected:', {
      state: this.selectedState || '(All)',
      dioceseID: this.selectedDioceseID || '(All)',
      parishID: this.selectedParishID || '(All)',
    });

    // If user picks “All,” we pass nothing (undefined) to omit the filter
    const state     = this.selectedState    ? this.selectedState : undefined;
    const dioceseID = this.selectedDioceseID ? this.selectedDioceseID : undefined;
    const parishID  = this.selectedParishID  ? this.selectedParishID : undefined;

    // Call the new search method in AdorationService
    this.adorationService.searchAdorations(state, dioceseID, parishID).subscribe({
      next: (data) => {
        this.results = data;
        console.log('Adoration query results:', data);
      },
      error: (err) => {
        console.error('Failed to search adorations:', err);
      }
    });
  }
}