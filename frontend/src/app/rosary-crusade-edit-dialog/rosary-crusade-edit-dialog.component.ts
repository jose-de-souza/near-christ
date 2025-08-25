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
  hasSubmitted = false;
  uiMode: 'view' | 'editing' = 'editing';
  stateDropdownDisabled: boolean = true;
  dioceseDropdownDisabled: boolean = true;
  parishDropdownDisabled: boolean = true;

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
  }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data || [];
        this.stateDropdownDisabled = this.allStates.length === 0;
        console.log('Loaded States:', this.allStates.map(s => ({ stateId: s.stateId, stateAbbreviation: s.stateAbbreviation })));
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
        this.allDioceses = res.data || [];
        this.dioceseDropdownDisabled = this.allDioceses.length === 0;
        console.log('Loaded Dioceses:', this.allDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
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
        this.allParishes = res.data || [];
        this.parishDropdownDisabled = this.allParishes.length === 0;
        console.log('Loaded Parishes:', this.allParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName })));
      },
      error: (err) => {
        console.error('Failed to load parishes:', err);
        this.showError('Error loading parishes.');
      }
    });
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