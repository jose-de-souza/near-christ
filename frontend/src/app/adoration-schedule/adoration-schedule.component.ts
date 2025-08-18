import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Adoration, AdorationService } from './adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';
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
    MatDialogModule,
    MatTooltipModule
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
  filteredParishes: Parish[] = []; // Fixed type from Diocese[] to Parish[]
  dioceseDisabled = true;
  parishDisabled = true;
  hasSubmitted = false;
  uiMode: 'view' | 'editing' = 'view';

  selectedAdoration: Partial<Adoration> = {
    adorationId: undefined,
    dioceseId: 0,
    parishId: 0,
    stateId: 0,
    adorationType: 'Regular',
    adorationLocationType: 'Other',
    adorationLocation: '',
    adorationDay: '',
    adorationStart: '',
    adorationEnd: ''
  };

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
        this.showError('Fatal error loading Adoration Schedules!');
      }
    });
  }

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

  onStateChange(): void {
    const sID = Number(this.selectedAdoration.stateId || 0);
    if (!sID) {
      this.filteredDioceses = [];
      this.filteredParishes = [];
      this.selectedAdoration.dioceseId = 0;
      this.selectedAdoration.parishId = 0;
      this.dioceseDisabled = true;
      this.parishDisabled = true;
    } else {
      const selectedState = this.allStates.find(s => s.stateId === sID);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.dioceseList.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      this.selectedAdoration.dioceseId = 0;
      this.selectedAdoration.parishId = 0;
      this.filteredParishes = [];
      this.parishDisabled = true;
    }
  }

  onDioceseChange(): void {
    const dID = Number(this.selectedAdoration.dioceseId || 0);
    if (!dID) {
      this.filteredParishes = [];
      this.selectedAdoration.parishId = 0;
      this.parishDisabled = true;
    } else {
      const sID = Number(this.selectedAdoration.stateId || 0);
      this.filteredParishes = this.parishList.filter(p => p.dioceseId === dID && (!sID || p.state?.stateId === sID));
      this.parishDisabled = this.filteredParishes.length === 0;
      this.selectedAdoration.parishId = 0;
    }
  }

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

  selectSchedule(schedule: Adoration): void {
    this.selectedAdoration = { ...schedule };
    this.uiMode = 'editing';
    this.hasSubmitted = false;
    if (schedule.stateId) {
      this.onStateChange();
    }
    if (schedule.dioceseId) {
      this.onDioceseChange();
    }
  }

  isFormValid(): boolean {
    if (!this.selectedAdoration.stateId || this.selectedAdoration.stateId <= 0) return false;
    if (!this.selectedAdoration.dioceseId || this.selectedAdoration.dioceseId <= 0) return false;
    if (!this.selectedAdoration.parishId || this.selectedAdoration.parishId <= 0) return false;
    if (this.selectedAdoration.adorationType === 'Regular') {
      if (!this.selectedAdoration.adorationDay) return false;
      if (!this.selectedAdoration.adorationStart?.trim()) return false;
      if (!this.selectedAdoration.adorationEnd?.trim()) return false;
    }
    return true;
  }

  addSchedule(): void {
    this.hasSubmitted = true;
    if (!this.isFormValid()) {
      this.showWarning('Please fill all required fields.');
      return;
    }
    this.adorationService.createAdoration(this.selectedAdoration).subscribe({
      next: () => {
        this.showInfo('Adoration Schedule has been added');
        this.loadAllAdorations();
        this.resetForm();
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
    this.hasSubmitted = true;
    if (!this.isFormValid()) {
      this.showWarning('Please fill all required fields.');
      return;
    }
    const id = this.selectedAdoration.adorationId;
    this.adorationService.updateAdoration(id, this.selectedAdoration).subscribe({
      next: () => {
        this.showInfo('Adoration Schedule modified');
        this.loadAllAdorations();
        this.resetForm();
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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        message: `Are you sure you wish to delete this Adoration schedule?`
      },
      panelClass: 'orange-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedAdoration.adorationId!;
        this.adorationService.deleteAdoration(id).subscribe({
          next: () => {
            this.loadAllAdorations();
            this.resetForm();
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
      stateId: 0,
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
    this.hasSubmitted = false;
  }

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

  getCellClass(row: Adoration, column: { header: string; field: string }): string {
    if (column.field === 'state' && !row.state?.stateAbbreviation) {
      return 'no-state';
    }
    return '';
  }

  trackByAdorationID(index: number, item: Adoration): number {
    return item.adorationId;
  }

  trackByColumn(index: number, item: any): string {
    return item.field;
  }

  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  onDragEntered(event: CdkDragEnter): void {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }

  onDragExited(event: CdkDragExit): void {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

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