import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
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

  // Full list of dioceses from back end
  allDioceses: Diocese[] = [];
  // Filtered subset displayed in the table
  dioceses: Diocese[] = [];

  // All states from back end
  allStates: State[] = [];

  hasSubmitted = false;

  // The diocese record being edited/created
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

  // Updated columns: "State" column uses field "state"
  columns = [
    { header: 'Diocese Name', field: 'DioceseName' },
    { header: 'Street No', field: 'DioceseStreetNo' },
    { header: 'Street Name', field: 'DioceseStreetName' },
    { header: 'Suburb', field: 'DioceseSuburb' },
    { header: 'State', field: 'state' }, // Changed from "StateID" so that we show the state's abbreviation
    { header: 'Post Code', field: 'DiocesePostcode' },
    { header: 'Phone', field: 'DiocesePhone' },
    { header: 'Email', field: 'DioceseEmail' },
    { header: 'Website', field: 'DioceseWebsite' },
  ];

  // Filter property for the dropdown in the filter section
  filterStateID: any = 0; // 0 means "All States"

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
      next: (res: any) => {
        // Expecting response shape: { success, data: [ ... ] }
        this.allStates = res.data;
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
        // res.data => array of Diocese objects (each may include a "state" relationship)
        this.allDioceses = res.data;
        // By default, show all dioceses
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
     Filter by State
  --------------------------- */
  onFilterStateChange(): void {
    const chosenID = Number(this.filterStateID);
    if (chosenID === 0) {
      // "All States": show all dioceses
      this.dioceses = this.allDioceses;
    } else {
      this.dioceses = this.allDioceses.filter(d => d.StateID === chosenID);
    }
  }

  /* ---------------------------
     Selecting a Diocese Row
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
     DRAG & DROP FOR THE TABLE
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
     Return cell value for each table cell
  --------------------------- */
  getCellValue(row: Diocese, column: { header: string; field: string }): any {
    if (column.field === 'state') {
      // Show the state's abbreviation (from the related state object)
      return row.state?.StateAbbreviation || '';
    } else {
      return (row as any)[column.field] ?? '';
    }
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
