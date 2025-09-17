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
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];
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
        this.allStates = this.getData<State>(states);
        this.allDioceses = this.getData<Diocese>(dioceses);
        this.allParishes = this.getData<Parish>(parishes);
        this.dataLoaded = true;

        // If editing, re-apply filters based on the loaded data
        if (this.selectedAdoration.adorationId) {
          // Ensure state selection is valid, then trigger diocese and parish filtering
          if (this.selectedAdoration.stateId && this.allStates.some(s => s.stateId === this.selectedAdoration.stateId)) {
            this.onStateChange(true); // Pass true to avoid resetting child dropdowns on initial load
          } else {
            // If the state ID on the adoration is invalid, clear it and disable subsequent dropdowns
            this.selectedAdoration.stateId = 0;
            this.onStateChange();
          }
          // After onStateChange, onDioceseChange will be called if selectedAdoration.dioceseId is present.
          // The updateLocationFromParish is handled there or if parishId is already set.
        } else {
          // For new adorations, just set initial dropdown states
          this.onStateChange();
        }
      },
      error: (err) => {
        this.showError('Error loading data for dialog.');
        this.allStates = [];
        this.allDioceses = [];
        this.allParishes = [];
        this.filteredDioceses = [];
        this.filteredParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.dataLoaded = true; // Still set to true to enable UI, even if empty
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

  // Modified onStateChange to handle initial load vs user interaction
  onStateChange(isInitialLoad: boolean = false): void {
    const stateId = Number(this.selectedAdoration.stateId || 0);

    // Filter Dioceses
    if (stateId === 0) {
      this.filteredDioceses = [];
      this.dioceseDisabled = true;
      if (!isInitialLoad) {
        this.selectedAdoration.dioceseId = 0;
        this.selectedAdoration.parishId = 0;
      }
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev));
      this.dioceseDisabled = this.filteredDioceses.length === 0;

      // If existing diocese is no longer valid for the selected state, reset it
      if (!isInitialLoad && this.selectedAdoration.dioceseId && !this.filteredDioceses.some(d => d.dioceseId === this.selectedAdoration.dioceseId)) {
        this.selectedAdoration.dioceseId = 0;
      }
    }
    // Always clear parish filter if state or diocese changed
    if (!isInitialLoad) {
        this.filteredParishes = [];
        this.parishDisabled = true;
        this.selectedAdoration.parishId = 0;
    }

    // Trigger onDioceseChange if a valid diocese is still selected or needs to be reset
    this.onDioceseChange(isInitialLoad);
  }

  // Modified onDioceseChange to handle initial load vs user interaction
  onDioceseChange(isInitialLoad: boolean = false): void {
    const dioceseId = Number(this.selectedAdoration.dioceseId || 0);
    const selectedDiocese = this.allDioceses.find(d => d.dioceseId === dioceseId);

    // Filter Parishes
    if (dioceseId === 0) {
      this.filteredParishes = [];
      this.parishDisabled = true;
      if (!isInitialLoad) {
        this.selectedAdoration.parishId = 0;
      }
    } else {
      this.filteredParishes = this.allParishes.filter(p => p.dioceseId === dioceseId);
      this.parishDisabled = this.filteredParishes.length === 0;
      if (this.parishDisabled && !isInitialLoad) {
        this.showWarning(`No parishes found for diocese: ${selectedDiocese?.dioceseName || dioceseId}`);
      }

      // If existing parish is no longer valid for the selected diocese, reset it
      if (!isInitialLoad && this.selectedAdoration.parishId && !this.filteredParishes.some(p => p.parishId === this.selectedAdoration.parishId)) {
        this.selectedAdoration.parishId = 0;
      }
    }

    // Update location only if data is loaded and parish is selected
    if (this.dataLoaded && this.selectedAdoration.parishId) {
      this.updateLocationFromParish();
    } else if (!isInitialLoad) { // Clear location if parish isn't selected or valid after change
        this.selectedAdoration.adorationLocation = '';
    }
  }

  isParishChurch(): boolean {
    return this.selectedAdoration.adorationLocationType === 'Parish Church';
  }

  updateLocationFromParish(): void {
    if (!this.isParishChurch() || !this.dataLoaded) {
      this.selectedAdoration.adorationLocation = '';
      return;
    }
    const pID = Number(this.selectedAdoration.parishId || 0);
    if (!pID) {
      this.selectedAdoration.adorationLocation = '';
      return;
    }
    const p = this.allParishes.find(par => par.parishId === pID);
    if (!p) {
      this.selectedAdoration.adorationLocation = '';
      return;
    }
    // Construct address with fallbacks
    const stNumber = p.parishStNumber || '';
    const stName = p.parishStName || '';
    const suburb = p.parishSuburb || '';
    const postcode = p.parishPostcode || '';
    const addr = [stNumber, stName, suburb, postcode].filter(Boolean).join(', ').trim();
    this.selectedAdoration.adorationLocation = addr || '';
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