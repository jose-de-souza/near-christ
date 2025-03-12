import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrusadeService, Crusade } from '../rosary-crusade/crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  standalone: true,
  selector: 'app-crusade-query',
  templateUrl: './crusade-query.component.html',
  styleUrls: ['./crusade-query.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class CrusadeQueryComponent implements OnInit {

  // For the dropdowns
  states = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // If these are empty/null => "All"
  selectedState: string = '';
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;

  // Query results
  results: Crusade[] = [];

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService
  ) { }

  ngOnInit(): void {
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

  // Called on search button
  searchCrusade(): void {
    console.log('Searching Crusade with:', {
      state: this.selectedState || '(All)',
      dioceseID: this.selectedDioceseID || '(All)',
      parishID: this.selectedParishID || '(All)'
    });

    // Convert “All” to undefined so they aren’t included in query
    const state = this.selectedState ? this.selectedState : undefined;
    const dioceseID = this.selectedDioceseID ? this.selectedDioceseID : undefined;
    const parishID = this.selectedParishID ? this.selectedParishID : undefined;

    this.crusadeService.searchCrusades(state, dioceseID, parishID).subscribe({
      next: (data) => {
        this.results = data;
        console.log('Crusade query results:', data);
      },
      error: (err) => {
        console.error('Failed to search crusades:', err);
      }
    });
  }
}
