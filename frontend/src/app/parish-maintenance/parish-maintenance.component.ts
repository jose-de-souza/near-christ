import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ParishService, Parish } from './parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';

// Import the ConfirmationDialogComponent (but do not list it in the `imports` array).
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-parish-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSnackBarModule,
    MatDialogModule // Required for opening the confirmation dialog
  ],
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss']
})
export class ParishMaintenanceComponent implements OnInit {
  // Full list of parishes
  allParishes: Parish[] = [];
  // Displayed list (filtered)
  parishes: Parish[] = [];

  hasSubmitted = false;

  // Full list of states from back end
  allStates: State[] = [];
  // The State dropbox is disabled if no States available
  stateDropdownDisabled: boolean = true;

  // The parish being edited
  selectedParish: Partial<Parish> = {
    parishID: undefined,
    parishName: '',
    parishStNumber: '',
    parishStName: '',
    parishSuburb: '',
    stateID: 0,
    dioceseID: 0,
    parishPostcode: '',
    parishPhone: '',
    parishEmail: '',
    parishWebsite: ''
  };

  // Table columns – includes "State" & "Diocese"
  columns = [
    { header: 'Parish Name', field: 'parishName' },
    { header: 'St No', field: 'parishStNumber' },
    { header: 'Street Name', field: 'parishStName' },
    { header: 'Suburb', field: 'parishSuburb' },
    { header: 'State', field: 'state' },
    { header: 'Diocese', field: 'diocese' },
    { header: 'PostCode', field: 'parishPostcode' },
    { header: 'Phone', field: 'parishPhone' },
    { header: 'Email', field: 'parishEmail' },
    { header: 'Website', field: 'parishWebsite' }
  ];

  // Master list of all dioceses
  dioceseList: Diocese[] = [];

  // Filter section
  filteredDiocesesForFilter: Diocese[] = [];
  filterStateID: number = 0;
  filterDioceseID: number = 0;
  dioceseFilterDisabled: boolean = true;

  // For the Location/Contact section
  locationDioceses: Diocese[] = [];
  locationDioceseDisabled: boolean = true;

  // === UI mode: 'view' or 'editing' ===
  uiMode: 'view' | 'editing' = 'view';

