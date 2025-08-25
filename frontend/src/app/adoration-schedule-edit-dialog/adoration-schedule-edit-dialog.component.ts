import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdorationService, Adoration } from '../adoration-schedule/adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T[];
}

@Component({
  selector: 'app-adoration-schedule-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './adoration-schedule-edit-dialog.component.html',
  styleUrls: ['./adoration-schedule-edit-dialog.component.scss']
})
export class AdorationScheduleEditDialogComponent implements OnInit {
  allStates: State[] = [];
  allDioceses: Diocese[] = [];
  allParishes: Parish[] = [];
  hasSubmitted = false;
  uiMode: 'view' | 'editing' = 'view';
  dioceseDisabled: boolean = true;
  parishDisabled: boolean = true;
  dataLoaded: boolean = false;

  selectedAdoration: Partial<Adoration> = {
    adorationId: undefined,
    stateId: 0,
    dioceseId: 0,
    parishId: 0,
    adorationType: 'Regular',
    adorationLocationType: 'Other',
    adorationLocation: '',
    adorationDay: '',
    adorationStart: '',
    adorationEnd: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AdorationScheduleEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Adoration>,
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    if (this.data.adorationId) {
      this.selectedAdoration = { ...this.data };
      this.uiMode = 'editing';
      this.hasSubmitted = false;
    } else {
      this.uiMode = 'view';
    }
    console.log('Initial Dialog Data:', this.data);
    console.log('Initial Selected Adoration:', this.selectedAdoration);
    console.log('Initial uiMode:', this.uiMode);
  }

