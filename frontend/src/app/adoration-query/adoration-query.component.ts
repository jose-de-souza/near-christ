import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdorationService, Adoration } from '../adoration-schedule/adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { forkJoin } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-adoration-query',
  templateUrl: './adoration-query.component.html',
  styleUrls: ['./adoration-query.component.scss'],
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatTooltipModule, DataTableComponent]
})
export class AdorationQueryComponent implements OnInit {
  columns = [
    { header: 'Parish Name', field: 'parishName' },
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'State', field: 'stateAbbreviation' },
    { header: 'End', field: 'adorationEnd' },
    { header: 'Type', field: 'adorationType' },
    { header: 'Day', field: 'adorationDay' },
    { header: 'Location', field: 'adorationLocation' },
    { header: 'Location Type', field: 'adorationLocationType' },
    { header: 'Start', field: 'adorationStart' },
  ];

  allStates: State[] = [];
  allDioceses: Diocese[] = [];
  allParishes: Parish[] = [];
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];
  dioceseDisabled = true;
  parishDisabled = true;
  selectedStateID: number = 0;
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;
  results: any[] = [];

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
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
      parishes: this.parishService.getAllParishes()
    }).subscribe({
      next: ({ states, dioceses, parishes }) => {
        console.log('Response for states:', states);
        console.log('Response for dioceses:', dioceses);
        console.log('Response for parishes:', parishes);
        this.allStates = this.getData<State>(states);
        this.allDioceses = this.getData<Diocese>(dioceses);
        this.allParishes = this.getData<Parish>(parishes);
        this.dioceseDisabled = this.allDioceses.length === 0;
        this.parishDisabled = this.allParishes.length === 0;
        this.filteredDioceses = [];
        this.filteredParishes = [];
        console.log('Loaded States:', this.allStates.map(s => ({ stateId: s.stateId, stateAbbreviation: s.stateAbbreviation })));
        console.log('Loaded Dioceses:', this.allDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
        console.log('Loaded Parishes:', this.allParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName })));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load data:', err);
        this.showError('Error loading data from server.');
        this.allStates = [];
        this.allDioceses = [];
        this.allParishes = [];
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.results = [];
        this.cdr.detectChanges();
      }
    });
  }

  private mapAdorationData(adorations: Adoration[]): any[] {
    if (!Array.isArray(adorations)) {
      console.warn('mapAdorationData received non-array:', adorations);
      return [];
    }
    console.log('Mapping adorations for DataTable:', adorations);
    return adorations.map(adoration => {
      const state = this.allStates.find(s => s.stateId === adoration.stateId);
      const diocese = this.allDioceses.find(d => d.dioceseId === adoration.dioceseId);
      const parish = this.allParishes.find(p => p.parishId === adoration.parishId);
      if (!state) console.warn(`No state found for stateId: ${adoration.stateId}`);
      if (!diocese) console.warn(`No diocese found for dioceseId: ${adoration.dioceseId}`);
      if (!parish) console.warn(`No parish found for parishId: ${adoration.parishId}`);
      const dioceseName = diocese?.dioceseName || '';
      const parishName = parish?.parishName || '';
      return {
        ...adoration,
        stateAbbreviation: state?.stateAbbreviation || '',
        dioceseName: diocese?.dioceseWebsite ? `<a href="${diocese.dioceseWebsite}" target="_blank">${dioceseName}</a>` : dioceseName,
        parishName: parish?.parishWebsite ? `<a href="${parish.parishWebsite}" target="_blank">${parishName}</a>` : parishName
      };
    });
  }

  onStateChange(): void {
    const stateId = Number(this.selectedStateID);
    if (!Array.isArray(this.allDioceses)) {
      console.warn('allDioceses is not an array:', this.allDioceses);
      this.filteredDioceses = [];
      this.dioceseDisabled = true;
      return;
    }
    if (!stateId || stateId === 0) {
      this.filteredDioceses = [];
      this.filteredParishes = [];
      this.selectedDioceseID = null;
      this.selectedParishID = null;
      this.dioceseDisabled = true;
      this.parishDisabled = true;
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      this.selectedDioceseID = null;
      this.selectedParishID = null;
      this.filteredParishes = [];
      this.parishDisabled = true;
      console.log('State Changed:', {
        stateId,
        stateAbbreviation: abbrev,
        filteredDioceses: this.filteredDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })),
        resultsLength: this.results.length
      });
    }
  }

  onDioceseChange(): void {
    const dioceseId = this.selectedDioceseID != null ? Number(this.selectedDioceseID) : null;
    if (!Array.isArray(this.allParishes)) {
      console.warn('allParishes is not an array:', this.allParishes);
      this.filteredParishes = [];
      this.parishDisabled = true;
      return;
    }
    if (!dioceseId) {
      this.filteredParishes = [];
      this.selectedParishID = null;
      this.parishDisabled = true;
    } else {
      this.filteredParishes = this.allParishes.filter(p => p.dioceseId === dioceseId);
      this.parishDisabled = this.filteredParishes.length === 0;
      this.selectedParishID = null;
      console.log('Diocese Changed:', {
        dioceseId,
        dioceseName: this.allDioceses.find(d => d.dioceseId === dioceseId)?.dioceseName,
        filteredParishes: this.filteredParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName, dioceseId: p.dioceseId })),
        resultsLength: this.results.length
      });
    }
  }

  searchAdoration(): void {
    const stateId = (this.selectedStateID && this.selectedStateID > 0) ? this.selectedStateID : undefined;
    const dioceseId = (this.selectedDioceseID != null) ? this.selectedDioceseID : undefined;
    const parishId = (this.selectedParishID != null) ? this.selectedParishID : undefined;

    this.adorationService.searchAdorations(stateId, dioceseId, parishId).subscribe({
      next: (res: any) => {
        console.log('Search Response:', res);
        this.results = this.mapAdorationData(this.getData<Adoration>(res));
        console.log('Search Results:', this.results.map(a => ({
          adorationId: a.adorationId,
          stateAbbreviation: a.stateAbbreviation,
          dioceseName: a.dioceseName,
          parishName: a.parishName
        })));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to search adorations:', err);
        this.showError('Error searching adorations.');
        this.results = [];
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