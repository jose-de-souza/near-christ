import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { DioceseService, Diocese } from './diocese.service';
import { StateService, State } from '../state.service';

// Import your ConfirmationDialog
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
    MatDialogModule           // Needed for the dialog
  ]
})
export class DioceseMaintenanceComponent implements OnInit {

  // Full list of dioceses from back end
  allDioceses: Diocese[] = [];
  // Filtered subset displayed in the table
  dioceses: Diocese[] = [];

  // All states from back end
  allStates: State[] = [];

  hasSubmitted = false;

  // UI mode: 'view' => no record selected, 'editing' => a record is selected
  uiMode: 'view' | 'editing' = 'view';

  // The diocese record being edited/created
  selectedDiocese: Partial<Diocese> = {
    dioceseId: undefined,
    dioceseName: '',
    dioceseStreetNo: '',
    dioceseStreetName: '',
    dioceseSuburb: '',
    stateID: 0,
    diocesePostcode: '',
    diocesePhone: '',
    dioceseEmail: '',
    dioceseWebsite: ''
  };

  // Table columns
  columns = [
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'Street No', field: 'dioceseStreetNo' },
    { header: 'Street Name', field: 'dioceseStreetName' },
    { header: 'Suburb', field: 'dioceseSuburb' },
    { header: 'State', field: 'state' },
    { header: 'Post Code', field: 'diocesePostcode' },
    { header: 'Phone', field: 'diocesePhone' },
    { header: 'Email', field: 'dioceseEmail' },
    { header: 'Website', field: 'dioceseWebsite' },
  ];

  // Filter property for the dropdown in the filter section
  filterStateID: number = 0; // 0 => "All States"

  constructor(
    private dioceseService: DioceseService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // <-- inject MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
  }

  /* ---------------------------
     Load States
  --------------------------- */
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

  /* ---------------------------
     Load Dioceses
  --------------------------- */
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        this.allDioceses = res.data;
        // By default, show all
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

  /* ---------------------------
     Filter by State
  --------------------------- */
  onFilterStateChange(): void {
    const chosenID = Number(this.filterStateID);
    if (chosenID === 0) {
      // "All States": show all
      this.dioceses = this.allDioceses;
    } else {
      this.dioceses = this.allDioceses.filter(d => d.stateID === chosenID);
    }
  }

  /* ---------------------------
     Selecting a Diocese Row
     => switch to editing mode
  --------------------------- */
  selectDiocese(d: Diocese): void {
    this.selectedDiocese = { ...d };
    this.hasSubmitted = false;
    this.uiMode = 'editing';
  }

  /* ---------------------------
     CRUD METHODS
  --------------------------- */
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
        // Return to view mode
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to create diocese:', err);
        this.showError('Fatal error creating diocese! Please contact support.');
      }
    });
  }

  modifyDiocese(): void {
    // The "Modify" button is disabled unless uiMode === 'editing'
    if (!this.selectedDiocese.dioceseId) {
      this.showWarning('No diocese selected to update!');
      return;
    }

    const id = this.selectedDiocese.dioceseId;
    this.dioceseService.updateDiocese(id, this.selectedDiocese).subscribe({
      next: () => {
        this.showInfo(`${this.selectedDiocese.dioceseName} modified`);
        this.loadAllDioceses();
        this.resetForm();
        // Return to view mode
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to update diocese:', err);
        this.showError('Fatal error updating diocese! Please contact support.');
      }
    });
  }

  deleteDiocese(): void {
    // The "Delete" button is disabled unless uiMode === 'editing'
    if (!this.selectedDiocese.dioceseId) {
      this.showWarning('No diocese selected to delete!');
      return;
    }

    // 1) Open the Confirmation Dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        message: `Are you sure you want to delete "${this.selectedDiocese.dioceseName}"?`
      },
      panelClass: 'orange-dialog'
    });

    // 2) If user confirmed => proceed
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedDiocese.dioceseId!;
        this.dioceseService.deleteDiocese(id).subscribe({
          next: () => {
            this.loadAllDioceses();
            this.resetForm();
            // Return to view mode
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
    // Cancel any pending edits and return to 'view' mode
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
      stateID: 0,
      diocesePostcode: '',
      diocesePhone: '',
      dioceseEmail: '',
      dioceseWebsite: ''
    };
    this.hasSubmitted = false;
  }

  /* ---------------------------
     DRAG & DROP FOR THE TABLE
  --------------------------- */
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  trackColumn(index: number, item: any) {
    return item.field;
  }

  onDragEntered(event: any): void {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }

  onDragExited(event: any): void {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  /* ---------------------------
     Return cell value for each table cell
  --------------------------- */
  getCellValue(row: Diocese, column: { header: string; field: string }): any {
    if (column.field === 'state') {
      return row.state?.stateAbbreviation || '';
    } else {
      return (row as any)[column.field] ?? '';
    }
  }

  trackByDioceseID(index: number, item: Diocese): number {
    return item.dioceseId;
  }

  /* ---------------------------
     SNACK BAR HELPERS
  --------------------------- */
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
