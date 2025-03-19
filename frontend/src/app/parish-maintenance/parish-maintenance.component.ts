import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ParishService, Parish } from './parish.service';

@Component({
  selector: 'app-parish-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule],
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss'],
})
export class ParishMaintenanceComponent implements OnInit {
  // The array of parishes loaded from the backend
  parishes: Parish[] = [];

  // For the "required field" logic on ParishName
  hasSubmitted = false;

  // Predefined states for the dropdown
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // The parish record currently selected for editing
  selectedParish: Partial<Parish> = {
    ParishID: undefined,
    ParishName: '',
    ParishStNumber: '',
    ParishStName: '',
    ParishSuburb: '',
    ParishState: '',
    ParishPostcode: '',
    ParishPhone: '',
    ParishEmail: '',
    ParishWebsite: ''
  };

  // Columns for the grid-based results
  columns = [
    { header: 'Parish Name', field: 'ParishName' },
    { header: 'St No', field: 'ParishStNumber' },
    { header: 'Street Name', field: 'ParishStName' },
    { header: 'Suburb', field: 'ParishSuburb' },
    { header: 'State', field: 'ParishState' },
    { header: 'PostCode', field: 'ParishPostcode' },
    { header: 'Phone', field: 'ParishPhone' },
    { header: 'Email', field: 'ParishEmail' },
    { header: 'Website', field: 'ParishWebsite' },
  ];

  constructor(
    private parishService: ParishService,
    private router: Router,
    private snackBar: MatSnackBar  // <-- inject MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllParishes();
  }

  // For the drag-and-drop grid
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
  getCellValue(row: Parish, column: { header: string; field: string }): any {
    return (row as any)[column.field] || '';
  }

  // For *ngFor trackBy
  trackByParishID(index: number, item: Parish) {
    return item.ParishID;
  }

  // Called when user clicks on a row in the results grid
  selectParish(parish: Parish): void {
    this.selectedParish = { ...parish };
  }

  // ----------------------
  //   CRUD OPERATIONS
  // ----------------------
  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => {
        this.parishes = data;
      },
      error: (err) => {
        // 403 handled by the Auth/Role interceptor => show role-based message
        if (err.status !== 403) {
          console.error('Failed to load parishes:', err);
          this.showError('Fatal error loading parishes! Please contact support.');
        }
      }
    });
  }

  // Button: Add new parish
  addParish(): void {
    // Mark that we attempted to submit
    this.hasSubmitted = true;

    // If user left ParishName blank, show warning & skip the API call
    if (!this.selectedParish.ParishName?.trim()) {
      this.showWarning('Parish Name is a required field!');
      return;
    }

    this.parishService.createParish(this.selectedParish).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to create parish:', err);
          this.showError('Fatal error creating parish! Please contact support.');
        }
      }
    });
  }

  // Button: Modify existing parish
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
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to update parish:', err);
          this.showError('Fatal error updating parish! Please contact support.');
        }
      }
    });
  }

  // Button: Delete existing parish
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
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to delete parish:', err);
          this.showError('Fatal error deleting parish! Please contact support.');
        }
      }
    });
  }

  // Button: Cancel
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
      ParishState: '',
      ParishPostcode: '',
      ParishPhone: '',
      ParishEmail: '',
      ParishWebsite: ''
    };
    this.hasSubmitted = false;  // reset the inline error
  }

  // ----------------------
  //   SNACK BAR HELPERS
  // ----------------------
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
