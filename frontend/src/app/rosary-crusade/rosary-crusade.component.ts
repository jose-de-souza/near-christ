import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CrusadeService, Crusade } from './crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';

// Import the Confirmation Dialog, but do NOT add it to the component's "imports" array.
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-rosary-crusade',
  templateUrl: './rosary-crusade.component.html',
  styleUrls: ['./rosary-crusade.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSnackBarModule,
    MatDialogModule // Needed for the confirmation dialog
  ]
})
export class RosaryCrusadeComponent implements OnInit {
  // Columns for the results grid
  columns = [
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'Parish', field: 'parishName' },
    { header: 'State', field: 'stateName' },
    { header: 'Confession Start', field: 'ConfessionStartTime' },
    { header: 'Confession End', field: 'ConfessionEndTime' },
    { header: 'Mass Start', field: 'MassStartTime' },
    { header: 'Mass End', field: 'MassEndTime' },
    { header: 'Crusade Start', field: 'CrusadeStartTime' },
    { header: 'Crusade End', field: 'CrusadeEndTime' },
    { header: 'Contact Name', field: 'ContactName' },
    { header: 'Contact Phone', field: 'ContactPhone' },
    { header: 'Contact Email', field: 'ContactEmail' },
    { header: 'Comments', field: 'Comments' },
  ];

  // Data arrays
  allStates: State[] = [];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];
  crusades: Crusade[] = [];

  // Filtered lists
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  // Flags for enabling/disabling dropdowns
  dioceseDisabled = true;
  parishDisabled = true;

  // The crusade record currently being edited
  selectedCrusade: Partial<Crusade> = {
    CrusadeID: undefined,
    StateID: 0,
    DioceseID: 0,
    ParishID: 0,
    ConfessionStartTime: '',
    ConfessionEndTime: '',
    MassStartTime: '',
    MassEndTime: '',
    CrusadeStartTime: '',
    CrusadeEndTime: '',
    ContactName: '',
    ContactPhone: '',
    ContactEmail: '',
    Comments: ''
  };

  hasSubmitted = false;

  // === UI Mode: 'view' or 'editing' ===
  uiMode: 'view' | 'editing' = 'view';

  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // for the confirmation dialog
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
    this.loadAllCrusades();
  }

  // ---------------------------
  // Load Data
  // ---------------------------
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

  loadAllCrusades(): void {
    this.crusadeService.getAllCrusades().subscribe({
      next: (res: any) => {
        this.crusades = res.data;
      },
      error: (err) => {
        console.error('Failed to load crusades:', err);
        this.showError('Error loading crusades from server.');
      }
    });
  }

  // ---------------------------
  // SELECT / EDIT => switch to editing
  // ---------------------------
  selectCrusade(c: Crusade): void {
    this.hasSubmitted = false;
    // Copy the record
    this.selectedCrusade = {
      ...c,
      StateID: Number(c.StateID),
      DioceseID: Number(c.DioceseID),
      ParishID: Number(c.ParishID)
    };

    this.uiMode = 'editing';

    // Refresh filters
    if (this.selectedCrusade.StateID && Number(this.selectedCrusade.StateID) > 0) {
      this.onStateChange();
    } else {
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    }

    if (this.selectedCrusade.DioceseID && Number(this.selectedCrusade.DioceseID) > 0) {
      this.onDioceseChange();
    } else {
      this.parishDisabled = true;
      this.filteredParishes = [];
    }
  }

  // ---------------------------
  // FILTER / DROPDOWN LOGIC
  // ---------------------------
  onStateChange(): void {
    const stateID = Number(this.selectedCrusade.StateID);
    if (!stateID || stateID === 0) {
      // Clear
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedCrusade.DioceseID = 0;
      this.selectedCrusade.ParishID = 0;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    } else {
      this.filteredDioceses = this.dioceseList.filter(d => d.StateID === stateID);
      if (this.filteredDioceses.length === 0) {
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.selectedCrusade.DioceseID = 0;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = [];
      } else {
        this.dioceseDisabled = false;
        const currentDioceseID = Number(this.selectedCrusade.DioceseID);
        const found = this.filteredDioceses.find(d => d.DioceseID === currentDioceseID);
        if (!found) {
          this.selectedCrusade.DioceseID = 0;
          this.selectedCrusade.ParishID = 0;
          this.filteredParishes = [];
          this.parishDisabled = true;
        }
      }
    }
  }

  onDioceseChange(): void {
    const dioceseID = Number(this.selectedCrusade.DioceseID);
    if (!dioceseID || dioceseID === 0) {
      this.parishDisabled = true;
      this.selectedCrusade.ParishID = 0;
      this.filteredParishes = [];
    } else {
      const temp = this.parishList.filter(p => p.DioceseID === dioceseID);
      if (temp.length === 0) {
        this.parishDisabled = true;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = [];
      } else {
        this.parishDisabled = false;
        const currentParishID = Number(this.selectedCrusade.ParishID);
        const found = temp.find(p => p.ParishID === currentParishID);
        if (!found) {
          this.selectedCrusade.ParishID = 0;
        }
        this.filteredParishes = temp;
      }
    }
  }

  // ---------------------------
  // CRUD Operations
  // ---------------------------
  addCrusade(): void {
    // The button is disabled if uiMode === 'editing', so no need to check that again
    this.hasSubmitted = true;
    if (!this.isAllFieldsValid()) {
      this.showWarning('Some required fields are missing.');
      return;
    }
    this.crusadeService.createCrusade(this.selectedCrusade).subscribe({
      next: () => {
        this.showInfo('The Crusade has been added');
        this.loadAllCrusades();
        this.resetForm();
        // Done => Return to 'view' mode
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to create crusade:', err);
        this.showError('Error creating crusade.');
      }
    });
  }

  modifyCrusade(): void {
    // The button is disabled if uiMode !== 'editing'
    if (!this.selectedCrusade.CrusadeID) {
      this.showWarning('No crusade selected to modify!');
      return;
    }
    this.hasSubmitted = true;
    if (!this.isAllFieldsValid()) {
      this.showWarning('Some required fields are missing.');
      return;
    }
    const id = this.selectedCrusade.CrusadeID;
    this.crusadeService.updateCrusade(id, this.selectedCrusade).subscribe({
      next: () => {
        this.showInfo('Crusade modified');
        this.loadAllCrusades();
        this.resetForm();
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to update crusade:', err);
        this.showError('Error updating crusade.');
      }
    });
  }

  deleteCrusade(): void {
    // The button is disabled if uiMode !== 'editing'
    if (!this.selectedCrusade.CrusadeID) {
      this.showWarning('No crusade selected to delete!');
      return;
    }

    // Open the ConfirmationDialog exactly as in the other maintenance comps
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `Are you sure you want to delete this Crusade?`
      },
      panelClass: 'orange-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedCrusade.CrusadeID!;
        this.crusadeService.deleteCrusade(id).subscribe({
          next: () => {
            this.loadAllCrusades();
            this.resetForm();
            // Done => Return to 'view' mode
            this.uiMode = 'view';
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
    // Cancel editing => back to view mode
    this.resetForm();
    this.uiMode = 'view';
  }

  private resetForm(): void {
    this.selectedCrusade = {
      CrusadeID: undefined,
      StateID: 0,
      DioceseID: 0,
      ParishID: 0,
      ConfessionStartTime: '',
      ConfessionEndTime: '',
      MassStartTime: '',
      MassEndTime: '',
      CrusadeStartTime: '',
      CrusadeEndTime: '',
      ContactName: '',
      ContactPhone: '',
      ContactEmail: '',
      Comments: ''
    };
    this.hasSubmitted = false;
    this.dioceseDisabled = true;
    this.parishDisabled = true;
    this.filteredDioceses = [];
    this.filteredParishes = [];
  }

  private isAllFieldsValid(): boolean {
    if (!this.selectedCrusade.StateID || Number(this.selectedCrusade.StateID) <= 0) return false;
    if (!this.selectedCrusade.DioceseID || Number(this.selectedCrusade.DioceseID) <= 0) return false;
    if (!this.selectedCrusade.ParishID || Number(this.selectedCrusade.ParishID) <= 0) return false;
    if (!this.selectedCrusade.CrusadeStartTime?.trim()) return false;
    if (!this.selectedCrusade.CrusadeEndTime?.trim()) return false;
    return true;
  }

  // ---------------------------
  // Drag & Drop for Grid Columns
  // ---------------------------
  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  onDragEntered(event: any): void {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any): void {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  // ---------------------------
  // Grid Cell Value Lookup
  // ---------------------------
  getCellValue(row: Crusade, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '';
    } else if (column.field === 'stateName') {
      return row.state?.StateAbbreviation || '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  // ---------------------------
  // Snack Bar Helpers
  // ---------------------------
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
