import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ParishService, Parish } from './parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';

@Component({
  selector: 'app-parish-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule],
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss']
})
export class ParishMaintenanceComponent implements OnInit {
  // Complete list of parishes from the backend
  allParishes: Parish[] = [];
  // The currently displayed list (filtered)
  parishes: Parish[] = [];

  hasSubmitted = false;

  // Predefined states
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // The parish record being edited
  selectedParish: Partial<Parish> = {
    ParishID: undefined,
    ParishName: '',
    ParishStNumber: '',
    ParishStName: '',
    ParishSuburb: '',
    ParishState: '',
    ParishPostcode: '',
    ParishPhone: '',
    ParishEmail: '',
    ParishWebsite: ''
  };

  // Columns for the results grid
  columns = [
    { header: 'Parish Name', field: 'ParishName' },
    { header: 'St No', field: 'ParishStNumber' },
    { header: 'Street Name', field: 'ParishStName' },
    { header: 'Suburb', field: 'ParishSuburb' },
    { header: 'State', field: 'ParishState' },
    { header: 'PostCode', field: 'ParishPostcode' },
    { header: 'Phone', field: 'ParishPhone' },
    { header: 'Email', field: 'ParishEmail' },
    { header: 'Website', field: 'ParishWebsite' }
  ];

  // For the filter
  dioceseList: Diocese[] = [];
  filterState = '';
  filterDioceseID: number | null = 0;
  filteredDiocesesForFilter: Diocese[] = [];
  dioceseFilterDisabled = true;

  constructor(
    private parishService: ParishService,
    private dioceseService: DioceseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllParishes();
    this.loadAllDioceses();
  }

  // ---------------------------
  // DRAG & DROP for the table
  // ---------------------------
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

  getCellValue(row: Parish, column: { header: string; field: string }): any {
    return (row as any)[column.field] || '';
  }

  trackByParishID(index: number, item: Parish): number {
    return item.ParishID;
  }

  selectParish(parish: Parish): void {
    this.selectedParish = { ...parish };
  }

  // ---------------------------
  // LOAD / CRUD
  // ---------------------------
  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data: Parish[]) => {
        // Store the full list AND the displayed list
        this.allParishes = data;
        this.parishes = data;
      },
      error: (err: any) => {
        if (err.status !== 403) {
          console.error('Failed to load parishes:', err);
          this.showError('Fatal error loading parishes! Please contact support.');
        }
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data: Diocese[]) => {
        this.dioceseList = data;
      },
      error: (err: any) => {
        if (err.status !== 403) {
          console.error('Failed to load dioceses:', err);
          this.showError('Fatal error loading dioceses! Please contact support.');
        }
      }
    });
  }

  addParish(): void {
    this.hasSubmitted = true;
    if (!this.selectedParish.ParishName?.trim()) {
      this.showWarning('Parish Name is required!');
      return;
    }
    this.parishService.createParish(this.selectedParish).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err: any) => {
        if (err.status !== 403) {
          console.error('Failed to create parish:', err);
          this.showError('Fatal error creating parish! Please contact support.');
        }
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
        if (err.status !== 403) {
          console.error('Failed to update parish:', err);
          this.showError('Fatal error updating parish! Please contact support.');
        }
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
        if (err.status !== 403) {
          console.error('Failed to delete parish:', err);
          this.showError('Fatal error deleting parish! Please contact support.');
        }
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
      ParishState: '',
      ParishPostcode: '',
      ParishPhone: '',
      ParishEmail: '',
      ParishWebsite: ''
    };
    this.hasSubmitted = false;
  }

  // ---------------------------
  // FILTER LOGIC
  // ---------------------------
  onFilterStateChange(): void {
    if (!this.filterState) {
      // No state => show all
      this.filteredDiocesesForFilter = [];
      this.filterDioceseID = 0;
      this.dioceseFilterDisabled = true;
      this.parishes = this.allParishes;
    } else {
      // Filter dioceses by the chosen state
      this.filteredDiocesesForFilter = this.dioceseList.filter(
        (d: Diocese) => d.DioceseState === this.filterState
      );
      this.dioceseFilterDisabled = (this.filteredDiocesesForFilter.length === 0);
      this.applyParishFilter();
    }
  }

  onFilterDioceseChange(): void {
    this.applyParishFilter();
  }

  private applyParishFilter(): void {
    if (!this.filterState) {
      // If no state => show all parishes
      this.parishes = this.allParishes;
    } else {
      // Filter for the selected state
      let filtered = this.allParishes.filter(
        (p: Parish) => p.ParishState === this.filterState
      );
      // Then filter by diocese if > 0
      if (this.filterDioceseID && this.filterDioceseID > 0) {
        filtered = filtered.filter((p: Parish) => p.DioceseID === this.filterDioceseID);
      }
      this.parishes = filtered;
    }
  }

  // ---------------------------
  // SNACK BAR HELPERS
  // ---------------------------
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
