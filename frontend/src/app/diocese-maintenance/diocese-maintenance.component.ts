import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { DioceseService, Diocese } from './diocese.service';

@Component({
  selector: 'app-diocese-maintenance',
  templateUrl: './diocese-maintenance.component.html',
  styleUrls: ['./diocese-maintenance.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
})
export class DioceseMaintenanceComponent implements OnInit {
  // The array of dioceses loaded from the backend
  dioceses: Diocese[] = [];
  // We'll also keep the complete list for filtering purposes.
  allDioceses: Diocese[] = [];

  hasSubmitted = false; // track whether the user tried to submit

  // The diocese currently selected for editing in the form
  selectedDiocese: Partial<Diocese> = {
    DioceseID: undefined,
    DioceseName: '',
    DioceseStreetNo: '',
    DioceseStreetName: '',
    DioceseSuburb: '',
    DioceseState: '',
    DiocesePostcode: '',
    DiocesePhone: '',
    DioceseEmail: '',
    DioceseWebsite: ''
  };

  // States dropdown options
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // Define columns for the drag-and-drop grid
  columns = [
    { header: 'Diocese Name', field: 'DioceseName' },
    { header: 'Street No', field: 'DioceseStreetNo' },
    { header: 'Street Name', field: 'DioceseStreetName' },
    { header: 'Suburb', field: 'DioceseSuburb' },
    { header: 'State', field: 'DioceseState' },
    { header: 'Post Code', field: 'DiocesePostcode' },
    { header: 'Phone', field: 'DiocesePhone' },
    { header: 'Email', field: 'DioceseEmail' },
    { header: 'Website', field: 'DioceseWebsite' },
  ];

  constructor(
    private dioceseService: DioceseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllDioceses();
  }

  // Build a dynamic grid: one 'auto' column per entry in `columns`
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  // Drag-and-drop handlers
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
  getCellValue(row: Diocese, column: { header: string; field: string }): any {
    return (row as any)[column.field] || '';
  }

  // Called when user clicks on a row
  selectDiocese(diocese: Diocese): void {
    this.selectedDiocese = { ...diocese };
  }

  // CRUD methods
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => {
        this.allDioceses = data;
        // Initially, no filter => show all dioceses
        this.dioceses = data;
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load dioceses:', err);
          this.showError('Fatal error loading dioceses! Please contact support.');
        }
      }
    });
  }

  // ---- Filtering by State for the table ----
  // This property holds the current filter. An empty string means "all states".
  filterState: string = '';

  onFilterStateChange(): void {
    if (!this.filterState) {
      // No filter => display all dioceses
      this.dioceses = this.allDioceses;
    } else {
      // Filter the complete list by state
      this.dioceses = this.allDioceses.filter(d => d.DioceseState === this.filterState);
    }
  }

  trackByDioceseID(index: number, item: Diocese): number {
    return item.DioceseID;
  }

  addDiocese(): void {
    this.hasSubmitted = true;
    if (!this.selectedDiocese.DioceseName?.trim()) {
      this.showWarning('Diocese Name is a required field!');
      return;
    }
    this.dioceseService.createDiocese(this.selectedDiocese).subscribe({
      next: () => {
        this.loadAllDioceses();
        this.resetForm();
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to create diocese:', err);
          this.showError('Fatal error creating diocese! Please contact support.');
        }
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
        if (err.status !== 403) {
          console.error('Failed to update diocese:', err);
          this.showError('Fatal error updating diocese! Please contact support.');
        }
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
        if (err.status !== 403) {
          console.error('Failed to delete diocese:', err);
          this.showError('Fatal error deleting diocese! Please contact support.');
        }
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
      DioceseState: '',
      DiocesePostcode: '',
      DiocesePhone: '',
      DioceseEmail: '',
      DioceseWebsite: ''
    };
    this.hasSubmitted = false;
  }

  // ---- SNACK BAR HELPERS ----
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
