import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdorationService, Adoration } from './adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { AdorationScheduleEditDialogComponent } from '../adoration-schedule-edit-dialog/adoration-schedule-edit-dialog.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-adoration-schedule',
  templateUrl: './adoration-schedule.component.html',
  styleUrls: ['./adoration-schedule.component.scss'],
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
export class AdorationScheduleComponent implements OnInit {
  allAdorations: Adoration[] = [];
  adorations: any[] = [];
  allStates: State[] = [];
  allDioceses: Diocese[] = [];
  allParishes: Parish[] = [];
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];
  filterStateID: number = 0;
  filterDioceseID: number | null = null;
  filterParishID: number | null = null;
  dioceseDisabled: boolean = true;
  parishDisabled: boolean = true;
  private isRestoring: boolean = false;

  columns = [
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'Parish', field: 'parishName' },
    { header: 'State', field: 'stateAbbreviation' },
    { header: 'Type', field: 'adorationType' },
    { header: 'Day', field: 'adorationDay' },
    { header: 'Start', field: 'adorationStart' },
    { header: 'End', field: 'adorationEnd' },
    { header: 'Location Type', field: 'adorationLocationType' },
    { header: 'Location', field: 'adorationLocation' },
  ];

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  private getData<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    return Array.isArray(res.data) ? res.data : [];
  }

  isArray(prop: any): boolean {
    return Array.isArray(prop);
  }

  ngOnInit(): void {
    this.loadAllData(0, null, null);
  }

  private loadAllData(
    restoreStateID: number,
    restoreDioceseID: number | null,
    restoreParishID: number | null
  ): void {
    forkJoin({
      states: this.stateService.getAllStates(),
      dioceses: this.dioceseService.getAllDioceses(),
      parishes: this.parishService.getAllParishes(),
      adorations: this.adorationService.getAllAdorations()
    }).subscribe({
      next: ({ states, dioceses, parishes, adorations }) => {
        this.allStates = this.getData<State>(states);
        this.allDioceses = this.getData<Diocese>(dioceses);
        this.allParishes = this.getData<Parish>(parishes);
        this.allAdorations = this.getData<Adoration>(adorations);

        console.log('loadAllData:', {
          states: this.allStates.length,
          dioceses: this.allDioceses.length,
          parishes: this.allParishes.length,
          adorations: this.allAdorations.length,
          restoreStateID,
          restoreDioceseID,
          restoreParishID,
          dioceseIds: this.allDioceses.map(d => Number(d.dioceseId)),
          parishIds: this.allParishes.map(p => Number(p.parishId))
        });

        this.filterStateID = restoreStateID;
        this.filterDioceseID = restoreDioceseID;
        this.filterParishID = restoreParishID;

        this.reapplyFilters();
      },
      error: (err) => {
        this.showError('Error loading data from server.');
        this.allStates = [];
        this.allDioceses = [];
        this.allParishes = [];
        this.allAdorations = [];
        this.adorations = [];
        this.filteredDioceses = [];
        this.filteredParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.cdr.detectChanges();
      }
    });
  }

  private reapplyFilters(): void {
    const savedStateID = Number(this.filterStateID);
    const savedDioceseID = this.filterDioceseID !== null ? Number(this.filterDioceseID) : null;
    const savedParishID = this.filterParishID !== null ? Number(this.filterParishID) : null;

    console.log('reapplyFilters start:', {
      savedStateID,
      savedDioceseID,
      savedParishID,
      allDiocesesLength: this.allDioceses.length,
      allParishesLength: this.allParishes.length
    });

    this.isRestoring = true;
    this.filterStateID = savedStateID;
    this.onFilterStateChange();
    this.isRestoring = false;
    console.log('After state filter:', {
      filterStateID: this.filterStateID,
      filteredDiocesesLength: this.filteredDioceses.length,
      dioceseIds: this.filteredDioceses.map(d => Number(d.dioceseId))
    });

    if (this.allDioceses.length === 0) {
      console.warn('No dioceses available to filter');
      this.filterDioceseID = null;
      this.filteredDioceses = [];
      this.dioceseDisabled = true;
    } else if (savedDioceseID !== null && this.filteredDioceses.some(d => Number(d.dioceseId) === savedDioceseID)) {
      this.filterDioceseID = savedDioceseID;
    } else {
      console.warn('Saved dioceseID not found in filteredDioceses:', savedDioceseID);
      this.filterDioceseID = null;
    }
    this.onFilterDioceseChange();
    console.log('After diocese filter:', {
      filterDioceseID: this.filterDioceseID,
      filteredParishesLength: this.filteredParishes.length,
      parishIds: this.filteredParishes.map(p => Number(p.parishId))
    });

    if (this.allParishes.length === 0) {
      console.warn('No parishes available to filter');
      this.filterParishID = null;
      this.filteredParishes = [];
      this.parishDisabled = true;
    } else if (savedParishID !== null && this.filteredParishes.some(p => Number(p.parishId) === savedParishID)) {
      this.filterParishID = savedParishID;
    } else {
      console.warn('Saved parishID not found in filteredParishes:', savedParishID);
      this.filterParishID = null;
    }
    this.onFilterParishChange();
    console.log('After parish filter:', {
      filterParishID: this.filterParishID,
      adorationsLength: this.adorations.length
    });

    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private mapAdorationData(adorations: Adoration[]): any[] {
    if (!Array.isArray(adorations)) {
      console.warn('mapAdorationData: Invalid adorations array');
      return [];
    }
    const mapped = adorations.map(adoration => {
      const state = this.allStates.find(s => s.stateId === adoration.stateId);
      const diocese = this.allDioceses.find(d => Number(d.dioceseId) === Number(adoration.dioceseId));
      const parish = this.allParishes.find(p => Number(p.parishId) === Number(adoration.parishId));
      return {
        ...adoration,
        stateAbbreviation: state?.stateAbbreviation || '',
        dioceseName: diocese?.dioceseName || '',
        parishName: parish?.parishName || ''
      };
    });
    console.log('mapAdorationData result:', {
      inputLength: adorations.length,
      outputLength: mapped.length,
      sampleRow: mapped[0]
    });
    this.cdr.detectChanges();
    return mapped;
  }

  trackByStateId(index: number, state: State): number {
    return state.stateId;
  }

  trackByDioceseId(index: number, diocese: Diocese): number {
    return diocese.dioceseId;
  }

  trackByParishId(index: number, parish: Parish): number {
    return parish.parishId;
  }

  onStateOptionClick(stateId: number): void {
    this.filterStateID = stateId;
    this.onFilterStateChange();
  }

  onDioceseOptionClick(dioceseId: number | null): void {
    this.filterDioceseID = dioceseId;
    this.onFilterDioceseChange();
  }

  onParishOptionClick(parishId: number | null): void {
    this.filterParishID = parishId;
    this.onFilterParishChange();
  }

  onFilterStateChange(): void {
    const stateId = Number(this.filterStateID);
    if (!Array.isArray(this.allDioceses)) {
      this.filteredDioceses = [];
    }
    if (!Array.isArray(this.allAdorations)) {
      this.adorations = [];
    }
    if (stateId === 0) {
      this.filteredDioceses = [];
      if (!this.isRestoring) {
        this.filterDioceseID = null;
        this.filterParishID = null;
      }
      this.dioceseDisabled = true;
      this.filteredParishes = [];
      this.parishDisabled = true;
      this.adorations = this.mapAdorationData(this.allAdorations);
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      if (!this.isRestoring) {
        this.filterDioceseID = null;
        this.filterParishID = null;
      }
      this.filteredParishes = [];
      this.parishDisabled = true;
      this.adorations = this.mapAdorationData(this.allAdorations.filter(a => a.stateId === stateId));
    }
    console.log('onFilterStateChange:', {
      stateId,
      filteredDiocesesLength: this.filteredDioceses.length,
      dioceseDisabled: this.dioceseDisabled
    });
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onFilterDioceseChange(): void {
    const stateId = Number(this.filterStateID);
    const dioceseId = this.filterDioceseID !== null ? Number(this.filterDioceseID) : null;
    if (!Array.isArray(this.allParishes)) {
      this.filteredParishes = [];
    }
    if (!Array.isArray(this.allAdorations)) {
      this.adorations = [];
    }
    if (dioceseId === null) {
      this.filteredParishes = [];
      if (!this.isRestoring) {
        this.filterParishID = null;
      }
      this.parishDisabled = true;
      this.adorations = this.mapAdorationData(
        this.allAdorations.filter(a => !stateId || a.stateId === stateId)
      );
    } else {
      this.filteredParishes = this.allParishes.filter(p => Number(p.dioceseId) === dioceseId);
      this.parishDisabled = this.filteredParishes.length === 0;
      if (!this.isRestoring) {
        this.filterParishID = null;
      }
      this.adorations = this.mapAdorationData(
        this.allAdorations.filter(a => Number(a.dioceseId) === dioceseId && (!stateId || a.stateId === stateId))
      );
    }
    console.log('onFilterDioceseChange:', {
      dioceseId,
      filteredParishesLength: this.filteredParishes.length,
      parishDisabled: this.parishDisabled
    });
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onFilterParishChange(): void {
    const stateId = Number(this.filterStateID);
    const dioceseId = this.filterDioceseID !== null ? Number(this.filterDioceseID) : null;
    const parishId = this.filterParishID !== null ? Number(this.filterParishID) : null;
    if (!Array.isArray(this.allAdorations)) {
      this.adorations = [];
    }
    let filtered = this.allAdorations;
    if (stateId > 0) {
      filtered = filtered.filter(a => a.stateId === stateId);
    }
    if (dioceseId !== null) {
      filtered = filtered.filter(a => Number(a.dioceseId) === dioceseId);
    }
    if (parishId !== null) {
      filtered = filtered.filter(a => Number(a.parishId) === parishId);
    }
    this.adorations = this.mapAdorationData(filtered);
    console.log('onFilterParishChange:', {
      parishId,
      adorationsLength: this.adorations.length
    });
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onRowClicked(row: Adoration): void {
    console.log('Row clicked:', row);
    this.openEditDialog(row);
  }

  addAdoration(): void {
    this.openEditDialog({} as Adoration);
  }

  openEditDialog(adoration: Adoration): void {
    try {
      const currentFilters = {
        stateId: this.filterStateID,
        dioceseId: this.filterDioceseID,
        parishId: this.filterParishID
      };

      const dialogRef = this.dialog.open(AdorationScheduleEditDialogComponent, {
        data: adoration,
        maxWidth: '90vw',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          setTimeout(() => {
            this.loadAllData(
              currentFilters.stateId,
              currentFilters.dioceseId,
              currentFilters.parishId
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