import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { DioceseService, Diocese } from './diocese.service';
import { StateService, State } from '../state.service';

@Component({
  selector: 'app-diocese-maintenance',
  templateUrl: './diocese-maintenance.component.html',
  styleUrls: ['./diocese-maintenance.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
})
export class DioceseMaintenanceComponent implements OnInit {

  // Full list of dioceses from the backend
  allDioceses: Diocese[] = [];
  // Filtered subset for the table
  dioceses: Diocese[] = [];

  // All States from the backend
  allStates: State[] = [];

  hasSubmitted = false;

  // The diocese being edited or created
  selectedDiocese: Partial<Diocese> = {
    DioceseID: undefined,
    DioceseName: '',
    DioceseStreetNo: '',
    DioceseStreetName: '',
    DioceseSuburb: '',
    StateID: 0,
    DiocesePostcode: '',
    DiocesePhone: '',
    DioceseEmail: '',
    DioceseWebsite: ''
  };

  // Columns
  columns = [
    { header: 'Diocese Name', field: 'DioceseName' },
    { header: 'Street No', field: 'DioceseStreetNo' },
    { header: 'Street Name', field: 'DioceseStreetName' },
    { header: 'Suburb', field: 'DioceseSuburb' },
    { header: 'StateID', field: 'StateID' },
    { header: 'Post Code', field: 'DiocesePostcode' },
    { header: 'Phone', field: 'DiocesePhone' },
    { header: 'Email', field: 'DioceseEmail' },
    { header: 'Website', field: 'DioceseWebsite' },
  ];

  // For filtering
  filterStateID = 0;

  constructor(
    private dioceseService: DioceseService,
    private stateService: StateService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
  }

  /* ---------------------------
     Load States
  --------------------------- */
  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      // If your backend returns { success, status, message, data: [ ... ] }
      next: (res: any) => {
        this.allStates = res.data; // Must be an array
      },
      error: (err) => {
        console.error('Failed to load states:', err);
        this.showError('Error loading states from server.');
      }
    });
  }

  /* ---------------------------
     Load Dioceses
  --------------------------- */
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        // The .data array of diocese objects
        this.allDioceses = res.data;
        // By default => show them all
        this.dioceses = res.data;
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load dioceses:', err);
          this.showError('Fatal error loading dioceses! Please contact support.');
        }
      }
    });
  }

  /* ---------------------------
     Filtering by StateID
  --------------------------- */
  onFilterStateChange(): void {
    if (!this.filterStateID || this.filterStateID === 0) {
      // "All States"
      this.dioceses = this.allDioceses;
    } else {
      const chosenID = Number(this.filterStateID);
      this.dioceses = this.allDioceses.filter(d => d.StateID === chosenID);
    }
  }

  /* ---------------------------
     Selecting a Diocese row
  --------------------------- */
  selectDiocese(d: Diocese): void {
    this.selectedDiocese = { ...d };
    this.hasSubmitted = false;
  }

  /* ---------------------------
     CRUD METHODS
  --------------------------- */
  addDiocese(): void {
    this.hasSubmitted = true;
    if (!this.selectedDiocese.DioceseName?.trim()) {
      this.showWarning('Diocese Name is required!');
      return;
    }

    this.dioceseService.createDiocese(this.selectedDiocese).subscribe({
      next: () => {
        this.loadAllDioceses();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create diocese:', err);
        this.showError('Fatal error creating diocese! Please contact support.');
      }
    });
  }

  modifyDiocese(): void {
    if (!this.selectedDiocese.DioceseID) {
      this.showWarning('No diocese selected to update!');
      return;
    }
    const id = this.selectedDiocese.DioceseID;
    this.dioceseService.updateDiocese(id, this.selectedDiocese).subscribe({
      next: () => {
        this.loadAllDioceses();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to update diocese:', err);
        this.showError('Fatal error updating diocese! Please contact support.');
      }
    });
  }

  deleteDiocese(): void {
    if (!this.selectedDiocese.DioceseID) {
      this.showWarning('No diocese selected to delete!');
      return;
    }
    const id = this.selectedDiocese.DioceseID;
    this.dioceseService.deleteDiocese(id).subscribe({
      next: () => {
        this.loadAllDioceses();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to delete diocese:', err);
        this.showError('Fatal error deleting diocese! Please contact support.');
      }
    });
  }

  cancel(): void {
    this.resetForm();
  }

  /* ---------------------------
     Reset Form
  --------------------------- */
  private resetForm(): void {
    this.selectedDiocese = {
      DioceseID: undefined,
      DioceseName: '',
      DioceseStreetNo: '',
      DioceseStreetName: '',
      DioceseSuburb: '',
      StateID: 0,
      DiocesePostcode: '',
      DiocesePhone: '',
      DioceseEmail: '',
      DioceseWebsite: ''
    };
    this.hasSubmitted = false;
  }

  /* ---------------------------
     Drag & Drop
  --------------------------- */
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  trackColumn(index: number, item: any) {
    return item.field;
  }

  onDragEntered(event: any): void {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any): void {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  /* ---------------------------
     Cell Value for Table
  --------------------------- */
  getCellValue(row: Diocese, column: { header: string; field: string }): any {
    return (row as any)[column.field] ?? '';
  }

  trackByDioceseID(index: number, item: Diocese): number {
    return item.DioceseID;
  }

  /* ---------------------------
     SNACK BAR HELPERS
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
