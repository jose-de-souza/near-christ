import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ParishService, Parish } from './parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';

@Component({
  selector: 'app-parish-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule],
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss']
})
export class ParishMaintenanceComponent implements OnInit {
  // Full list of parishes
  allParishes: Parish[] = [];
  // Displayed list (filtered)
  parishes: Parish[] = [];

  hasSubmitted = false;

  // Full list of states from back end
  allStates: State[] = [];

  // The parish being edited
  selectedParish: Partial<Parish> = {
    ParishID: undefined,
    ParishName: '',
    ParishStNumber: '',
    ParishStName: '',
    ParishSuburb: '',
    StateID: 0,
    ParishPostcode: '',
    ParishPhone: '',
    ParishEmail: '',
    ParishWebsite: '',
    // DioceseID: 0 if you want that
  };

  // Table columns
  columns = [
    { header: 'Parish Name', field: 'ParishName' },
    { header: 'St No', field: 'ParishStNumber' },
    { header: 'Street Name', field: 'ParishStName' },
    { header: 'Suburb', field: 'ParishSuburb' },
    { header: 'StateID', field: 'StateID' },
    { header: 'PostCode', field: 'ParishPostcode' },
    { header: 'Phone', field: 'ParishPhone' },
    { header: 'Email', field: 'ParishEmail' },
    { header: 'Website', field: 'ParishWebsite' }
  ];

  // Diocese data for filtering
  dioceseList: Diocese[] = [];
  filteredDiocesesForFilter: Diocese[] = [];

  // Filter properties
  filterStateID = 0;
  filterDioceseID = 0;
  dioceseFilterDisabled = true;

  constructor(
    private parishService: ParishService,
    private dioceseService: DioceseService,
    private stateService: StateService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  /* ---------------------------
     Load States
  --------------------------- */
  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      // If your backend returns { success, data: [ {StateID, StateName}, ... ] }
      next: (res: any) => {
        this.allStates = res.data; // The .data array
      },
      error: (err: any) => {
        console.error('Failed to load states:', err);
        this.showError('Could not load states from server.');
      }
    });
  }

  /* ---------------------------
     Load Dioceses
  --------------------------- */
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        this.dioceseList = res.data; // The .data array
      },
      error: (err: any) => {
        console.error('Failed to load dioceses:', err);
        this.showError('Could not load dioceses from server.');
      }
    });
  }

  /* ---------------------------
     Load Parishes
  --------------------------- */
  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (res: any) => {
        // res.data => array of Parish objects
        this.allParishes = res.data;
        this.parishes = res.data;
      },
      error: (err: any) => {
        console.error('Failed to load parishes:', err);
        this.showError('Fatal error loading parishes!');
      }
    });
  }

  /* ---------------------------
     CRUD
  --------------------------- */
  addParish(): void {
    this.hasSubmitted = true;
    if (!this.selectedParish.ParishName?.trim()) {
      this.showWarning('Parish Name is required!');
      return;
    }
    this.parishService.createParish(this.selectedParish).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Failed to create parish:', err);
        this.showError('Fatal error creating parish!');
      }
    });
  }

  modifyParish(): void {
    if (!this.selectedParish.ParishID) {
      this.showWarning('No parish selected to update!');
      return;
    }
    const id = this.selectedParish.ParishID;
    this.parishService.updateParish(id, this.selectedParish).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Failed to update parish:', err);
        this.showError('Fatal error updating parish!');
      }
    });
  }

  deleteParish(): void {
    if (!this.selectedParish.ParishID) {
      this.showWarning('No parish selected to delete!');
      return;
    }
    const id = this.selectedParish.ParishID;
    this.parishService.deleteParish(id).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Failed to delete parish:', err);
        this.showError('Fatal error deleting parish!');
      }
    });
  }

  cancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedParish = {
      ParishID: undefined,
      ParishName: '',
      ParishStNumber: '',
      ParishStName: '',
      ParishSuburb: '',
      StateID: 0,
      ParishPostcode: '',
      ParishPhone: '',
      ParishEmail: '',
      ParishWebsite: ''
    };
    this.hasSubmitted = false;
  }

  selectParish(parish: Parish): void {
    this.selectedParish = { ...parish };
    this.hasSubmitted = false;
  }

  /* ---------------------------
     FILTERS
  --------------------------- */
  onFilterStateChange(): void {
    if (!this.filterStateID || this.filterStateID === 0) {
      // Show all
      this.filteredDiocesesForFilter = [];
      this.filterDioceseID = 0;
      this.dioceseFilterDisabled = true;
      this.parishes = this.allParishes;
    } else {
      // Filter diocese by the chosen state
      this.filteredDiocesesForFilter = this.dioceseList.filter(d => d.StateID === this.filterStateID);
      this.dioceseFilterDisabled = (this.filteredDiocesesForFilter.length === 0);
      this.applyParishFilter();
    }
  }

  onFilterDioceseChange(): void {
    this.applyParishFilter();
  }

  private applyParishFilter(): void {
    if (!this.filterStateID || this.filterStateID === 0) {
      this.parishes = this.allParishes;
    } else {
      let filtered = this.allParishes.filter(p => p.StateID === this.filterStateID);
      if (this.filterDioceseID && this.filterDioceseID > 0) {
        filtered = filtered.filter(p => p.DioceseID === this.filterDioceseID);
      }
      this.parishes = filtered;
    }
  }

  /* ---------------------------
     DRAG & DROP
  --------------------------- */
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  onDragEntered(event: any): void {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any): void {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  getCellValue(row: Parish, column: { header: string; field: string }): any {
    return (row as any)[column.field] || '';
  }

  trackByParishID(index: number, item: Parish): number {
    return item.ParishID;
  }

  trackByParishColumn(index: number, item: any) {
    return item.field;
  }

  /* ---------------------------
     SNACK BAR
  --------------------------- */
  private showWarning(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 7000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}
