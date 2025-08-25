import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-parish-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatTooltipModule, DataTableComponent],
  templateUrl: './parish-list.component.html',
  styleUrls: ['./parish-list.component.scss']
})
export class ParishListComponent implements OnInit {
  columns = [
    { header: 'Parish Name', field: 'parishName' },
    { header: 'Website', field: 'parishWebsite' },
    { header: 'Street No', field: 'parishStNumber' },
    { header: 'Street Name', field: 'parishStName' },
    { header: 'Suburb', field: 'parishSuburb' },
    { header: 'Postcode', field: 'parishPostcode' },
    { header: 'Phone', field: 'parishPhone' },
    { header: 'Email', field: 'parishEmail' },
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'Associated State', field: 'stateAbbreviation' },
  ];

  allStates: State[] = [];
  dioceseList: Diocese[] = [];
  filteredDioceses: Diocese[] = [];
  parishList: Parish[] = [];
  filteredParishes: Parish[] = [];
  sortedParishes: Parish[] = [];
  dioceseDisabled = true;
  selectedStateID: number = 0;
  selectedDioceseID: number | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 25, 50];
  sortColumn: string = 'parishName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private parishService: ParishService,
    private dioceseService: DioceseService,
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
        this.dioceseList = this.getData<Diocese>(dioceses);
        this.parishList = this.getData<Parish>(parishes);
        this.dioceseDisabled = this.dioceseList.length === 0;
        this.filteredParishes = this.mapParishData(this.parishList);
        this.sortParishes();
        console.log('Loaded States:', this.allStates.map(s => ({ stateId: s.stateId, stateAbbreviation: s.stateAbbreviation })));
        console.log('Loaded Dioceses:', this.dioceseList.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
        console.log('Loaded Parishes:', this.parishList.map(p => ({ parishId: p.parishId, parishName: p.parishName })));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load data:', err);
        this.showError('Error loading data from server.');
        this.allStates = [];
        this.dioceseList = [];
        this.parishList = [];
        this.filteredParishes = [];
        this.dioceseDisabled = true;
        this.cdr.detectChanges();
      }
    });
  }

  private mapParishData(parishes: Parish[]): any[] {
    if (!Array.isArray(parishes)) {
      console.warn('mapParishData received non-array:', parishes);
      return [];
    }
    console.log('Mapping parishes for DataTable:', parishes);
    return parishes.map(parish => {
      const state = this.allStates.find(s => s.stateId === parish.stateId);
      const diocese = this.dioceseList.find(d => d.dioceseId === parish.dioceseId);
      if (!state) console.warn(`No state found for stateId: ${parish.stateId}`);
      if (!diocese) console.warn(`No diocese found for dioceseId: ${parish.dioceseId}`);
      const website = parish.parishWebsite || '';
      return {
        ...parish,
        stateAbbreviation: state?.stateAbbreviation || '',
        dioceseName: diocese?.dioceseName || '',
        parishWebsite: website.trim() ? `<a href="${website}" target="_blank">${website}</a>` : ''
      };
    });
  }

  onStateChange(): void {
    const stateId = Number(this.selectedStateID);
    let abbrev = '';
    if (!Array.isArray(this.dioceseList)) {
      console.warn('diocesesList is not an array:', this.dioceseList);
      this.filteredDioceses = [];
      this.dioceseDisabled = true;
      return;
    }
    if (!stateId || stateId === 0) {
      this.filteredDioceses = [];
      this.selectedDioceseID = null;
      this.dioceseDisabled = true;
      this.filteredParishes = this.mapParishData(this.parishList);
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.dioceseList.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      this.selectedDioceseID = null;
      this.filteredParishes = this.mapParishData(this.parishList.filter(p => p.stateId === stateId));
    }
    this.onDioceseChange();
    this.sortParishes();
    this.currentPage = 1;
    console.log('State Changed:', {
      stateId,
      stateAbbreviation: abbrev,
      filteredDioceses: this.filteredDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })),
      filteredParishesLength: this.filteredParishes.length
    });
    this.cdr.detectChanges();
  }

  onDioceseChange(): void {
    const dioceseId = this.selectedDioceseID != null ? Number(this.selectedDioceseID) : null;
    if (!Array.isArray(this.parishList)) {
      console.warn('parishList is not an array:', this.parishList);
      this.filteredParishes = [];
      return;
    }
    if (!dioceseId) {
      this.filteredParishes = this.mapParishData(
        this.selectedStateID ? this.parishList.filter(p => p.stateId === this.selectedStateID) : this.parishList
      );
    } else {
      this.filteredParishes = this.mapParishData(
        this.parishList.filter(p => p.dioceseId === dioceseId && (!this.selectedStateID || p.stateId === this.selectedStateID))
      );
    }
    this.sortParishes();
    this.currentPage = 1;
    console.log('Diocese Changed:', {
      dioceseId,
      dioceseName: this.dioceseList.find(d => d.dioceseId === dioceseId)?.dioceseName,
      filteredParishesLength: this.filteredParishes.length
    });
    this.cdr.detectChanges();
  }

  sortParishes(): void {
    this.sortedParishes = [...this.filteredParishes].sort((a, b) => {
      let valA = (a as any)[this.sortColumn] || '';
      let valB = (b as any)[this.sortColumn] || '';
      if (this.sortColumn === 'dioceseName') {
        valA = this.dioceseList.find(d => d.dioceseId === a.dioceseId)?.dioceseName || '';
        valB = this.dioceseList.find(d => d.dioceseId === b.dioceseId)?.dioceseName || '';
      } else if (this.sortColumn === 'stateAbbreviation') {
        valA = this.allStates.find(s => s.stateId === a.stateId)?.stateAbbreviation || '';
        valB = this.allStates.find(s => s.stateId === b.stateId)?.stateAbbreviation || '';
      }
      if (valA < valB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortParishes();
  }

  getPaginatedParishes(): Parish[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.sortedParishes.slice(start, end);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredParishes.length / this.pageSize);
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