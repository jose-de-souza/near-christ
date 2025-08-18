import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DioceseService, Diocese } from './diocese.service';
import { StateService, State } from '../state.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-diocese-maintenance',
  templateUrl: './diocese-maintenance.component.html',
  styleUrls: ['./diocese-maintenance.component.scss'],
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
export class DioceseMaintenanceComponent implements OnInit {
  allDioceses: Diocese[] = [];
  dioceses: Diocese[] = [];
  allStates: State[] = [];
  hasSubmitted = false;
  uiMode: 'view' | 'editing' = 'view';

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

  columns = [
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'Street No', field: 'dioceseStreetNo' },
    { header: 'Street Name', field: 'dioceseStreetName' },
    { header: 'Suburb', field: 'dioceseSuburb' },
    { header: 'State(s)', field: 'associatedStateAbbreviations' },
    { header: 'Post Code', field: 'diocesePostcode' },
    { header: 'Phone', field: 'diocesePhone' },
    { header: 'Email', field: 'dioceseEmail' },
    { header: 'Website', field: 'dioceseWebsite' },
  ];

  filterStateID: number = 0;

  constructor(
    private dioceseService: DioceseService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
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
        this.allDioceses = res.data;
        this.dioceses = res.data;
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load dioceses:', err);
          this.showError('Fatal error loading dioceses! Please contact support.');
        }
      }
    });
  }

  onFilterStateChange(): void {
    const chosenID = Number(this.filterStateID);
    if (chosenID === 0) {
      this.dioceses = this.allDioceses; // Show all dioceses, including those with no states
    } else {
      const selectedState = this.allStates.find(s => s.stateId === chosenID);
      if (selectedState) {
        const abbrev = selectedState.stateAbbreviation;
        this.dioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      } else {
        this.dioceses = [];
      }
    }
  }

  selectDiocese(diocese: Diocese): void {
    this.selectedDiocese = {
      ...diocese,
      associatedStateAbbreviations: undefined // Exclude read-only field
    };
    this.hasSubmitted = false;
    this.uiMode = 'editing';
  }

  addDiocese(): void {
    this.hasSubmitted = true;
    if (!this.selectedDiocese.dioceseName?.trim()) {
      this.showWarning('Diocese Name is required!');
      return;
    }
    this.dioceseService.createDiocese(this.selectedDiocese).subscribe({
      next: () => {
        this.showInfo(`${this.selectedDiocese.dioceseName} has been added`);
        this.loadAllDioceses();
        this.resetForm();
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to create diocese:', err);
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
    const id = this.selectedDiocese.dioceseId;
    this.dioceseService.updateDiocese(id, this.selectedDiocese).subscribe({
      next: () => {
        this.showInfo(`${this.selectedDiocese.dioceseName} modified`);
        this.loadAllDioceses();
        this.resetForm();
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to update diocese:', err);
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
        message: `Are you sure you want to delete "${this.selectedDiocese.dioceseName}" AND ALL ITS PARISHES?`
      },
      panelClass: 'orange-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedDiocese.dioceseId!;
        this.dioceseService.deleteDiocese(id).subscribe({
          next: () => {
            this.loadAllDioceses();
            this.resetForm();
            this.uiMode = 'view';
          },
          error: (err) => {
            console.error('Failed to delete diocese:', err);
            this.showError('Fatal error deleting diocese! Please contact support.');
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

  getCellValue(row: Diocese, column: { header: string; field: string }): any {
    if (column.field === 'associatedStateAbbreviations') {
      return row.associatedStateAbbreviations?.length ? row.associatedStateAbbreviations.join(', ') : '';
    } else {
      return (row as any)[column.field] ?? '';
    }
  }

  getCellClass(row: Diocese, column: { header: string; field: string }): string {
    if (column.field === 'associatedStateAbbreviations' && !row.associatedStateAbbreviations?.length) {
      return 'no-states';
    }
    return '';
  }

  trackByDioceseID(index: number, item: Diocese): number {
    return item.dioceseId;
  }

  trackColumn(index: number, item: any): string {
    return item.field;
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