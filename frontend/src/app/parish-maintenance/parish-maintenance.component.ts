import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ParishService, Parish } from './parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';

@Component({
  selector: 'app-parish-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule],
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
  // The State dropbox is only deactivated if there are no States available
  stateDropdownDisabled: boolean = true;

  // The parish being edited
  selectedParish: Partial<Parish> = {
    ParishID: undefined,
    ParishName: '',
    ParishStNumber: '',
    ParishStName: '',
    ParishSuburb: '',
    StateID: 0,
    DioceseID: 0,
    ParishPostcode: '',
    ParishPhone: '',
    ParishEmail: '',
    ParishWebsite: ''
  };

  // Table columns – Diocese column added right after State
  columns = [
    { header: 'Parish Name', field: 'ParishName' },
    { header: 'St No', field: 'ParishStNumber' },
    { header: 'Street Name', field: 'ParishStName' },
    { header: 'Suburb', field: 'ParishSuburb' },
    { header: 'State', field: 'state' }, // Will display state's abbreviation
    { header: 'Diocese', field: 'diocese' }, // Will display diocese name
    { header: 'PostCode', field: 'ParishPostcode' },
    { header: 'Phone', field: 'ParishPhone' },
    { header: 'Email', field: 'ParishEmail' },
    { header: 'Website', field: 'ParishWebsite' }
  ];

  // Master list of all dioceses
  dioceseList: Diocese[] = [];

  // For the Filter section
  filteredDiocesesForFilter: Diocese[] = [];
  filterStateID: any = 0;
  filterDioceseID: any = 0;
  dioceseFilterDisabled: boolean = true; // By default, filter Diocese is deactivated

  // For the Location/Contact section
  locationDioceses: Diocese[] = [];        // Only the dioceses for the selectedParish.StateID
  locationDioceseDisabled: boolean = true; // By default, main Diocese is deactivated

  constructor(
    private parishService: ParishService,
    private dioceseService: DioceseService,
    private stateService: StateService,
    private router: Router,
    private snackBar: MatSnackBar
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
        // Enable the State dropbox if states are available
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
    if (!this.selectedParish.ParishName?.trim() || !this.selectedParish.StateID || !this.selectedParish.DioceseID) {
      this.showWarning('Parish Name, State, and Diocese are required!');
      return;
    }
    this.parishService.createParish(this.selectedParish).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Failed to create parish:', err);
        this.showError('Fatal error creating parish!');
      }
    });
  }

  modifyParish(): void {
    if (!this.selectedParish.ParishID) {
      this.showWarning('No parish selected to update!');
      return;
    }
    const id = this.selectedParish.ParishID;
    this.parishService.updateParish(id, this.selectedParish).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Failed to update parish:', err);
        this.showError('Fatal error updating parish!');
      }
    });
  }

  deleteParish(): void {
    if (!this.selectedParish.ParishID) {
      this.showWarning('No parish selected to delete!');
      return;
    }
    const id = this.selectedParish.ParishID;
    this.parishService.deleteParish(id).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Failed to delete parish:', err);
        this.showError('Fatal error deleting parish!');
      }
    });
  }

  cancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedParish = {
      ParishID: undefined,
      ParishName: '',
      ParishStNumber: '',
      ParishStName: '',
      ParishSuburb: '',
      StateID: 0,
      DioceseID: 0,
      ParishPostcode: '',
      ParishPhone: '',
      ParishEmail: '',
      ParishWebsite: ''
    };
    this.hasSubmitted = false;
    // Also reset location diocese
    this.locationDioceses = [];
    this.locationDioceseDisabled = true;
  }

  selectParish(parish: Parish): void {
    this.selectedParish = { ...parish };
    this.hasSubmitted = false;
    // Possibly call onLocationStateChange() if we want to refresh the location diocese state
    this.onLocationStateChange();
  }

  /* ---------------------------
     MAIN LOCATION/CONTACT LOGIC
     for linking State -> Diocese
  --------------------------- */
  onLocationStateChange(): void {
    const stID = Number(this.selectedParish.StateID);
    if (!stID || stID === 0) {
      // No state => Clear and disable diocese
      this.locationDioceses = [];
      this.selectedParish.DioceseID = 0;
      this.locationDioceseDisabled = true;
    } else {
      // Filter all dioceses for the chosen state
      const relevant = this.dioceseList.filter(d => d.StateID === stID);
      this.locationDioceses = relevant;
      // Enable diocese only if there's at least one
      this.locationDioceseDisabled = (relevant.length === 0);
      // If the previously selected diocese is no longer valid, reset it
      if (
        this.selectedParish.DioceseID &&
        !relevant.some(d => d.DioceseID === this.selectedParish.DioceseID)
      ) {
        this.selectedParish.DioceseID = 0;
      }
    }
  }

  /* ---------------------------
     FILTERS for Linking State, Diocese & Parish
     (Separate from the main Location/Contact section)
  --------------------------- */
  onFilterStateChange(): void {
    const stateID = Number(this.filterStateID);
    if (!stateID || stateID === 0) {
      // Clear and deactivate the Filter's diocese dropbox
      this.filteredDiocesesForFilter = [];
      this.filterDioceseID = 0;
      this.dioceseFilterDisabled = true;
      this.parishes = this.allParishes;
    } else {
      this.filteredDiocesesForFilter = this.dioceseList.filter(d => d.StateID === stateID);
      this.dioceseFilterDisabled = (this.filteredDiocesesForFilter.length === 0);
      this.applyParishFilter();
    }
  }

  onFilterDioceseChange(): void {
    this.applyParishFilter();
  }

  private applyParishFilter(): void {
    const stateID = Number(this.filterStateID);
    if (!stateID || stateID === 0) {
      this.parishes = this.allParishes;
    } else {
      let filtered = this.allParishes.filter(p => p.StateID === stateID);
      if (this.filterDioceseID && Number(this.filterDioceseID) > 0) {
        filtered = filtered.filter(p => p.DioceseID === Number(this.filterDioceseID));
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

  // getCellValue for displaying State abbreviation and Diocese name
  getCellValue(row: Parish, column: { header: string; field: string }): any {
    if (column.field === 'state') {
      const st = this.allStates.find(s => s.StateID === row.StateID);
      return st ? st.StateAbbreviation : '';
    } else if (column.field === 'diocese') {
      const d = this.dioceseList.find(di => di.DioceseID === row.DioceseID);
      return d ? d.DioceseName : '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  trackByParishID(index: number, item: Parish): number {
    return item.ParishID;
  }

  trackByParishColumn(index: number, item: any) {
    return item.field;
  }

  /* ---------------------------
     SNACK BAR
  --------------------------- */
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
