import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-parish-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './parish-edit-dialog.component.html',
  styleUrls: ['./parish-edit-dialog.component.scss']
})
export class ParishEditDialogComponent implements OnInit {
  allStates: State[] = [];
  hasSubmitted = false;
  uiMode: 'view' | 'editing' = 'editing';
  allDioceses: Diocese[] = [];
  filteredDioceses: Diocese[] = [];
  stateDropdownDisabled: boolean = true;
  dioceseDropdownDisabled: boolean = true;

  selectedParish: Partial<Parish> = {
    parishId: undefined,
    parishName: '',
    parishStNumber: '',
    parishStName: '',
    parishSuburb: '',
    stateId: 0,
    dioceseId: 0,
    parishPostcode: '',
    parishPhone: '',
    parishEmail: '',
    parishWebsite: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ParishEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Parish>,
    private parishService: ParishService,
    private dioceseService: DioceseService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    if (data.parishId) {
      this.selectedParish = { ...data };
      this.uiMode = 'editing';
      this.hasSubmitted = false;
    } else {
      this.uiMode = 'view';
    }
  }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
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
        this.filteredDioceses = [...this.allDioceses];
        this.dioceseDropdownDisabled = this.allDioceses.length === 0;
        console.log('Loaded Dioceses:', this.allDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
        this.showError('Error loading dioceses.');
      }
    });
  }

  onStateChange(): void {
    // No cascading effect; keep all dioceses available
    this.filteredDioceses = [...this.allDioceses];
    this.dioceseDropdownDisabled = this.allDioceses.length === 0;
  }

  isFormValid(): boolean {
    if (!this.selectedParish.stateId || this.selectedParish.stateId <= 0) return false;
    if (!this.selectedParish.dioceseId || this.selectedParish.dioceseId <= 0) return false;
    if (!this.selectedParish.parishName?.trim()) return false;
    return true;
  }

  addParish(): void {
    this.hasSubmitted = true;
    if (!this.isFormValid()) {
      this.showWarning('Please fill all required fields.');
      return;
    }
    const parishData = {
      ...this.selectedParish,
      parishStNumber: this.selectedParish.parishStNumber ? String(this.selectedParish.parishStNumber) : ''
    };
    this.parishService.createParish(parishData).subscribe({
      next: () => {
        this.showInfo('Parish has been added');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to create parish:', err);
        this.showError('Error creating parish. Verify all mandatory fields.');
      }
    });
  }

  modifyParish(): void {
    if (!this.selectedParish.parishId) {
      this.showWarning('No parish selected to update!');
      return;
    }
    this.hasSubmitted = true;
    if (!this.isFormValid()) {
      this.showWarning('Please fill all required fields.');
      return;
    }
    const id = this.selectedParish.parishId;
    const parishData = {
      ...this.selectedParish,
      parishStNumber: this.selectedParish.parishStNumber ? String(this.selectedParish.parishStNumber) : ''
    };
    this.parishService.updateParish(id, parishData).subscribe({
      next: () => {
        this.showInfo('Parish modified');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to update parish:', err);
        this.showError('Error updating parish.');
      }
    });
  }

  deleteParish(): void {
    if (!this.selectedParish.parishId) {
      this.showWarning('No parish selected to delete!');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        message: `Are you sure you wish to delete "${this.selectedParish.parishName}"?`
      },
      panelClass: 'orange-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedParish.parishId!;
        this.parishService.deleteParish(id).subscribe({
          next: () => {
            this.showInfo('Parish deleted');
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to delete parish:', err);
            this.showError('Error deleting parish.');
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
    this.selectedParish = {
      parishId: undefined,
      parishName: '',
      parishStNumber: '',
      parishStName: '',
      parishSuburb: '',
      stateId: 0,
      dioceseId: 0,
      parishPostcode: '',
      parishPhone: '',
      parishEmail: '',
      parishWebsite: ''
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