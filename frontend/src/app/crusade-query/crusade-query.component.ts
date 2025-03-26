import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { CrusadeService, Crusade } from '../rosary-crusade/crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  standalone: true,
  selector: 'app-crusade-query',
  templateUrl: './crusade-query.component.html',
  styleUrls: ['./crusade-query.component.scss'],
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
})
export class CrusadeQueryComponent implements OnInit {
  // 1) Columns for the grid-based results
  columns = [
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'Parish', field: 'parishName' },
    { header: 'State', field: 'State' },
    { header: 'Confession Start', field: 'ConfessionStartTime' },
    { header: 'Confession End', field: 'ConfessionEndTime' },
    { header: 'Mass Start', field: 'MassStartTime' },
    { header: 'Mass End', field: 'MassEndTime' },
    { header: 'Crusade Start', field: 'CrusadeStartTime' },
    { header: 'Crusade End', field: 'CrusadeEndTime' },
    { header: 'Contact Name', field: 'ContactName' },
    { header: 'Contact Phone', field: 'ContactPhone' },
    { header: 'Contact Email', field: 'ContactEmail' },
    { header: 'Comments', field: 'Comments' },
  ];

  // 2) Master arrays
  states = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // Filtered arrays for the dropdowns
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  // Flags to enable/disable the diocese & parish dropdown
  dioceseDisabled = true;
  parishDisabled = true;

  // 3) Current filter selections
  // "All States" => selectedState = ""
  // "All Dioceses" => selectedDioceseID = null
  // "All Parishes" => selectedParishID = null
  selectedState: string = '';
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;

  // 4) Query results from the backend
  results: Crusade[] = [];

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private snackBar: MatSnackBar // For optional error/warning messages
  ) { }

  ngOnInit(): void {
    this.loadAllDioceses();
    this.loadAllParishes();
    // Start with empty filtered arrays
    this.filteredDioceses = [];
    this.filteredParishes = [];
    // By default, no state => diocese & parish are disabled
    this.dioceseDisabled = true;
    this.parishDisabled = true;
  }

  /* -----------------------------
     DISABLING + FILTER LOGIC
     ----------------------------- */

  onStateChange(): void {
    if (!this.selectedState) {
      // "All States" => disable diocese & parish
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedDioceseID = null;
      this.selectedParishID = null;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    } else {
      // Filter dioceseList by chosen state
      this.filteredDioceses = this.dioceseList.filter(d => d.DioceseState === this.selectedState);

      if (this.filteredDioceses.length === 0) {
        // No diocese => disable both
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
        // Keep parish disabled until a diocese is picked
        this.parishDisabled = true;
      }
    }
  }

  onDioceseChange(): void {
    if (this.selectedDioceseID == null) {
      // "All Dioceses" => disable parish
      this.parishDisabled = true;
      this.selectedParishID = null;
      this.filteredParishes = [];
    } else {
      const chosenID = Number(this.selectedDioceseID);
      const temp = this.parishList.filter(p => p.DioceseID === chosenID);
      if (temp.length === 0) {
        // No parishes => disable
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

  searchCrusade(): void {
    console.log('Searching Crusade with:', {
      state: this.selectedState || '(All)',
      dioceseID: this.selectedDioceseID ?? '(All)',
      parishID: this.selectedParishID ?? '(All)',
    });

    // Convert blank or null to undefined so they're not used in query
    const state = this.selectedState ? this.selectedState : undefined;
    const dioceseID = this.selectedDioceseID != null ? this.selectedDioceseID : undefined;
    const parishID = this.selectedParishID != null ? this.selectedParishID : undefined;

    this.crusadeService.searchCrusades(state, dioceseID, parishID).subscribe({
      next: (data) => {
        this.results = data;
        console.log('Crusade query results =>', data);
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to search crusades =>', err);
          this.showError('Fatal error searching Crusades! Please contact support.');
        }
      }
    });
  }

  /* -----------------------------
     TABLE
     ----------------------------- */

  // Build a dynamic grid layout
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

  // Return the correct cell value for each row & column
  getCellValue(row: Crusade, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '(No Diocese)';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '(No Parish)';
    } else {
      return (row as any)[column.field] || '';
    }
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
        if (err.status !== 403) {
          console.error('Failed to load dioceses:', err);
          this.showError('Fatal error loading dioceses!');
        }
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => {
        this.parishList = data;
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load parishes:', err);
          this.showError('Fatal error loading parishes!');
        }
      }
    });
  }

  /* -----------------------------
     HELPER
     ----------------------------- */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}
