import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-diocese-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './diocese-edit-dialog.component.html',
  styleUrls: ['./diocese-edit-dialog.component.scss']
})
export class DioceseEditDialogComponent implements OnInit {
  allStates: State[] = [];
  hasSubmitted = false;
  uiMode: 'view' | 'editing' = 'editing';
  selectedDiocese: Partial<Diocese> = {
    dioceseId: undefined,
    dioceseName: '',
    dioceseStreetNo: '',
    dioceseStreetName: '',
    dioceseSuburb: '',
    diocesePostcode: '',
    diocesePhone: '',
    dioceseEmail: '',
    dioceseWebsite: ''
  };

  constructor(
    public dialogRef: MatDialogRef<DioceseEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Diocese>,
    private dioceseService: DioceseService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    if (data.dioceseId) {
      this.selectedDiocese = { ...data, associatedStateAbbreviations: undefined };
      this.uiMode = 'editing';
    } else {
      this.uiMode = 'view';
    }
  }

  ngOnInit(): void {
    this.loadAllStates();
  }

  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data;
      },
      error: (err) => {
        this.showError('Error loading states from server.');
      }
    });
  }

  addDiocese(): void {
    this.hasSubmitted = true;
    if (!this.selectedDiocese.dioceseName?.trim()) {
      this.showWarning('Diocese Name is required!');
      return;
    }
    const dioceseData = {
      ...this.selectedDiocese,
      dioceseStreetNo: this.selectedDiocese.dioceseStreetNo ? String(this.selectedDiocese.dioceseStreetNo) : ''
    };
    this.dioceseService.createDiocese(dioceseData).subscribe({
      next: () => {
        this.showInfo(`${this.selectedDiocese.dioceseName} has been added`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.showError('Fatal error creating diocese! Please contact support.');
      }
    });
  }

  modifyDiocese(): void {
    if (!this.selectedDiocese.dioceseId) {
      this.showWarning('No diocese selected to update!');
      return;
    }
    this.hasSubmitted = true;
    if (!this.selectedDiocese.dioceseName?.trim()) {
      this.showWarning('Diocese Name is required!');
      return;
    }
    const dioceseData = {
      ...this.selectedDiocese,
      dioceseStreetNo: this.selectedDiocese.dioceseStreetNo ? String(this.selectedDiocese.dioceseStreetNo) : ''
    };
    const id = this.selectedDiocese.dioceseId;
    this.dioceseService.updateDiocese(id, dioceseData).subscribe({
      next: () => {
        this.showInfo(`${this.selectedDiocese.dioceseName} modified`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.showError('Fatal error updating diocese! Please contact support.');
      }
    });
  }

  deleteDiocese(): void {
    if (!this.selectedDiocese.dioceseId) {
      this.showWarning('No diocese selected to delete!');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        message: `Are you sure you want to delete "${this.selectedDiocese.dioceseName}"?`
      },
      panelClass: 'orange-dialog'
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedDiocese.dioceseId!;
        this.dioceseService.deleteDiocese(id).subscribe({
          next: () => {
            this.showInfo('Diocese deleted');
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.showError(err.message || 'Fatal error deleting diocese! Please contact support.');
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
    this.selectedDiocese = {
      dioceseId: undefined,
      dioceseName: '',
      dioceseStreetNo: '',
      dioceseStreetName: '',
      dioceseSuburb: '',
      diocesePostcode: '',
      diocesePhone: '',
      dioceseEmail: '',
      dioceseWebsite: ''
    };
    this.hasSubmitted = false;
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-info']
    });
  }

  private showWarning(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 10000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}