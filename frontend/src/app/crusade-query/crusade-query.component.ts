import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CrusadeService, Crusade } from '../rosary-crusade/crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { forkJoin } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-crusade-query',
  templateUrl: './crusade-query.component.html',
  styleUrls: ['./crusade-query.component.scss'],
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatTooltipModule, DataTableComponent]
})
export class CrusadeQueryComponent implements OnInit {
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
    private crusadeService: CrusadeService,
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

  private mapCrusadeData(crusades: Crusade[]): any[] {
    if (!Array.isArray(crusades)) {
      console.warn('mapCrusadeData received non-array:', crusades);
      return [];
    }
    console.log('Mapping crusades for DataTable:', crusades);
    return crusades.map(crusade => {
      const state = this.allStates.find(s => s.stateId === crusade.stateId);
      const diocese = this.allDioceses.find(d => d.dioceseId === crusade.dioceseId);
      const parish = this.allParishes.find(p => p.parishId === crusade.parishId);
      if (!state) console.warn(`No state found for stateId: ${crusade.stateId}`);
      if (!diocese) console.warn(`No diocese found for dioceseId: ${crusade.dioceseId}`);
      if (!parish) console.warn(`No parish found for parishId: ${crusade.parishId}`);
      const dioceseName = diocese?.dioceseName || '';
      const parishName = parish?.parishName || '';
      return {
        ...crusade,
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

  searchCrusade(): void {
    const stateId = this.selectedStateID > 0 ? this.selectedStateID : undefined;
    const dioceseId = this.selectedDioceseID != null ? this.selectedDioceseID : undefined;
    const parishId = this.selectedParishID != null ? this.selectedParishID : undefined;

    this.crusadeService.searchCrusades(stateId, dioceseId, parishId).subscribe({
      next: (res: any) => {
        console.log('Search Response:', res);
        this.results = this.mapCrusadeData(this.getData<Crusade>(res));
        console.log('Search Results:', this.results.map(c => ({
          crusadeId: c.crusadeId,
          stateAbbreviation: c.stateAbbreviation,
          dioceseName: c.dioceseName,
          parishName: c.parishName
        })));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to search crusades:', err);
        this.showError('Error searching crusades.');
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