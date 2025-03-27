import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { CrusadeService, Crusade } from '../rosary-crusade/crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';

@Component({
  standalone: true,
  selector: 'app-crusade-query',
  templateUrl: './crusade-query.component.html',
  styleUrls: ['./crusade-query.component.scss'],
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
})
export class CrusadeQueryComponent implements OnInit {
  // Columns for the results grid
  columns = [
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'Parish', field: 'parishName' },
    { header: 'StateID', field: 'StateID' },
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

  // Real states from the back-end
  allStates: State[] = [];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // Filtered subsets
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  // Flags to enable/disable diocese & parish
  dioceseDisabled = true;
  parishDisabled = true;

  // Current filter selections
  // 0 => "All States", null => "All Dioceses/Parishes"
  selectedStateID = 0;
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;

  // Query results
  results: Crusade[] = [];

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
    // Initially disable diocese & parish
    this.dioceseDisabled = true;
    this.parishDisabled = true;
  }

  /* -----------------------------
     LOAD
  ----------------------------- */
  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      // If the response is { success, status, message, data: [... States ...] }
      next: (res: any) => {
        this.allStates = res.data; // an array of State objects
      },
      error: (err) => {
        console.error('Failed to load states:', err);
        this.showError('Error loading states from server.');
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        // res.data => array of Dioceses
        this.dioceseList = res.data;
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
        this.showError('Error loading dioceses.');
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (res: any) => {
        // res.data => array of Parishes
        this.parishList = res.data;
      },
      error: (err) => {
        console.error('Failed to load parishes:', err);
        this.showError('Error loading parishes.');
      }
    });
  }

  /* -----------------------------
     FILTER LOGIC
  ----------------------------- */
  onStateChange(): void {
    if (!this.selectedStateID || this.selectedStateID === 0) {
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedDioceseID = null;
      this.selectedParishID = null;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    } else {
      const chosenStateID = Number(this.selectedStateID);
      this.filteredDioceses = this.dioceseList.filter(d => d.StateID === chosenStateID);
      if (this.filteredDioceses.length === 0) {
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.selectedDioceseID = null;
        this.selectedParishID = null;
        this.filteredParishes = [];
      } else {
        this.dioceseDisabled = false;
        this.selectedDioceseID = null;
        this.selectedParishID = null;
        this.filteredParishes = [];
        this.parishDisabled = true;
      }
    }
  }

  onDioceseChange(): void {
    if (this.selectedDioceseID == null) {
      this.parishDisabled = true;
      this.selectedParishID = null;
      this.filteredParishes = [];
    } else {
      const chosenDioceseID = Number(this.selectedDioceseID);
      const temp = this.parishList.filter(p => p.DioceseID === chosenDioceseID);
      if (temp.length === 0) {
        this.parishDisabled = true;
        this.selectedParishID = null;
        this.filteredParishes = [];
      } else {
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
      stateID: this.selectedStateID || '(All)',
      dioceseID: this.selectedDioceseID ?? '(All)',
      parishID: this.selectedParishID ?? '(All)',
    });

    const stateID = this.selectedStateID > 0 ? this.selectedStateID : undefined;
    const dioceseID = this.selectedDioceseID != null ? this.selectedDioceseID : undefined;
    const parishID = this.selectedParishID != null ? this.selectedParishID : undefined;

    // If searchCrusades also returns { success, data: [ ... ] }, do data.data
    this.crusadeService.searchCrusades(stateID, dioceseID, parishID).subscribe({
      next: (res: any) => {
        // res.data => array of Crusade
        this.results = res.data;
        console.log('Crusade query results =>', this.results);
      },
      error: (err) => {
        console.error('Failed to search crusades =>', err);
        this.showError('Fatal error searching Crusades!');
      }
    });
  }

  /* -----------------------------
     TABLE
  ----------------------------- */
  getCellValue(row: Crusade, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '(No Diocese)';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '(No Parish)';
    } else {
      return (row as any)[column.field] || '';
    }
  }

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
