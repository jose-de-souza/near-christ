import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ParishService, Parish } from './parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { ParishEditDialogComponent } from '../parish-edit-dialog/parish-edit-dialog.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-parish-maintenance',
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    DataTableComponent
  ]
})
export class ParishMaintenanceComponent implements OnInit {
  allParishes: Parish[] = [];
  parishes: any[] = [];
  allStates: State[] = [];
  allDioceses: Diocese[] = [];
  filteredDioceses: Diocese[] = [];
  filterStateID: number = 0;
  filterDioceseID: number | null = null;
  dioceseDisabled: boolean = true;
  private isRestoring: boolean = false;

  columns = [
    { header: 'Parish Name', field: 'parishName' },
    { header: 'St No', field: 'parishStNumber' },
    { header: 'Street Name', field: 'parishStName' },
    { header: 'Suburb', field: 'parishSuburb' },
    { header: 'State', field: 'stateAbbreviation' },
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'PostCode', field: 'parishPostcode' },
    { header: 'Phone', field: 'parishPhone' },
    { header: 'Email', field: 'parishEmail' },
    { header: 'Website', field: 'parishWebsite' },
  ];

  constructor(
    private parishService: ParishService,
    private dioceseService: DioceseService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initial load: no filters to restore, so pass defaults
    this.loadAllData(0, null);
  }

  // Centralized method to load all base data and then apply (or re-apply) filters
  private loadAllData(
    restoreStateID: number,
    restoreDioceseID: number | null
  ): void {
    forkJoin({
      states: this.stateService.getAllStates(),
      dioceses: this.dioceseService.getAllDioceses(),
      parishes: this.parishService.getAllParishes()
    }).subscribe({
      next: ({ states, dioceses, parishes }) => {
        this.allStates = this.getData<State>(states);
        this.allDioceses = this.getData<Diocese>(dioceses);
        this.allParishes = this.getData<Parish>(parishes);

        // Set the component's filter IDs to the values we want to restore
        this.filterStateID = restoreStateID;
        this.filterDioceseID = restoreDioceseID;

        // Re-evaluate and apply the filters
        this.reapplyFilters();
        this.cdr.detectChanges(); // Ensure UI updates
      },
      error: (err) => {
        this.showError('Error loading data from server.');
        this.allStates = [];
        this.allDioceses = [];
        this.allParishes = [];
        this.parishes = [];
        this.filteredDioceses = [];
        this.dioceseDisabled = true;
        this.cdr.detectChanges();
      }
    });
  }

  private getData<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    return Array.isArray(res.data) ? res.data : [];
  }

  private reapplyFilters(): void {
    const savedStateID = Number(this.filterStateID);
    const savedDioceseID = this.filterDioceseID !== null ? Number(this.filterDioceseID) : null;

    // Step 1: Apply State Filter
    this.isRestoring = true; // Prevent resetting diocese in onFilterStateChange
    this.filterStateID = savedStateID;
    this.onFilterStateChange();
    this.isRestoring = false;

    // Step 2: Apply Diocese Filter
    if (this.allDioceses.length === 0) {
      this.filterDioceseID = null;
      this.filteredDioceses = [];
      this.dioceseDisabled = true;
    } else if (savedDioceseID !== null && this.filteredDioceses.some(d => Number(d.dioceseId) === savedDioceseID)) {
      this.filterDioceseID = savedDioceseID;
    } else {
      this.filterDioceseID = null;
    }
    this.onFilterDioceseChange();

    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private mapParishData(parishes: Parish[]): any[] {
    return parishes.map(parish => {
      const state = this.allStates.find(s => s.stateId === parish.stateId);
      const diocese = this.allDioceses.find(d => d.dioceseId === parish.dioceseId);
      return {
        ...parish,
        stateAbbreviation: state?.stateAbbreviation || '',
        dioceseName: diocese?.dioceseName || ''
      };
    });
  }

  onFilterStateChange(): void {
    const stateId = Number(this.filterStateID);
    if (!Array.isArray(this.allDioceses)) {
      this.filteredDioceses = [];
    }
    if (stateId === 0) {
      this.filteredDioceses = [];
      if (!this.isRestoring) {
        this.filterDioceseID = null;
      }
      this.dioceseDisabled = true;
      this.parishes = this.mapParishData(this.allParishes);
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      if (!this.isRestoring) {
        this.filterDioceseID = null;
      }
      this.parishes = this.mapParishData(this.allParishes.filter(p => p.stateId === stateId));
    }
    this.cdr.detectChanges();
  }

  onFilterDioceseChange(): void {
    const stateId = Number(this.filterStateID);
    const dioceseId = this.filterDioceseID !== null ? Number(this.filterDioceseID) : null;
    let filtered = this.allParishes;
    if (stateId > 0) {
      filtered = filtered.filter(p => p.stateId === stateId);
    }
    if (dioceseId !== null) {
      filtered = filtered.filter(p => Number(p.dioceseId) === dioceseId);
    }
    this.parishes = this.mapParishData(filtered);
    this.cdr.detectChanges();
  }

  onRowClicked(row: Parish): void {
    this.openEditDialog(row);
  }

  addParish(): void {
    this.openEditDialog({} as Parish);
  }

  openEditDialog(parish: Parish): void {
    try {
      // Capture current filter state BEFORE opening the dialog
      const currentFilters = {
        stateId: this.filterStateID,
        dioceseId: this.filterDioceseID
      };

      const dialogRef = this.dialog.open(ParishEditDialogComponent, {
        data: parish,
        maxWidth: '90vw',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Re-load all base data, then re-apply the captured filters
          this.loadAllData(
            currentFilters.stateId,
            currentFilters.dioceseId
          );
        }
      });
    } catch (err) {
      this.showError('Error opening edit dialog. Please try again.');
    }
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