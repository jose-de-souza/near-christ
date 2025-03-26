import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { Adoration, AdorationService } from './adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  selector: 'app-adoration-schedule',
  templateUrl: './adoration-schedule.component.html',
  styleUrls: ['./adoration-schedule.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
})
export class AdorationScheduleComponent implements OnInit {
  // Columns for the results table
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

  // The array of Adoration records
  schedules: Adoration[] = [];

  // Arrays for dropdowns
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // The currently selected or new Adoration record
  // 1) Default AdorationType = 'Regular'
  // 2) Default AdorationLocationType = 'Other'
  selectedAdoration: Partial<Adoration> = {
    AdorationID: undefined,
    DioceseID: 0,
    ParishID: 0,
    State: '',
    AdorationType: 'Regular',
    AdorationLocationType: 'Other',
    AdorationLocation: '',
    AdorationDay: '',
    AdorationStart: '',
    AdorationEnd: ''
  };

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllAdorations();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  /* ---------------------------------------
     1) Perpetual vs. Regular
     --------------------------------------- */
  isPerpetual(): boolean {
    return this.selectedAdoration.AdorationType === 'Perpetual';
  }

  onAdorationTypeChange(): void {
    if (this.isPerpetual()) {
      // Clear Day/Start/End
      this.selectedAdoration.AdorationDay = '';
      this.selectedAdoration.AdorationStart = '';
      this.selectedAdoration.AdorationEnd = '';
    }
  }

  /* ---------------------------------------
     2) Parish Church vs. Other
     --------------------------------------- */
  isParishChurch(): boolean {
    return this.selectedAdoration.AdorationLocationType === 'Parish Church';
  }

  /**
   * If user picks 'Parish Church', set location to the parish address (if available) and disable the field.
   * If user picks 'Other', clear location and enable the field.
   * Called whenever either the location type or parish changes.
   */
  updateLocationFromParish(): void {
    if (this.isParishChurch()) {
      // Find the selected parish in parishList
      const chosenID = Number(this.selectedAdoration.ParishID);
      const p = this.parishList.find(par => par.ParishID === chosenID);
      if (p) {
        // We'll assume p has something like p.ParishAddress or build from p.ParishStName, p.ParishSuburb, etc.
        // Example:
        this.selectedAdoration.AdorationLocation = `${p.ParishStNumber} ${p.ParishStName}, ${p.ParishSuburb} ${p.ParishState} ${p.ParishPostcode}` || '';
      } else {
        // If no parish is selected or no address
        this.selectedAdoration.AdorationLocation = '';
      }
    } else {
      // If 'Other', clear the location
      this.selectedAdoration.AdorationLocation = '';
    }
  }

  /* ---------------------------------------
     3) DRAG & DROP
     --------------------------------------- */
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

  /* ---------------------------------------
     4) LOAD / CRUD
     --------------------------------------- */
  loadAllAdorations(): void {
    this.adorationService.getAllAdorations().subscribe({
      next: (data) => (this.schedules = data),
      error: (err) => {
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
        if (err.status !== 403) {
          console.error('Failed to load all parishes:', err);
          this.showError('Fatal Error! Please contact support!');
        }
      }
    });
  }

  // Return the correct cell value for each column
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
    // Copy the existing record
    this.selectedAdoration = { ...schedule };
  }

  addSchedule(): void {
    this.adorationService.createAdoration(this.selectedAdoration).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        if (err.status !== 403) {
          if (err.error?.error === "Error creating adoration") {
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

  private resetForm(): void {
    this.selectedAdoration = {
      AdorationID: undefined,
      DioceseID: 0,
      ParishID: 0,
      State: '',
      // Default to 'Regular'
      AdorationType: 'Regular',
      // Default to 'Other'
      AdorationLocationType: 'Other',
      AdorationLocation: '',
      AdorationDay: '',
      AdorationStart: '',
      AdorationEnd: ''
    };
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
}