  constructor(
    private parishService: ParishService,
    private dioceseService: DioceseService,
    private stateService: StateService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // so we can open the confirmation dialog
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  /* ---------------------------
     Load States
  --------------------------- */
  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data;
        this.stateDropdownDisabled = this.allStates.length === 0;
      },
      error: (err: any) => {
        console.error('Failed to load states:', err);
        this.showError('Could not load states from server.');
        this.stateDropdownDisabled = true;
      }
    });
  }

  /* ---------------------------
     Load Dioceses
  --------------------------- */
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        this.dioceseList = res.data;
      },
      error: (err: any) => {
        console.error('Failed to load dioceses:', err);
        this.showError('Could not load dioceses from server.');
      }
    });
  }

  /* ---------------------------
     Load Parishes
  --------------------------- */
  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (res: any) => {
        this.allParishes = res.data;
        this.parishes = res.data;
      },
      error: (err: any) => {
        console.error('Failed to load parishes:', err);
        this.showError('Fatal error loading parishes!');
      }
    });
  }

  /* ---------------------------
     CRUD Operations
  --------------------------- */
  addParish(): void {
    this.hasSubmitted = true;
    if (!this.selectedParish.parishName?.trim() || !this.selectedParish.stateID || !this.selectedParish.dioceseID) {
      this.showWarning('Parish Name, State, and Diocese are required!');
      return;
    }
    this.parishService.createParish(this.selectedParish).subscribe({
      next: () => {
        this.showInfo(`${this.selectedParish.parishName} has been added`);
        this.loadAllParishes();
        this.resetForm();
        // Done adding => return to view mode
        this.uiMode = 'view';
      },
      error: (err: any) => {
        console.error('Failed to create parish:', err);
        this.showError('Fatal error creating parish!');
      }
    });
  }

  modifyParish(): void {
    if (!this.selectedParish.parishID) {
      this.showWarning('No parish selected to update!');
      return;
    }
    const id = this.selectedParish.parishID;
    this.parishService.updateParish(id, this.selectedParish).subscribe({
      next: () => {
        this.showInfo(`${this.selectedParish.parishName} modified`);
        this.loadAllParishes();
        this.resetForm();
        // Done editing => return to view mode
        this.uiMode = 'view';
      },
      error: (err: any) => {
        console.error('Failed to update parish:', err);
        this.showError('Fatal error updating parish!');
      }
    });
  }

  deleteParish(): void {
    if (!this.selectedParish.parishID) {
      this.showWarning('No parish selected to delete!');
      return;
    }

    // Exactly like diocese-maintenance:
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        message: `Are you sure you wish to delete parish "${this.selectedParish.parishName}"?`
      },
      panelClass: 'orange-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedParish.parishID!;
        this.parishService.deleteParish(id).subscribe({
          next: () => {
            this.loadAllParishes();
            this.resetForm();
            this.uiMode = 'view';
          },
          error: (err: any) => {
            console.error('Failed to delete parish:', err);
            this.showError('Fatal error deleting parish!');
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
    this.selectedParish = {
      parishID: undefined,
      parishName: '',
      parishStNumber: '',
      parishStName: '',
      parishSuburb: '',
      stateID: 0,
      dioceseID: 0,
      parishPostcode: '',
      parishPhone: '',
      parishEmail: '',
      parishWebsite: ''
    };
    this.hasSubmitted = false;
    // Also reset location diocese
    this.locationDioceses = [];
    this.locationDioceseDisabled = true;
  }

  /* ---------------------------
     Selecting a row => editing mode
  --------------------------- */
  selectParish(parish: Parish): void {
    this.selectedParish = { ...parish };
    this.hasSubmitted = false;
    this.uiMode = 'editing';
    // Possibly call onLocationStateChange() if we want to refresh the location diocese
    this.onLocationStateChange();
  }

  /* ---------------------------
     MAIN LOCATION/CONTACT LOGIC
  --------------------------- */
  onLocationStateChange(): void {
    const stID = Number(this.selectedParish.stateID);
    if (!stID) {
      // No state => Clear and disable diocese
      this.locationDioceses = [];
      this.selectedParish.dioceseID = 0;
      this.locationDioceseDisabled = true;
    } else {
      const relevant = this.dioceseList.filter(d => d.stateID === stID);
      this.locationDioceses = relevant;
      this.locationDioceseDisabled = relevant.length === 0;
      if (this.selectedParish.dioceseID && !relevant.some(d => d.dioceseID === this.selectedParish.dioceseID)) {
        this.selectedParish.dioceseID = 0;
      }
    }
  }

  /* ---------------------------
     FILTERS for Linking State/Diocese & Parish
  --------------------------- */
  onFilterStateChange(): void {
    const stateID = Number(this.filterStateID);
    if (!stateID) {
      // Clear & deactivate
      this.filteredDiocesesForFilter = [];
      this.filterDioceseID = 0;
      this.dioceseFilterDisabled = true;
      this.parishes = this.allParishes;
    } else {
      this.filteredDiocesesForFilter = this.dioceseList.filter(d => d.stateID === stateID);
      this.dioceseFilterDisabled = this.filteredDiocesesForFilter.length === 0;
      this.applyParishFilter();
    }
  }

  onFilterDioceseChange(): void {
    this.applyParishFilter();
  }

  private applyParishFilter(): void {
    const stateID = Number(this.filterStateID);
    if (!stateID) {
      this.parishes = this.allParishes;
    } else {
      let filtered = this.allParishes.filter(p => p.stateID === stateID);
      if (this.filterDioceseID && this.filterDioceseID > 0) {
        filtered = filtered.filter(p => p.dioceseID === Number(this.filterDioceseID));
      }
      this.parishes = filtered;
    }
  }

  /* ---------------------------
     DRAG & DROP
  --------------------------- */
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  onDragEntered(event: any): void {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }

  onDragExited(event: any): void {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  // getCellValue for displaying State abbreviation / Diocese name
  getCellValue(row: Parish, column: { header: string; field: string }): any {
    if (column.field === 'state') {
      const st = this.allStates.find(s => s.stateID === row.stateID);
      return st ? st.stateAbbreviation : '';
    } else if (column.field === 'diocese') {
      const d = this.dioceseList.find(di => di.dioceseID === row.dioceseID);
      return d ? d.dioceseName : '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  trackByParishID(index: number, item: Parish): number {
    return item.parishID;
  }

  trackByParishColumn(index: number, item: any) {
    return item.field;
  }

  /* ---------------------------
     SNACK BAR
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
