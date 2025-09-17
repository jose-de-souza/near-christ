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
    this.loadAllData(0, null);
  }

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

        console.log('loadAllData:', {
          states: this.allStates.length,
          dioceses: this.allDioceses.length,
          parishes: this.allParishes.length,
          restoreStateID,
          restoreDioceseID,
          dioceseIds: this.allDioceses.map(d => Number(d.dioceseId))
        });

        this.filterStateID = restoreStateID;
        this.filterDioceseID = restoreDioceseID;

        this.reapplyFilters();
        this.cdr.detectChanges();
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

    console.log('reapplyFilters start:', {
      savedStateID,
      savedDioceseID,
      allDiocesesLength: this.allDioceses.length
    });

    this.isRestoring = true;
    this.filterStateID = savedStateID;
    this.onFilterStateChange();
    this.isRestoring = false;

    if (this.allDioceses.length === 0) {
      console.warn('No dioceses available to filter');
      this.filterDioceseID = null;
      this.filteredDioceses = [];
      this.dioceseDisabled = true;
    } else if (savedDioceseID !== null && this.allDioceses.some(d => Number(d.dioceseId) === savedDioceseID)) {
      this.filterDioceseID = savedDioceseID;
      if (!this.filteredDioceses.some(d => Number(d.dioceseId) === savedDioceseID)) {
        console.warn('Saved dioceseID valid globally but not in current filteredDioceses (post-delete); keeping filter but table may show broader results:', savedDioceseID);
      }
    } else {
      console.warn('Saved dioceseID not found in allDioceses:', savedDioceseID);
      this.filterDioceseID = null;
    }
    this.onFilterDioceseChange();

    console.log('reapplyFilters end:', {
      filterStateID: this.filterStateID,
      filterDioceseID: this.filterDioceseID,
      parishesLength: this.parishes.length
    });

    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private mapParishData(parishes: Parish[]): any[] {
    if (!Array.isArray(parishes)) {
      console.warn('mapParishData: Invalid parishes array');
      return [];
    }
    const mapped = parishes.map(parish => {
      const state = this.allStates.find(s => s.stateId === parish.stateId);
      const diocese = this.allDioceses.find(d => Number(d.dioceseId) === Number(parish.dioceseId));
      return {
        ...parish,
        stateAbbreviation: state?.stateAbbreviation || '',
        dioceseName: diocese?.dioceseName || ''
      };
    });
    console.log('mapParishData result:', {
      inputLength: parishes.length,
      outputLength: mapped.length,
      sampleRow: mapped[0]
    });
    this.cdr.detectChanges();
    return mapped;
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
    console.log('onFilterStateChange:', {
      stateId,
      filteredDiocesesLength: this.filteredDioceses.length,
      dioceseDisabled: this.dioceseDisabled
    });
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
    console.log('onFilterDioceseChange:', {
      dioceseId,
      parishesLength: this.parishes.length
    });
    this.cdr.detectChanges();
  }

  onRowClicked(row: Parish): void {
    console.log('Row clicked:', row);
    this.openEditDialog(row);
  }

  addParish(): void {
    this.openEditDialog({} as Parish);
  }

  openEditDialog(parish: Parish): void {
    try {
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
        console.log('Dialog closed with result:', result);
        if (result) {
          setTimeout(() => {
            this.loadAllData(
              currentFilters.stateId,
              currentFilters.dioceseId
            );
          }, 500);
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