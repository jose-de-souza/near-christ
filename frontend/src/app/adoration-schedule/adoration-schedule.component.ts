import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { Adoration, AdorationService } from './adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';

@Component({
  selector: 'app-adoration-schedule',
  templateUrl: './adoration-schedule.component.html',
  styleUrls: ['./adoration-schedule.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
})
export class AdorationScheduleComponent implements OnInit {
  // 1) Changed the State column => { header: 'State', field: 'state' }
  columns = [
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'Parish Name', field: 'parishName' },
    { header: 'Type', field: 'AdorationType' },
    { header: 'Location Type', field: 'AdorationLocationType' },
    { header: 'Location', field: 'AdorationLocation' },
    { header: 'State', field: 'state' }, // <-- was "StateID"
    { header: 'Day', field: 'AdorationDay' },
    { header: 'Start', field: 'AdorationStart' },
    { header: 'End', field: 'AdorationEnd' },
  ];

  // Master lists
  schedules: Adoration[] = [];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];
  allStates: State[] = [];

  // Filtered arrays
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  // Flags
  dioceseDisabled = true;
  parishDisabled = true;

  // The currently selected or new Adoration
  selectedAdoration: Partial<Adoration> = {
    AdorationID: undefined,
    DioceseID: 0,
    ParishID: 0,
    StateID: 0,
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
    private stateService: StateService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
    this.loadAllAdorations();
  }

  /* ----------------------------------
     LOADING DATA
  ---------------------------------- */
  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data;
      },
      error: (err) => {
        console.error('Failed to load states:', err);
        this.showError('Error loading states from server.');
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        this.dioceseList = res.data;
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
        this.showError('Error loading dioceses.');
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (res: any) => {
        this.parishList = res.data;
      },
      error: (err) => {
        console.error('Failed to load parishes:', err);
        this.showError('Error loading parishes.');
      }
    });
  }

  loadAllAdorations(): void {
    this.adorationService.getAllAdorations().subscribe({
      next: (res: any) => {
        this.schedules = res.data;
      },
      error: (err) => {
        console.error('Failed to load adorations:', err);
        this.showError('Error loading adorations from server.');
      }
    });
  }

  /* ----------------------------------
     PERPETUAL vs REGULAR
  ---------------------------------- */
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

  /* ----------------------------------
     STATE => Filter Dioceses
  ---------------------------------- */
  onStateChange(): void {
    const sID = Number(this.selectedAdoration.StateID || 0);
    if (!sID || sID === 0) {
      this.filteredDioceses = [];
      this.filteredParishes = [];
      this.selectedAdoration.DioceseID = 0;
      this.selectedAdoration.ParishID = 0;
      this.dioceseDisabled = true;
      this.parishDisabled = true;
    } else {
      this.filteredDioceses = this.dioceseList.filter(d => d.StateID === sID);
      if (this.filteredDioceses.length === 0) {
        this.selectedAdoration.DioceseID = 0;
        this.selectedAdoration.ParishID = 0;
        this.filteredParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
      } else {
        this.dioceseDisabled = false;
        this.selectedAdoration.DioceseID = 0;
        this.selectedAdoration.ParishID = 0;
        this.filteredParishes = [];
        this.parishDisabled = true;
      }
    }
  }

  /* ----------------------------------
     DIOCESE => Filter Parishes
  ---------------------------------- */
  onDioceseChange(): void {
    const dID = Number(this.selectedAdoration.DioceseID || 0);
    if (!dID || dID === 0) {
      this.filteredParishes = [];
      this.selectedAdoration.ParishID = 0;
      this.parishDisabled = true;
    } else {
      const temp = this.parishList.filter(p => p.DioceseID === dID);
      if (temp.length === 0) {
        this.parishDisabled = true;
        this.selectedAdoration.ParishID = 0;
        this.filteredParishes = [];
      } else {
        this.parishDisabled = false;
        this.selectedAdoration.ParishID = 0;
        this.filteredParishes = temp;
      }
    }
  }

  /* ----------------------------------
     LOCATION
  ---------------------------------- */
  isParishChurch(): boolean {
    return this.selectedAdoration.AdorationLocationType === 'Parish Church';
  }

  updateLocationFromParish(): void {
    if (this.isParishChurch()) {
      const pID = Number(this.selectedAdoration.ParishID || 0);
      const p = this.parishList.find(par => par.ParishID === pID);
      if (p) {
        const addr = `${p.ParishStNumber} ${p.ParishStName}, ${p.ParishSuburb} ${p.ParishPostcode}`.trim();
        this.selectedAdoration.AdorationLocation = addr;
      } else {
        this.selectedAdoration.AdorationLocation = '';
      }
    } else {
      this.selectedAdoration.AdorationLocation = '';
    }
  }

  /* ----------------------------------
     SELECT ROW => Re-ordered logic
  ---------------------------------- */
  selectSchedule(schedule: Adoration): void {
    this.selectedAdoration = { ...schedule };

    // 1) State
    this.selectedAdoration.StateID = schedule.StateID;
    if (schedule.StateID && schedule.StateID > 0) {
      this.onStateChange();
    }

    // 2) Diocese
    this.selectedAdoration.DioceseID = schedule.DioceseID;
    if (schedule.DioceseID && schedule.DioceseID > 0) {
      this.onDioceseChange();
    }

    // 3) Parish
    if (schedule.ParishID && schedule.ParishID > 0) {
      this.selectedAdoration.ParishID = schedule.ParishID;
    }
  }

  /* ----------------------------------
     CRUD
  ---------------------------------- */
  addSchedule(): void {
    this.adorationService.createAdoration(this.selectedAdoration).subscribe({
      next: () => {
        this.showInfo('Adoration Schedule has been added');
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create adoration schedule:', err);
        this.showError('Error creating adoration. Verify all mandatory fields.');
      }
    });
  }

  modifySchedule(): void {
    if (!this.selectedAdoration.AdorationID) {
      this.showWarning('No adoration selected to update!');
      return;
    }
    const id = this.selectedAdoration.AdorationID;
    this.adorationService.updateAdoration(id!, this.selectedAdoration).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to update adoration:', err);
        this.showError('Error updating adoration schedule.');
      }
    });
  }

  deleteSchedule(): void {
    if (!this.selectedAdoration.AdorationID) {
      this.showWarning('No adoration selected to delete!');
      return;
    }
    const id = this.selectedAdoration.AdorationID;
    this.adorationService.deleteAdoration(id!).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to delete adoration:', err);
        this.showError('Error deleting adoration schedule.');
      }
    });
  }

  cancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedAdoration = {
      AdorationID: undefined,
      DioceseID: 0,
      ParishID: 0,
      StateID: 0,
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

  /* ----------------------------------
     TABLE HELPER
  ---------------------------------- */
  getCellValue(row: Adoration, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '';
    } else if (column.field === 'state') {
      // Return the state's abbreviation from row.state
      return row.state?.StateAbbreviation || '';
    } else {
      return (row as any)[column.field] ?? '';
    }
  }

  trackByAdorationID(index: number, item: Adoration): number {
    return item.AdorationID;
  }

  /* ----------------------------------
     DRAG & DROP
  ---------------------------------- */
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

  /* ----------------------------------
     SNACK BAR
  ---------------------------------- */
  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-info']
    });
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