  private getData<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    return Array.isArray(res.data) ? res.data : [];
  }

  isArray(prop: any): boolean {
    return Array.isArray(prop);
  }

  ngOnInit(): void {
    forkJoin({
      states: this.stateService.getAllStates(),
      dioceses: this.dioceseService.getAllDioceses(),
      parishes: this.parishService.getAllParishes()
    }).subscribe({
      next: ({ states, dioceses, parishes }) => {
        console.log('Dialog Response for states:', states);
        console.log('Dialog Response for dioceses:', dioceses);
        console.log('Dialog Response for parishes:', parishes);
        this.allStates = this.getData<State>(states);
        this.allDioceses = this.getData<Diocese>(dioceses);
        this.allParishes = this.getData<Parish>(parishes);
        this.dioceseDisabled = this.allDioceses.length === 0;
        this.parishDisabled = this.allParishes.length === 0;
        this.dataLoaded = true;
        // If editing, initialize dropdowns
        if (this.selectedAdoration.adorationId) {
          if (this.selectedAdoration.stateId && this.allStates.some(s => s.stateId === this.selectedAdoration.stateId)) {
            this.onStateChange();
          }
          if (this.selectedAdoration.dioceseId && this.allDioceses.some(d => d.dioceseId === this.selectedAdoration.dioceseId)) {
            this.onDioceseChange();
          }
          if (this.selectedAdoration.parishId && this.allParishes.some(p => p.parishId === this.selectedAdoration.parishId)) {
            this.updateLocationFromParish();
          }
        }
        console.log('Dialog Loaded States:', this.allStates.map(s => ({ stateId: s.stateId, stateAbbreviation: s.stateAbbreviation })));
        console.log('Dialog Loaded Dioceses:', this.allDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
        console.log('Dialog Loaded Parishes:', this.allParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName, dioceseId: p.dioceseId })));
        console.log('Dialog Selected Adoration after init:', this.selectedAdoration);
      },
      error: (err) => {
        console.error('Failed to load dialog data:', err);
        this.showError('Error loading data for dialog.');
        this.allStates = [];
        this.allDioceses = [];
        this.allParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.dataLoaded = true;
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
    const stateId = Number(this.selectedAdoration.stateId || 0);
    if (!Array.isArray(this.allDioceses)) {
      console.warn('allDioceses is not an array:', this.allDioceses);
      this.dioceseDisabled = true;
      this.showWarning('No dioceses available for selection.');
      return;
    }
    const currentDioceseId = Number(this.selectedAdoration.dioceseId || 0);
    if (!stateId) {
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedAdoration.dioceseId = 0;
      this.selectedAdoration.parishId = 0;
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      const filteredDioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev));
      this.dioceseDisabled = filteredDioceses.length === 0;
      // Preserve dioceseId if valid
      if (currentDioceseId && !filteredDioceses.some(d => d.dioceseId === currentDioceseId)) {
        this.selectedAdoration.dioceseId = 0;
      }
      // Preserve parishId if valid
      const currentParishId = Number(this.selectedAdoration.parishId || 0);
      if (currentParishId && !this.allParishes.some(p => p.parishId === currentParishId)) {
        this.selectedAdoration.parishId = 0;
      }
      this.parishDisabled = true;
      console.log('Dialog State Changed:', {
        stateId,
        stateAbbreviation: abbrev,
        dioceseDisabled: this.dioceseDisabled,
        selectedDioceseId: this.selectedAdoration.dioceseId,
        selectedParishId: this.selectedAdoration.parishId
      });
    }
    if (this.selectedAdoration.dioceseId) {
      this.onDioceseChange();
    }
  }

  onDioceseChange(): void {
    const dioceseId = Number(this.selectedAdoration.dioceseId || 0);
    if (!Array.isArray(this.allParishes)) {
      console.warn('allParishes is not an array:', this.allParishes);
      this.parishDisabled = true;
      this.showWarning('No parishes available for selection.');
      return;
    }
    const currentParishId = Number(this.selectedAdoration.parishId || 0);
    if (!dioceseId) {
      this.parishDisabled = true;
      // Preserve parishId if valid
      if (currentParishId && !this.allParishes.some(p => p.parishId === currentParishId)) {
        this.selectedAdoration.parishId = 0;
      }
    } else {
      const selectedDiocese = this.allDioceses.find(d => d.dioceseId === dioceseId);
      const filteredParishes = this.allParishes.filter(p => p.dioceseId === dioceseId);
      this.parishDisabled = filteredParishes.length === 0;
      if (this.parishDisabled) {
        this.showWarning(`No parishes found for diocese: ${selectedDiocese?.dioceseName || dioceseId}`);
      }
      // Preserve parishId if valid
      if (currentParishId && !this.allParishes.some(p => p.parishId === currentParishId)) {
        this.selectedAdoration.parishId = 0;
      }
      console.log('Dialog Diocese Changed:', {
        dioceseId,
        dioceseName: selectedDiocese?.dioceseName,
        parishDisabled: this.parishDisabled,
        filteredParishes: filteredParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName, dioceseId: p.dioceseId })),
        currentParishId,
        selectedParishId: this.selectedAdoration.parishId
      });
    }
    if (this.dataLoaded && this.selectedAdoration.parishId) {
      this.updateLocationFromParish();
    }
  }

  isParishChurch(): boolean {
    return this.selectedAdoration.adorationLocationType === 'Parish Church';
  }

  updateLocationFromParish(): void {
    if (!this.isParishChurch() || !this.dataLoaded) {
      this.selectedAdoration.adorationLocation = '';
      console.log('Location not updated: not Parish Church or data not loaded', {
        isParishChurch: this.isParishChurch(),
        dataLoaded: this.dataLoaded
      });
      return;
    }
    const pID = Number(this.selectedAdoration.parishId || 0);
    if (!pID) {
      this.selectedAdoration.adorationLocation = '';
      console.warn('No valid parishId for location update:', pID);
      return;
    }
    const p = this.allParishes.find(par => par.parishId === pID);
    if (!p) {
      this.selectedAdoration.adorationLocation = '';
      console.warn('Parish not found for parishId:', pID);
      return;
    }
    // Construct address with fallbacks
    const stNumber = p.parishStNumber || '';
    const stName = p.parishStName || '';
    const suburb = p.parishSuburb || '';
    const postcode = p.parishPostcode || '';
    const addr = [stNumber, stName, suburb, postcode].filter(Boolean).join(', ').trim();
    this.selectedAdoration.adorationLocation = addr || '';
    console.log('Updated Location:', {
      parishId: pID,
      parishName: p.parishName,
      address: addr,
      parishData: { stNumber, stName, suburb, postcode }
    });
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

  addAdoration(): void {
    this.hasSubmitted = true;
    if (!this.isFormValid()) {
      this.showWarning('Please fill all required fields.');
      return;
    }
    this.adorationService.createAdoration(this.selectedAdoration).subscribe({
      next: () => {
        this.showInfo('Adoration Schedule has been added');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to create adoration:', err);
        this.showError('Error creating adoration. Verify all mandatory fields.');
      }
    });
  }

  modifyAdoration(): void {
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
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to update adoration:', err);
        this.showError('Error updating adoration schedule.');
      }
    });
  }

  deleteAdoration(): void {
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
            this.showInfo('Adoration Schedule deleted');
            this.dialogRef.close(true);
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
    this.dialogRef.close(false);
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