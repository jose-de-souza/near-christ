import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

import { AdorationService, Adoration } from '../adoration-schedule/adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  standalone: true,
  selector: 'app-adoration-query',
  templateUrl: './adoration-query.component.html',
  styleUrls: ['./adoration-query.component.scss'],
  imports: [CommonModule, FormsModule, DragDropModule]
})
export class AdorationQueryComponent implements OnInit {
  // The columns we'll display
  columns = [
    { header: 'Parish Name', field: 'parishName' },
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'State', field: 'State' },
    { header: 'End', field: 'AdorationEnd' },
    { header: 'Type', field: 'AdorationType' },
    { header: 'Day', field: 'AdorationDay' },
    { header: 'Location', field: 'AdorationLocation' },
    { header: 'Location Type', field: 'AdorationLocationType' },
    { header: 'Start', field: 'AdorationStart' },
  ];

  // Master arrays
  states = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // Filtered arrays for the dropdowns
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  // Flags to enable/disable the diocese & parish dropdown
  dioceseDisabled = true;
  parishDisabled = true;

  // The user’s current filter selections
  // "All States" => selectedState = ""; "All Dioceses" => selectedDioceseID = null; "All Parishes" => selectedParishID = null
  selectedState: string = '';
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;

  // The array of results from the backend
  results: Adoration[] = [];

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService
  ) { }

  ngOnInit(): void {
    this.loadAllDioceses();
    this.loadAllParishes();
    // Initially show "All" => all in filtered arrays
    this.filteredDioceses = [];
    this.filteredParishes = [];
    // Since no state is chosen => diocese & parish disabled
    this.dioceseDisabled = true;
    this.parishDisabled = true;
  }

  /* -----------------------------
     STATE => filter Dioceses
     ----------------------------- */
  onStateChange(): void {
    if (!this.selectedState) {
      // "All States" => disable diocese & parish
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedDioceseID = null;
      this.selectedParishID = null;
      // Clear filtered arrays or set them to empty
      this.filteredDioceses = [];
      this.filteredParishes = [];
    } else {
      // Filter diocese by chosen state
      this.filteredDioceses = this.dioceseList.filter(d => d.DioceseState === this.selectedState);

      if (this.filteredDioceses.length === 0) {
        // No diocese => disable diocese & parish
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.selectedDioceseID = null;
        this.selectedParishID = null;
        this.filteredParishes = [];
      } else {
        // Enable diocese
        this.dioceseDisabled = false;
        // Clear old diocese & parish
        this.selectedDioceseID = null;
        this.selectedParishID = null;
        this.filteredParishes = [];
        // Parish stays disabled until a diocese is chosen
        this.parishDisabled = true;
      }
    }
  }

  /* -----------------------------
     DIOCESE => filter Parishes
     ----------------------------- */
  onDioceseChange(): void {
    if (this.selectedDioceseID == null) {
      // "All Dioceses" => disable parish
      this.parishDisabled = true;
      this.selectedParishID = null;
      this.filteredParishes = [];
    } else {
      // Filter parishes by chosen diocese
      const chosenID = Number(this.selectedDioceseID);
      const temp = this.parishList.filter(p => p.DioceseID === chosenID);
      if (temp.length === 0) {
        // No parishes => disable parish
        this.parishDisabled = true;
        this.selectedParishID = null;
        this.filteredParishes = [];
      } else {
        // Enable parish
        this.parishDisabled = false;
        this.selectedParishID = null;
        this.filteredParishes = temp;
      }
    }
  }

  /* -----------------------------
     SEARCH
     ----------------------------- */
  searchAdoration(): void {
    console.log('User selected =>', {
      state: this.selectedState || '(All)',
      dioceseID: this.selectedDioceseID ?? '(All)',
      parishID: this.selectedParishID ?? '(All)',
    });

    // Convert blank or null to undefined so they're not used in query
    const state = this.selectedState ? this.selectedState : undefined;
    const dioceseID = this.selectedDioceseID != null ? this.selectedDioceseID : undefined;
    const parishID = this.selectedParishID != null ? this.selectedParishID : undefined;

    this.adorationService.searchAdorations(state, dioceseID, parishID).subscribe({
      next: (data) => {
        this.results = data;
        console.log('Adoration query results =>', data);
      },
      error: (err) => {
        console.error('Failed to search adorations =>', err);
      }
    });
  }

  /* -----------------------------
     TABLE
     ----------------------------- */
  getCellValue(row: Adoration, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '';
    } else {
      return (row as any)[column.field] ?? '';
    }
  }

  /* -----------------------------
     DRAG & DROP
     ----------------------------- */
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  onDragEntered(event: any) {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any) {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  /* -----------------------------
     LOAD
     ----------------------------- */
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => {
        this.dioceseList = data;
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => {
        this.parishList = data;
      },
      error: (err) => {
        console.error('Failed to load parishes:', err);
      }
    });
  }
}
