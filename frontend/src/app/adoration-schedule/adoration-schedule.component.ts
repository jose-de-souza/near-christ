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

  // Master lists of all Dioceses, all Parishes, and States
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // Filtered arrays for the dropdowns
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  // Flags to enable/disable dropdowns
  dioceseDisabled = true;
  parishDisabled = true;

  // The currently selected or new Adoration record
  selectedAdoration: Partial<Adoration> = {
    AdorationID: undefined,
    DioceseID: 0,
    ParishID: 0,
    State: '',
    AdorationType: 'Regular',          // default
    AdorationLocationType: 'Other',    // default
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
    // Initialize with empty filtered arrays
    this.filteredDioceses = [];
    this.filteredParishes = [];
  }

  /* ---------------------------------------
     PERPETUAL vs. REGULAR
     --------------------------------------- */
  isPerpetual(): boolean {
    return this.selectedAdoration.AdorationType === 'Perpetual';
  }

  onAdorationTypeChange(): void {
    if (this.isPerpetual()) {
      this.selectedAdoration.AdorationDay = '';
      this.selectedAdoration.AdorationStart = '';
      this.selectedAdoration.AdorationEnd = '';
    }
  }

  /* ---------------------------------------
     STATE => filter Dioceses & disable if not set
     --------------------------------------- */
  onStateChange(): void {
    if (!this.selectedAdoration.State) {
      // No state selected: clear & disable diocese & parish
      this.filteredDioceses = [];
      this.filteredParishes = [];
      this.selectedAdoration.DioceseID = undefined;
      this.selectedAdoration.ParishID = undefined;
      this.dioceseDisabled = true;
      this.parishDisabled = true;
    } else {
      // Filter dioceseList by chosen state
      const chosenState = this.selectedAdoration.State;
      this.filteredDioceses = this.dioceseList.filter(d => d.DioceseState === chosenState);
      if (this.filteredDioceses.length === 0) {
        // No dioceses available: clear & disable diocese & parish
        this.selectedAdoration.DioceseID = undefined;
        this.selectedAdoration.ParishID = undefined;
        this.filteredParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
      } else {
        // Enable diocese dropdown; clear previous diocese & parish selection
        this.dioceseDisabled = false;
        this.selectedAdoration.DioceseID = undefined;
        this.selectedAdoration.ParishID = undefined;
        this.filteredParishes = [];
        // Keep parish disabled until a diocese is selected
        this.parishDisabled = true;
      }
    }
  }

  /* ---------------------------------------
     DIOCESE => filter Parishes & disable if not set
     --------------------------------------- */
  onDioceseChange(): void {
    if (!this.selectedAdoration.DioceseID || this.selectedAdoration.DioceseID === 0) {
      // No diocese selected: clear & disable parish
      this.filteredParishes = [];
      this.selectedAdoration.ParishID = undefined;
      this.parishDisabled = true;
    } else {
      // Filter parishes by chosen diocese
      const chosenID = Number(this.selectedAdoration.DioceseID);
      this.filteredParishes = this.parishList.filter(p => p.DioceseID === chosenID);
      if (this.filteredParishes.length === 0) {
        // No parishes available: clear & disable parish
        this.selectedAdoration.ParishID = undefined;
        this.parishDisabled = true;
      } else {
        // Enable parish dropdown and clear previous parish selection
        this.parishDisabled = false;
        this.selectedAdoration.ParishID = undefined;
      }
    }
  }

  /* ---------------------------------------
     PARISH CHURCH vs. OTHER for Location
     --------------------------------------- */
  isParishChurch(): boolean {
    return this.selectedAdoration.AdorationLocationType === 'Parish Church';
  }

  updateLocationFromParish(): void {
    if (this.isParishChurch()) {
      const chosenParishID = Number(this.selectedAdoration.ParishID);
      const p = this.parishList.find(par => par.ParishID === chosenParishID);
      if (p) {
        this.selectedAdoration.AdorationLocation =
          `${p.ParishStNumber} ${p.ParishStName}, ${p.ParishSuburb} ${p.ParishState} ${p.ParishPostcode}`.trim() || '';
      } else {
        this.selectedAdoration.AdorationLocation = '';
      }
    } else {
      this.selectedAdoration.AdorationLocation = '';
    }
  }

  /* ---------------------------------------
     DRAG & DROP
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
     LOAD / CRUD
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
      next: (data) => {
        this.dioceseList = data;
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load dioceses:', err);
          this.showError('Fatal Error! Please contact support!');
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
          this.showError('Fatal Error! Please contact support!');
        }
      }
    });
  }

  /* ---------------------------------------
     TABLE RENDERING
     --------------------------------------- */
  getCellValue(row: Adoration, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  /* ---------------------------------------
     SELECT ROW: Enable Dropdowns and Populate Data
     --------------------------------------- */
  selectSchedule(schedule: Adoration): void {
    // Copy the record to selectedAdoration
    this.selectedAdoration = { ...schedule };

    // If the record has a state, force the state-change logic to run to enable diocese dropdown.
    if (schedule.State && schedule.State.trim() !== '') {
      this.onStateChange();
      this.selectedAdoration.State = schedule.State;
    }
    // If a valid diocese is present, set it and run the diocese-change logic to enable parish dropdown.
    if (schedule.DioceseID && schedule.DioceseID > 0) {
      this.selectedAdoration.DioceseID = schedule.DioceseID;
      this.onDioceseChange();
    }
    // If a valid parish is present, simply assign it.
    if (schedule.ParishID && schedule.ParishID > 0) {
      this.selectedAdoration.ParishID = schedule.ParishID;
    }
  }

  /* ---------------------------------------
     CRUD METHODS
     --------------------------------------- */
  addSchedule(): void {
    this.adorationService.createAdoration(this.selectedAdoration).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        if (err.status !== 403) {
          if (err.error?.error === 'Error creating adoration') {
            this.showWarning('Verify all mandatory fields!');
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
      AdorationType: 'Regular',
      AdorationLocationType: 'Other',
      AdorationLocation: '',
      AdorationDay: '',
      AdorationStart: '',
      AdorationEnd: ''
    };
    this.filteredDioceses = [];
    this.filteredParishes = [];
    this.dioceseDisabled = true;
    this.parishDisabled = true;
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
