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
        this.adorations = this.mapAdorationData(this.allAdorations);
        this.filteredDioceses = [];
        this.filteredParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showError('Error loading data from server.');
        this.allStates = [];
        this.allDioceses = [];
        this.allParishes = [];
        this.allAdorations = [];
        this.adorations = [];
        this.cdr.detectChanges();
      }
    });
  }

  private mapAdorationData(adorations: Adoration[]): any[] {
    if (!Array.isArray(adorations)) {
      return [];
    }
    return adorations.map(adoration => {
      const state = this.allStates.find(s => s.stateId === adoration.stateId);
      const diocese = this.allDioceses.find(d => d.dioceseId === adoration.dioceseId);
      const parish = this.allParishes.find(p => p.parishId === adoration.parishId); 
      return {
        ...adoration,
        stateAbbreviation: state?.stateAbbreviation || '',
        dioceseName: diocese?.dioceseName || '',
        parishName: parish?.parishName || ''
      };
    });
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
      this.filterDioceseID = null;
      this.dioceseDisabled = true;
      this.filteredParishes = [];
      this.filterParishID = null;
      this.parishDisabled = true;
      this.adorations = this.mapAdorationData(this.allAdorations);
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      this.filterDioceseID = null;
      this.filteredParishes = [];
      this.filterParishID = null;
      this.parishDisabled = true;
      this.adorations = this.mapAdorationData(this.allAdorations.filter(a => a.stateId === stateId));
    }
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
      this.filterParishID = null;
      this.parishDisabled = true;
      this.adorations = this.mapAdorationData(
        this.allAdorations.filter(a => !stateId || a.stateId === stateId)
      );
    } else {
      this.filteredParishes = this.allParishes.filter(p => p.dioceseId === dioceseId);
      this.parishDisabled = this.filteredParishes.length === 0;
      this.filterParishID = null;
      this.adorations = this.mapAdorationData(
        this.allAdorations.filter(a => a.dioceseId === dioceseId && (!stateId || a.stateId === stateId))
      );
    }
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
      filtered = filtered.filter(a => a.dioceseId === dioceseId);
    }
    if (parishId !== null) {
      filtered = filtered.filter(a => a.parishId === parishId);
    }
    this.adorations = this.mapAdorationData(filtered);
    this.cdr.detectChanges();
  }

  onRowClicked(row: Adoration): void {
    this.openEditDialog(row);
  }

  addAdoration(): void {
    this.openEditDialog({} as Adoration);
  }

  openEditDialog(adoration: Adoration): void {
    try {
      const dialogRef = this.dialog.open(AdorationScheduleEditDialogComponent, {
        data: adoration,
        maxWidth: '90vw',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadAllAdorations();
        }
      });
    } catch (err) {
      this.showError('Error opening edit dialog. Please try again.');
    }
  }

  private loadAllAdorations(): void {
    this.adorationService.getAllAdorations().subscribe({
      next: (res: any) => {
        this.allAdorations = this.getData<Adoration>(res);
        this.adorations = this.mapAdorationData(this.allAdorations);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showError('Fatal error loading Adoration Schedules!');
        this.allAdorations = [];
        this.adorations = [];
        this.cdr.detectChanges();
      }
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