import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CrusadeService, Crusade } from '../rosary-crusade/crusade.service';
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
  selector: 'app-rosary-crusade-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './rosary-crusade-edit-dialog.component.html',
  styleUrls: ['./rosary-crusade-edit-dialog.component.scss']
})
export class RosaryCrusadeEditDialogComponent implements OnInit {
  allStates: State[] = [];
  allDioceses: Diocese[] = [];
  allParishes: Parish[] = [];
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];
  hasSubmitted = false;
  uiMode: 'view' | 'editing' = 'editing';
  stateDropdownDisabled: boolean = true;
  dioceseDropdownDisabled: boolean = true;
  parishDropdownDisabled: boolean = true;
  dataLoaded: boolean = false;

  selectedCrusade: Partial<Crusade> = {
    crusadeId: undefined,
    stateId: 0,
    dioceseId: 0,
    parishId: 0,
    confessionStartTime: '',
    confessionEndTime: '',
    massStartTime: '',
    massEndTime: '',
    crusadeStartTime: '',
    crusadeEndTime: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    comments: ''
  };

  constructor(
    public dialogRef: MatDialogRef<RosaryCrusadeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Crusade>,
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    if (data.crusadeId) {
      this.selectedCrusade = { ...data };
      this.uiMode = 'editing';
      this.hasSubmitted = false;
    } else {
      this.uiMode = 'view';
    }
    console.log('Initial Dialog Data:', this.data);
    console.log('Initial Selected Crusade:', this.selectedCrusade);
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
        this.filteredDioceses = [];
        this.filteredParishes = [];
        this.stateDropdownDisabled = this.allStates.length === 0;
        this.dioceseDropdownDisabled = true;
        this.parishDropdownDisabled = true;
        this.dataLoaded = true;
        // If editing, initialize dropdowns
        if (this.selectedCrusade.crusadeId) {
          if (this.selectedCrusade.stateId && this.allStates.some(s => s.stateId === this.selectedCrusade.stateId)) {
            this.onStateChange();
          }
          if (this.selectedCrusade.dioceseId && this.allDioceses.some(d => d.dioceseId === this.selectedCrusade.dioceseId)) {
            this.onDioceseChange();
          }
        }
        console.log('Dialog Loaded States:', this.allStates.map(s => ({ stateId: s.stateId, stateAbbreviation: s.stateAbbreviation })));
        console.log('Dialog Loaded Dioceses:', this.allDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
        console.log('Dialog Loaded Parishes:', this.allParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName, dioceseId: p.dioceseId })));
        console.log('Dialog Selected Crusade after init:', this.selectedCrusade);
      },
      error: (err) => {
        console.error('Failed to load dialog data:', err);
        this.showError('Error loading data for dialog.');
        this.allStates = [];
        this.allDioceses = [];
        this.allParishes = [];
        this.filteredDioceses = [];
        this.filteredParishes = [];
        this.stateDropdownDisabled = true;
        this.dioceseDropdownDisabled = true;
        this.parishDropdownDisabled = true;
        this.dataLoaded = true;
      }
    });
  }

  onStateChange(): void {
    const stateId = Number(this.selectedCrusade.stateId || 0);
    if (!Array.isArray(this.allDioceses)) {
      console.warn('allDioceses is not an array:', this.allDioceses);
      this.dioceseDropdownDisabled = true;
      this.showWarning('No dioceses available for selection.');
      return;
    }
    const currentDioceseId = Number(this.selectedCrusade.dioceseId || 0);
    if (!stateId) {
      this.filteredDioceses = [];
      this.dioceseDropdownDisabled = true;
      this.parishDropdownDisabled = true;
      this.selectedCrusade.dioceseId = 0;
      this.selectedCrusade.parishId = 0;
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev));
      this.dioceseDropdownDisabled = this.filteredDioceses.length === 0;
      // Preserve dioceseId if valid
      if (currentDioceseId && !this.filteredDioceses.some(d => d.dioceseId === currentDioceseId)) {
        this.selectedCrusade.dioceseId = 0;
      }
      // Preserve parishId if valid
      const currentParishId = Number(this.selectedCrusade.parishId || 0);
      if (currentParishId && !this.allParishes.some(p => p.parishId === currentParishId)) {
        this.selectedCrusade.parishId = 0;
      }
      this.filteredParishes = [];
      this.parishDropdownDisabled = true;
      console.log('Dialog State Changed:', {
        stateId,
        stateAbbreviation: abbrev,
        dioceseDropdownDisabled: this.dioceseDropdownDisabled,
        selectedDioceseId: this.selectedCrusade.dioceseId,
        selectedParishId: this.selectedCrusade.parishId
      });
    }
    if (this.selectedCrusade.dioceseId) {
      this.onDioceseChange();
    }
  }

  onDioceseChange(): void {
    const dioceseId = Number(this.selectedCrusade.dioceseId || 0);
    if (!Array.isArray(this.allParishes)) {
      console.warn('allParishes is not an array:', this.allParishes);
      this.parishDropdownDisabled = true;
      this.showWarning('No parishes available for selection.');
      return;
    }
    const currentParishId = Number(this.selectedCrusade.parishId || 0);
    const selectedDiocese = this.allDioceses.find(d => d.dioceseId === dioceseId);
    if (!dioceseId) {
      this.filteredParishes = [];
      this.parishDropdownDisabled = true;
      // Preserve parishId if valid
      if (currentParishId && !this.allParishes.some(p => p.parishId === currentParishId)) {
        this.selectedCrusade.parishId = 0;
      }
    } else {
      this.filteredParishes = this.allParishes.filter(p => p.dioceseId === dioceseId);
      this.parishDropdownDisabled = this.filteredParishes.length === 0;
      if (this.parishDropdownDisabled) {
        this.showWarning(`No parishes found for diocese: ${selectedDiocese?.dioceseName || dioceseId}`);
      }
      // Preserve parishId if valid
      if (currentParishId && !this.filteredParishes.some(p => p.parishId === currentParishId)) {
        this.selectedCrusade.parishId = 0;
      }
      console.log('Dialog Diocese Changed:', {
        dioceseId,
        dioceseName: selectedDiocese?.dioceseName,
        parishDropdownDisabled: this.parishDropdownDisabled,
        filteredParishes: this.filteredParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName, dioceseId: p.dioceseId })),
        currentParishId,
        selectedParishId: this.selectedCrusade.parishId
      });
    }
  }

  isFormValid(): boolean {
    if (!this.selectedCrusade.stateId || this.selectedCrusade.stateId <= 0) return false;
    if (!this.selectedCrusade.dioceseId || this.selectedCrusade.dioceseId <= 0) return false;
    if (!this.selectedCrusade.parishId || this.selectedCrusade.parishId <= 0) return false;
    if (!this.selectedCrusade.crusadeStartTime?.trim()) return false;
    if (!this.selectedCrusade.crusadeEndTime?.trim()) return false;
    return true;
  }

  addCrusade(): void {
    this.hasSubmitted = true;
    if (!this.isFormValid()) {
      this.showWarning('Some required fields are missing.');
      return;
    }
    this.crusadeService.createCrusade(this.selectedCrusade).subscribe({
      next: () => {
        this.showInfo('The Crusade has been added');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to create crusade:', err);
        this.showError('Error creating crusade.');
      }
    });
  }

  modifyCrusade(): void {
    if (!this.selectedCrusade.crusadeId) {
      this.showWarning('No crusade selected to modify!');
      return;
    }
    this.hasSubmitted = true;
    if (!this.isFormValid()) {
      this.showWarning('Some required fields are missing.');
      return;
    }
    const id = this.selectedCrusade.crusadeId;
    this.crusadeService.updateCrusade(id, this.selectedCrusade).subscribe({
      next: () => {
        this.showInfo('Crusade modified');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to update crusade:', err);
        this.showError('Error updating crusade.');
      }
    });
  }

  deleteCrusade(): void {
    if (!this.selectedCrusade.crusadeId) {
      this.showWarning('No crusade selected to delete!');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        message: `Are you sure you want to delete this Crusade?`
      },
      panelClass: 'orange-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedCrusade.crusadeId!;
        this.crusadeService.deleteCrusade(id).subscribe({
          next: () => {
            this.showInfo('Crusade deleted');
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to delete crusade:', err);
            this.showError('Error deleting crusade.');
          }
        });
      }
    });
  }

  cancel(): void {
    this.resetForm();
    this.dialogRef.close(false);
  }

  private resetForm(): void {
    this.selectedCrusade = {
      crusadeId: undefined,
      stateId: 0,
      dioceseId: 0,
      parishId: 0,
      confessionStartTime: '',
      confessionEndTime: '',
      massStartTime: '',
      massEndTime: '',
      crusadeStartTime: '',
      crusadeEndTime: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      comments: ''
    };
    this.hasSubmitted = false;
    this.filteredDioceses = [];
    this.filteredParishes = [];
    this.dioceseDropdownDisabled = true;
    this.parishDropdownDisabled = true;
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