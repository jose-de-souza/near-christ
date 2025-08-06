import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Adoration, AdorationService } from './adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';

// Import your new ConfirmationDialog
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-adoration-schedule',
  templateUrl: './adoration-schedule.component.html',
  styleUrls: ['./adoration-schedule.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class AdorationScheduleComponent implements OnInit {
  columns = [
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'Parish Name', field: 'parishName' },
    { header: 'Type', field: 'adorationType' },
    { header: 'Location Type', field: 'adorationLocationType' },
    { header: 'Location', field: 'adorationLocation' },
    { header: 'State', field: 'state' },
    { header: 'Day', field: 'adorationDay' },
    { header: 'Start', field: 'adorationStart' },
    { header: 'End', field: 'adorationEnd' },
  ];

  schedules: Adoration[] = [];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];
  allStates: State[] = [];

  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  dioceseDisabled = true;
  parishDisabled = true;

  selectedAdoration: Partial<Adoration> = {
    adorationId: undefined,
    dioceseId: 0,
    parishId: 0,
    stateID: 0,
    adorationType: 'Regular',
    adorationLocationType: 'Other',
    adorationLocation: '',
    adorationDay: '',
    adorationStart: '',
    adorationEnd: ''
  };

  // === UI mode: 'view' or 'editing'
  uiMode: 'view' | 'editing' = 'view';

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
    return this.selectedAdoration.adorationType === 'Perpetual';
  }

  onAdorationTypeChange(): void {
    if (this.isPerpetual()) {
      this.selectedAdoration.adorationDay = '';
      this.selectedAdoration.adorationStart = '';
      this.selectedAdoration.adorationEnd = '';
    }
  }

  /* ----------------------------------
     STATE => Filter Dioceses
  ---------------------------------- */
  onStateChange(): void {
    const sID = Number(this.selectedAdoration.stateID || 0);
    if (!sID) {
      this.filteredDioceses = [];
      this.filteredParishes = [];
      this.selectedAdoration.dioceseId = 0;
      this.selectedAdoration.parishId = 0;
      this.dioceseDisabled = true;
      this.parishDisabled = true;
    } else {
      this.filteredDioceses = this.dioceseList.filter(d => d.stateID === sID);
      if (this.filteredDioceses.length === 0) {
        this.selectedAdoration.dioceseId = 0;
        this.selectedAdoration.parishId = 0;
        this.filteredParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
      } else {
        this.dioceseDisabled = false;
        this.selectedAdoration.dioceseId = 0;
        this.selectedAdoration.parishId = 0;
        this.filteredParishes = [];
        this.parishDisabled = true;
      }
    }
  }

  /* ----------------------------------
     DIOCESE => Filter Parishes
  ---------------------------------- */
  onDioceseChange(): void {
    const dID = Number(this.selectedAdoration.dioceseId || 0);
    if (!dID) {
      this.filteredParishes = [];
      this.selectedAdoration.parishId = 0;
      this.parishDisabled = true;
    } else {
      const temp = this.parishList.filter(p => p.dioceseId === dID);
      if (temp.length === 0) {
        this.parishDisabled = true;
        this.selectedAdoration.parishId = 0;
        this.filteredParishes = [];
      } else {
        this.parishDisabled = false;
        this.selectedAdoration.parishId = 0;
        this.filteredParishes = temp;
      }
    }
  }

  /* ----------------------------------
     LOCATION
  ---------------------------------- */
  isParishChurch(): boolean {
    return this.selectedAdoration.adorationLocationType === 'Parish Church';
  }

  updateLocationFromParish(): void {
    if (this.isParishChurch()) {
      const pID = Number(this.selectedAdoration.parishId || 0);
      const p = this.parishList.find(par => par.parishId === pID);
      if (p) {
        const addr = `${p.parishStNumber} ${p.parishStName}, ${p.parishSuburb} ${p.parishPostcode}`.trim();
        this.selectedAdoration.adorationLocation = addr;
      } else {
        this.selectedAdoration.adorationLocation = '';
      }
    } else {
      this.selectedAdoration.adorationLocation = '';
    }
  }

  /* ----------------------------------
     SELECT ROW => editing mode
  ---------------------------------- */
  selectSchedule(schedule: Adoration): void {
    this.selectedAdoration = { ...schedule };

    // Switch to editing mode
    this.uiMode = 'editing';

    // 1) State
    if (schedule.stateID) {
      this.onStateChange();
    }

    // 2) Diocese
    if (schedule.dioceseId) {
      this.onDioceseChange();
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
        // Return to view mode
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to create adoration schedule:', err);
        this.showError('Error creating adoration. Verify all mandatory fields.');
      }
    });
  }

  modifySchedule(): void {
    if (!this.selectedAdoration.adorationId) {
      this.showWarning('No adoration selected to update!');
      return;
    }
    const id = this.selectedAdoration.adorationId;
    this.adorationService.updateAdoration(id, this.selectedAdoration).subscribe({
      next: () => {
        this.showInfo('Adoration Schedule modified');
        this.loadAllAdorations();
        this.resetForm();
        // Return to view mode
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to update adoration:', err);
        this.showError('Error updating adoration schedule.');
      }
    });
  }

  deleteSchedule(): void {
    if (!this.selectedAdoration.adorationId) {
      this.showWarning('No adoration selected to delete!');
      return;
    }

    // 1) Show the ConfirmationDialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        message: `Are you sure you wish to delete this Adoration schedule?`
      },
      panelClass: 'orange-dialog'
    });

    // 2) If confirmed => proceed with actual deletion
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedAdoration.adorationId!;
        this.adorationService.deleteAdoration(id).subscribe({
          next: () => {
            this.loadAllAdorations();
            this.resetForm();
            // Return to view mode
            this.uiMode = 'view';
          },
          error: (err) => {
            console.error('Failed to delete adoration:', err);
            this.showError('Error deleting adoration schedule.');
          }
        });
      }
    });
  }

  cancel(): void {
    this.resetForm();
    this.uiMode = 'view';
  }

  private resetForm(): void {
    this.selectedAdoration = {
      adorationId: undefined,
      dioceseId: 0,
      parishId: 0,
      stateID: 0,
      adorationType: 'Regular',
      adorationLocationType: 'Other',
      adorationLocation: '',
      adorationDay: '',
      adorationStart: '',
      adorationEnd: ''
    };
    this.filteredDioceses = [];
    this.filteredParishes = [];
    this.dioceseDisabled = true;
    this.parishDisabled = true;
  }

  /* ----------------------------------
     TABLE HELPERS
  ---------------------------------- */
  getCellValue(row: Adoration, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.dioceseName || '';
    } else if (column.field === 'parishName') {
      return row.parish?.parishName || '';
    } else if (column.field === 'state') {
      return row.state?.stateAbbreviation || '';
    } else {
      return (row as any)[column.field] ?? '';
    }
  }

  trackByAdorationID(index: number, item: Adoration): number {
    return item.adorationId;
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

  onDragEntered(event: any): void {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }

  onDragExited(event: any): void {
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
