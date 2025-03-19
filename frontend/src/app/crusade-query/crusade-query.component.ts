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

  // 2) Arrays for dropdowns
  states = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // 3) Current filter selections
  selectedState: string = '';
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;

  // 4) Query results from the backend
  results: Crusade[] = [];

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private snackBar: MatSnackBar   // <-- Proper injection of MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  // Build a dynamic grid: one 'auto' column per entry in `columns`
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  // Reorder columns after a drop event
  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  onDragEntered(event: any) {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any) {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  // -------------- LOADING DATA --------------
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => {
        this.dioceseList = data;
      },
      error: (err) => {
        // 403 handled by the interceptor => show a role-based message
        if (err.status !== 403) {
          console.error('Failed to load dioceses:', err);
          this.showError('Fatal error loading dioceses! Please contact support.');
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
        // 403 handled by the interceptor => show a role-based message
        if (err.status !== 403) {
          console.error('Failed to load parishes:', err);
          this.showError('Fatal error loading parishes! Please contact support.');
        }
      }
    });
  }

  // -------------- SEARCH METHOD --------------
  searchCrusade(): void {
    console.log('Searching Crusade with:', {
      state: this.selectedState || '(All)',
      dioceseID: this.selectedDioceseID || '(All)',
      parishID: this.selectedParishID || '(All)',
    });

    const state = this.selectedState ? this.selectedState : undefined;
    const dioceseID = this.selectedDioceseID ? this.selectedDioceseID : undefined;
    const parishID = this.selectedParishID ? this.selectedParishID : undefined;

    this.crusadeService.searchCrusades(state, dioceseID, parishID).subscribe({
      next: (data) => {
        this.results = data;
        console.log('Crusade query results:', data);
      },
      error: (err) => {
        // 403 are handled by the Auth/Role interceptor => show role-based denial
        if (err.status !== 403) {
          console.error('Failed to search crusades:', err);
          this.showError('Fatal error searching Crusades! Please contact support.');
        }
      }
    });
  }

  // Return the correct cell value for each row & column
  getCellValue(row: Crusade, column: { header: string; field: string }): any {
    // Show dioceseName / parishName from nested objects, if present
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '(No Diocese)';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '(No Parish)';
    } else {
      // Fallback to a direct property on the row
      return (row as any)[column.field] || '';
    }
  }

  // -------------- HELPER METHODS --------------
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }

  // (Optional) If you need a warning method:
  private showWarning(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    });
  }
}
