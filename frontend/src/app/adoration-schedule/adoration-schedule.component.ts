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

  /* -----------------------------
     1) Perpetual vs. Regular
     ----------------------------- */
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

  /* -----------------------------
     2) State => filter Dioceses
     ----------------------------- */
  onStateChange(): void {
    if (!this.selectedAdoration.State) {
      // If no state selected => clear & disable diocese & parish
      this.filteredDioceses = [];
      this.filteredParishes = [];
      this.selectedAdoration.DioceseID = undefined;
      this.selectedAdoration.ParishID = undefined;
      this.dioceseDisabled = true;
      this.parishDisabled = true;
    } else {
      // Filter diocese by state
      const chosenState = this.selectedAdoration.State;
      this.filteredDioceses = this.dioceseList.filter(d => d.DioceseState === chosenState);

      if (this.filteredDioceses.length === 0) {
        // No diocese found => clear & disable diocese & parish
        this.selectedAdoration.DioceseID = undefined;
        this.selectedAdoration.ParishID = undefined;
        this.filteredParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
      } else {
        // Enable diocese dropdown
        this.dioceseDisabled = false;
        // Clear old selection
        this.selectedAdoration.DioceseID = undefined;
        // Clear & disable parish until user picks diocese
        this.filteredParishes = [];
        this.selectedAdoration.ParishID = undefined;
        this.parishDisabled = true;
      }
    }
  }

  /* -----------------------------
     3) Diocese => filter Parishes
     ----------------------------- */
  onDioceseChange(): void {
    if (!this.selectedAdoration.DioceseID) {
      // If no diocese => clear & disable parish
      this.filteredParishes = [];
      this.selectedAdoration.ParishID = undefined;
      this.parishDisabled = true;
    } else {
      // Filter parish by chosen diocese
      const chosenID = Number(this.selectedAdoration.DioceseID);
      this.filteredParishes = this.parishList.filter(p => p.DioceseID === chosenID);

      if (this.filteredParishes.length === 0) {
        // No parishes => clear & disable
        this.selectedAdoration.ParishID = undefined;
        this.parishDisabled = true;
      } else {
        // Enable parish dropdown
        this.parishDisabled = false;
        // Clear old selection
        this.selectedAdoration.ParishID = undefined;
      }
    }
  }

  /* -----------------------------
     4) Parish Church vs. Other
     ----------------------------- */
  isParishChurch(): boolean {
    return this.selectedAdoration.AdorationLocationType === 'Parish Church';
  }

  updateLocationFromParish(): void {
    if (this.isParishChurch()) {
      const chosenParishID = Number(this.selectedAdoration.ParishID);
      const p = this.parishList.find(par => par.ParishID === chosenParishID);
      if (p) {
        this.selectedAdoration.AdorationLocation =
          `${p.ParishStNumber} ${p.ParishStName}, ${p.ParishSuburb} ${p.ParishState} ${p.ParishPostcode}` || '';
      } else {
        this.selectedAdoration.AdorationLocation = '';
      }
    } else {
      this.selectedAdoration.AdorationLocation = '';
    }
  }

  /* -----------------------------
     5) DRAG & DROP
     ----------------------------- */
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
     6) LOAD / CRUD
     ----------------------------- */
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
        // If needed, we could pre-filter if there's an initial state
      },
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
      next: (data) => {
        this.parishList = data;
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load all parishes:', err);
          this.showError('Fatal Error! Please contact support!');
        }
      }
    });
  }

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
    // Also reset filtered arrays & disable
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
