import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CrusadeService, Crusade } from './crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { RosaryCrusadeEditDialogComponent } from '../rosary-crusade-edit-dialog/rosary-crusade-edit-dialog.component';
import { forkJoin } from 'rxjs';

interface DisplayCrusade extends Crusade {
  stateAbbreviation: string;
  dioceseName: string;
  parishName: string;
}

@Component({
  selector: 'app-rosary-crusade',
  templateUrl: './rosary-crusade.component.html',
  styleUrls: ['./rosary-crusade.component.scss'],
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
export class RosaryCrusadeComponent implements OnInit {
  allCrusades: Crusade[] = [];
  crusades: DisplayCrusade[] = [];
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
    { header: 'Confession Start', field: 'confessionStartTime' },
    { header: 'Confession End', field: 'confessionEndTime' },
    { header: 'Mass Start', field: 'massStartTime' },
    { header: 'Mass End', field: 'massEndTime' },
    { header: 'Crusade Start', field: 'crusadeStartTime' },
    { header: 'Crusade End', field: 'crusadeEndTime' },
    { header: 'Contact Name', field: 'contactName' },
    { header: 'Contact Phone', field: 'contactPhone' },
    { header: 'Contact Email', field: 'contactEmail' },
    { header: 'Comments', field: 'comments' },
  ];

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

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
      crusades: this.crusadeService.getAllCrusades()
    }).subscribe({
      next: ({ states, dioceses, parishes, crusades }) => {
        this.allStates = this.getData<State>(states);
        this.allDioceses = this.getData<Diocese>(dioceses);
        this.allParishes = this.getData<Parish>(parishes);
        this.allCrusades = this.getData<Crusade>(crusades);

        console.log('loadAllData:', {
          states: this.allStates.length,
          dioceses: this.allDioceses.length,
          parishes: this.allParishes.length,
          crusades: this.allCrusades.length,
          restoreStateID,
          restoreDioceseID,
          restoreParishID
        });

        this.filterStateID = restoreStateID;
        this.filterDioceseID = restoreDioceseID;
        this.filterParishID = restoreParishID;

        this.reapplyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showError('Error loading data from server.');
        this.allStates = [];
        this.allDioceses = [];
        this.allParishes = [];
        this.allCrusades = [];
        this.crusades = [];
        this.filteredDioceses = [];
        this.filteredParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
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

    if (this.allParishes.length === 0) {
      console.warn('No parishes available to filter');
      this.filterParishID = null;
      this.filteredParishes = [];
      this.parishDisabled = true;
    } else if (savedParishID !== null && this.allParishes.some(p => Number(p.parishId) === savedParishID)) {
      this.filterParishID = savedParishID;
      if (!this.filteredParishes.some(p => Number(p.parishId) === savedParishID)) {
        console.warn('Saved parishID valid globally but not in current filteredParishes (post-delete); keeping filter but table may show broader results:', savedParishID);
      }
    } else {
      console.warn('Saved parishID not found in allParishes:', savedParishID);
      this.filterParishID = null;
    }
    this.onFilterParishChange();

    console.log('reapplyFilters end:', {
      filterStateID: this.filterStateID,
      filterDioceseID: this.filterDioceseID,
      filterParishID: this.filterParishID,
      crusadesLength: this.crusades.length
    });

    this.cdr.markForCheck();
  }

  private mapCrusadeData(crusades: Crusade[]): DisplayCrusade[] {
    if (!Array.isArray(crusades)) {
      console.warn('mapCrusadeData: Invalid crusades array');
      return [];
    }
    const mapped = crusades.map(crusade => {
      const state = this.allStates.find(s => s.stateId === crusade.stateId);
      const diocese = this.allDioceses.find(d => Number(d.dioceseId) === Number(crusade.dioceseId));
      const parish = this.allParishes.find(p => Number(p.parishId) === Number(crusade.parishId));
      return {
        ...crusade,
        stateAbbreviation: state?.stateAbbreviation || '',
        dioceseName: diocese?.dioceseName || '',
        parishName: parish?.parishName || ''
      };
    });
    console.log('mapCrusadeData result:', {
      inputLength: crusades.length,
      outputLength: mapped.length,
      sampleRow: mapped[0]
    });
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
        this.filterParishID = null;
      }
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.filteredParishes = [];
      this.crusadeService.searchCrusades(undefined, undefined, undefined).subscribe({
        next: (res) => {
          this.crusades = this.mapCrusadeData(this.getData<Crusade>(res));
          console.log('onFilterStateChange:', {
            stateId,
            filteredDiocesesLength: this.filteredDioceses.length,
            dioceseDisabled: this.dioceseDisabled,
            crusadesLength: this.crusades.length
          });
          this.cdr.detectChanges();
        },
        error: (err) => this.showError('Error filtering crusades.')
      });
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
      this.crusadeService.searchCrusades(stateId, undefined, undefined).subscribe({
        next: (res) => {
          this.crusades = this.mapCrusadeData(this.getData<Crusade>(res));
          console.log('onFilterStateChange:', {
            stateId,
            filteredDiocesesLength: this.filteredDioceses.length,
            dioceseDisabled: this.dioceseDisabled,
            crusadesLength: this.crusades.length
          });
          this.cdr.detectChanges();
        },
        error: (err) => this.showError('Error filtering crusades.')
      });
    }
  }

  onFilterDioceseChange(): void {
    const stateId = Number(this.filterStateID) > 0 ? Number(this.filterStateID) : undefined;
    const dioceseId = this.filterDioceseID !== null ? Number(this.filterDioceseID) : undefined;
    if (!Array.isArray(this.allParishes)) {
      this.filteredParishes = [];
    }
    if (dioceseId === undefined) {
      this.filteredParishes = [];
      if (!this.isRestoring) {
        this.filterParishID = null;
      }
      this.parishDisabled = true;
      this.crusadeService.searchCrusades(stateId, undefined, undefined).subscribe({
        next: (res) => {
          this.crusades = this.mapCrusadeData(this.getData<Crusade>(res));
          console.log('onFilterDioceseChange:', {
            dioceseId,
            filteredParishesLength: this.filteredParishes.length,
            parishDisabled: this.parishDisabled,
            crusadesLength: this.crusades.length
          });
          this.cdr.detectChanges();
        },
        error: (err) => this.showError('Error filtering crusades.')
      });
    } else {
      this.filteredParishes = this.allParishes.filter(p => Number(p.dioceseId) === dioceseId);
      this.parishDisabled = this.filteredParishes.length === 0;
      if (!this.isRestoring) {
        this.filterParishID = null;
      }
      this.crusadeService.searchCrusades(stateId, dioceseId, undefined).subscribe({
        next: (res) => {
          this.crusades = this.mapCrusadeData(this.getData<Crusade>(res));
          console.log('onFilterDioceseChange:', {
            dioceseId,
            filteredParishesLength: this.filteredParishes.length,
            parishDisabled: this.parishDisabled,
            crusadesLength: this.crusades.length
          });
          this.cdr.detectChanges();
        },
        error: (err) => this.showError('Error filtering crusades.')
      });
    }
  }

  onFilterParishChange(): void {
    const stateId = Number(this.filterStateID) > 0 ? Number(this.filterStateID) : undefined;
    const dioceseId = this.filterDioceseID !== null ? Number(this.filterDioceseID) : undefined;
    const parishId = this.filterParishID !== null ? Number(this.filterParishID) : undefined;
    this.crusadeService.searchCrusades(stateId, dioceseId, parishId).subscribe({
      next: (res) => {
        this.crusades = this.mapCrusadeData(this.getData<Crusade>(res));
        console.log('onFilterParishChange:', {
          stateId,
          dioceseId,
          parishId,
          crusadesLength: this.crusades.length
        });
        this.cdr.detectChanges();
      },
      error: (err) => this.showError('Error filtering crusades.')
      });
  }

  onRowClicked(row: Crusade): void {
    console.log('Row clicked:', row);
    this.openEditDialog(row);
  }

  addCrusade(): void {
    this.openEditDialog({} as Crusade);
  }

  openEditDialog(crusade: Crusade): void {
    try {
      const currentFilters = {
        stateId: this.filterStateID,
        dioceseId: this.filterDioceseID,
        parishId: this.filterParishID
      };

      const dialogRef = this.dialog.open(RosaryCrusadeEditDialogComponent, {
        data: crusade,
        maxWidth: '90vw',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog closed with result:', result);
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