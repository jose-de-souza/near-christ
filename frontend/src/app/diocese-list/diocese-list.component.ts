import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-diocese-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatTooltipModule, DataTableComponent],
  templateUrl: './diocese-list.component.html',
  styleUrls: ['./diocese-list.component.scss']
})
export class DioceseListComponent implements OnInit {
  columns = [
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'Website', field: 'dioceseWebsite' },
    { header: 'Street No', field: 'dioceseStreetNo' },
    { header: 'Street Name', field: 'dioceseStreetName' },
    { header: 'Suburb', field: 'dioceseSuburb' },
    { header: 'Postcode', field: 'diocesePostcode' },
    { header: 'Phone', field: 'diocesePhone' },
    { header: 'Email', field: 'dioceseEmail' },
    { header: 'Associated States', field: 'associatedStateAbbreviations' },
  ];

  allStates: State[] = [];
  dioceseList: Diocese[] = [];
  filteredDioceses: Diocese[] = [];
  sortedDioceses: Diocese[] = [];
  selectedStateID: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 25, 50];
  sortColumn: string = 'dioceseName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
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
      dioceses: this.dioceseService.getAllDioceses()
    }).subscribe({
      next: ({ states, dioceses }) => {
        this.allStates = this.getData<State>(states);
        this.dioceseList = this.getData<Diocese>(dioceses);
        this.filteredDioceses = this.mapDioceseData(this.dioceseList);
        this.sortDioceses();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showError('Error loading data from server.');
        this.allStates = [];
        this.dioceseList = [];
        this.filteredDioceses = [];
        this.cdr.detectChanges();
      }
    });
  }

  private mapDioceseData(dioceses: Diocese[]): any[] {
    if (!Array.isArray(dioceses)) {
      return [];
    }
    return dioceses.map(diocese => {
      const website = diocese.dioceseWebsite || '';
      return {
        ...diocese,
        dioceseWebsite: website.trim() ? `<a href="${website}" target="_blank">${website}</a>` : '',
        associatedStateAbbreviations: diocese.associatedStateAbbreviations?.join(', ') || ''
      };
    });
  }

  onStateChange(): void {
    const stateId = Number(this.selectedStateID);
    if (!Array.isArray(this.dioceseList)) {
      this.filteredDioceses = [];
      return;
    }
    if (stateId === 0) {
      this.filteredDioceses = this.mapDioceseData(this.dioceseList);
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.mapDioceseData(
        this.dioceseList.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false)
      );
    }
    this.sortDioceses();
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  sortDioceses(): void {
    this.sortedDioceses = [...this.filteredDioceses].sort((a, b) => {
      let valA = (a as any)[this.sortColumn];
      let valB = (b as any)[this.sortColumn];
      if (this.sortColumn === 'associatedStateAbbreviations') {
        valA = valA || '';
        valB = valB || '';
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
    this.sortDioceses();
  }

  getPaginatedDioceses(): Diocese[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.sortedDioceses.slice(start, end);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDioceses.length / this.pageSize);
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