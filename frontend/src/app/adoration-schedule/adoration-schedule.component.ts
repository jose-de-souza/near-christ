import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// IMPORTANT: import the MODULE, not the class
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { Adoration, AdorationService } from './adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  selector: 'app-adoration-schedule',
  templateUrl: './adoration-schedule.component.html',
  styleUrls: ['./adoration-schedule.component.scss'],
  standalone: true,
  // Use MatSnackBarModule in the imports array (not MatSnackBar)
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
})
export class AdorationScheduleComponent implements OnInit {

  // Columns for our grid-based results
  columns = [
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'Parish Name', field: 'parishName' },
    { header: 'Type', field: 'AdorationType' },
    { header: 'Location Type', field: 'AdorationLocationType' },
    { header: 'Location', field: 'AdorationLocation' },
    { header: 'State', field: 'State' },
    { header: 'Day', field: 'AdorationDay' },
    { header: 'Start', field: 'AdorationStart' },
    { header: 'End', field: 'AdorationEnd' },
  ];

  // The schedules array
  schedules: Adoration[] = [];

  // Diocese/Parish arrays for dropdowns
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // States array
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // The record currently being edited
  selectedAdoration: Partial<Adoration> = {
    AdorationID: undefined,
    DioceseID: 0,
    ParishID: 0,
    State: '',
    AdorationType: '',
    AdorationLocation: '',
    AdorationLocationType: '',
    AdorationDay: '',
    AdorationStart: '',
    AdorationEnd: ''
  };

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private snackBar: MatSnackBar // <-- Proper injection of MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllAdorations();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  // For the dynamic grid columns
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

  loadAllAdorations(): void {
    this.adorationService.getAllAdorations().subscribe({
      next: (data) => (this.schedules = data),
      error: (err) => {
        // 403 are intercepted as business logic
        if (err.status !== 403) {
          console.error('Failed to load all adorations:', err);
          this.showError('Fatal Error! Please contact support!');
        }
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => (this.dioceseList = data),
      error: (err) => {
        // 403 are intercepted as business logic
        if (err.status !== 403) {
          console.error('Failed to load all dioceses:', err);
          this.showError('Fatal Error! Please contact support!');
        }
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => (this.parishList = data),
      error: (err) => {
        // 403 are intercepted as business logic
        if (err.status !== 403) {
          console.error('Failed to load all parishes:', err);
          this.showError('Fatal Error! Please contact support!');
        }
      }
    });
  }

  // Return the correct cell value
  getCellValue(row: Adoration, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  selectSchedule(schedule: Adoration): void {
    this.selectedAdoration = { ...schedule };
  }

  addSchedule(): void {
    this.adorationService.createAdoration(this.selectedAdoration).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        // 403 are intercepted as business logic
        if (err.status !== 403) {
          if (err.error.error === "Error creating adoration") {
            this.showWarning("Verify all mandatory fields!");
          } else {
            console.error('Failed to create adoration schedule:', err);
            this.showError('Fatal Error! Please contact support!');
          }
        }
      }
    });
  }

  modifySchedule(): void {
    if (!this.selectedAdoration.AdorationID) {
      this.showWarning('No adoration selected to update!');
      return;
    }
    const id = this.selectedAdoration.AdorationID;
    this.adorationService.updateAdoration(id, this.selectedAdoration).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        // 403 are intercepted as business logic
        if (err.status !== 403) {
          console.error('Failed to update adoration:', err);
          this.showError('Fatal Error! Please contact support!');
        }
      }
    });
  }

  deleteSchedule(): void {
    if (!this.selectedAdoration.AdorationID) {
      this.showWarning('No adoration selected to delete!');
      return;
    }
    const id = this.selectedAdoration.AdorationID;
    this.adorationService.deleteAdoration(id).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        // 403 are intercepted as business logic
        if (err.status !== 403) {
          console.error('Failed to delete adoration schedule:', err);
          this.showError('Fatal Error! Please contact support!');
        }
      }
    });
  }

  cancel(): void {
    this.resetForm();
  }

  trackByAdorationID(index: number, item: Adoration): number {
    return item.AdorationID;
  }

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

  private resetForm(): void {
    this.selectedAdoration = {
      AdorationID: undefined,
      DioceseID: 0,
      ParishID: 0,
      State: '',
      AdorationType: '',
      AdorationLocation: '',
      AdorationLocationType: '',
      AdorationDay: '',
      AdorationStart: '',
      AdorationEnd: ''
    };
  }
}
