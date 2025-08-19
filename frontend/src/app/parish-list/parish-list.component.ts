import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';

@Component({
  selector: 'app-parish-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatTooltipModule],
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
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data;
        console.log('Loaded States:', this.allStates.map(s => ({ stateId: s.stateId, stateAbbreviation: s.stateAbbreviation })));
      },
      error: (err) => {
        console.error('Failed to load states:', err);
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        this.dioceseList = res.data;
        console.log('Loaded Dioceses:', this.dioceseList.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (res: any) => {
        this.parishList = res.data;
        this.onStateChange(); // Initialize filteredParishes
        console.log('Loaded Parishes:', this.parishList.map(p => ({
          parishId: p.parishId,
          parishName: p.parishName,
          dioceseId: p.dioceseId,
          stateId: p.stateId
        })));
      },
      error: (err) => {
        console.error('Failed to load parishes:', err);
      }
    });
  }

  onStateChange(): void {
    const stateId = Number(this.selectedStateID);
    if (!stateId || stateId === 0) {
      this.filteredDioceses = [];
      this.selectedDioceseID = null;
      this.dioceseDisabled = true;
      this.filteredParishes = [...this.parishList];
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.dioceseList.filter(d => d.associatedStateAbbreviations?.includes(abbrev));
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      this.selectedDioceseID = null;
      this.filteredParishes = this.parishList.filter(p => p.stateId === stateId);
    }
    this.onDioceseChange(); // Apply diocese filter if selected
    this.sortParishes();
    this.currentPage = 1;
    console.log('State Changed:', {
      stateId,
      stateAbbreviation: this.allStates.find(s => s.stateId === stateId)?.stateAbbreviation,
      filteredDioceses: this.filteredDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName }))
    });
  }

  onDioceseChange(): void {
    const dioceseId = this.selectedDioceseID != null ? Number(this.selectedDioceseID) : null;
    if (!dioceseId) {
      this.filteredParishes = this.selectedStateID ? this.parishList.filter(p => p.stateId === this.selectedStateID) : [...this.parishList];
    } else {
      this.filteredParishes = this.parishList.filter(p => p.dioceseId === dioceseId && (!this.selectedStateID || p.stateId === this.selectedStateID));
    }
    this.sortParishes();
    this.currentPage = 1;
    console.log('Diocese Changed:', {
      dioceseId,
      dioceseName: this.dioceseList.find(d => d.dioceseId === dioceseId)?.dioceseName,
      filteredParishes: this.filteredParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName, dioceseId: p.dioceseId }))
    });
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

  getCellValue(row: Parish, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      const diocese = this.dioceseList.find(d => d.dioceseId === row.dioceseId);
      return diocese?.dioceseName || '';
    } else if (column.field === 'stateAbbreviation') {
      const state = this.allStates.find(s => s.stateId === row.stateId);
      return state?.stateAbbreviation || '';
    } else if (column.field === 'parishWebsite') {
      const website = row.parishWebsite || '';
      if (website.trim()) {
        return `<a href="${website}" target="_blank">${website}</a>`;
      } else {
        return '';
      }
    } else {
      return (row as any)[column.field] || '';
    }
  }

  trackByParishID(index: number, item: Parish): number {
    return item.parishId;
  }

  trackByColumn(index: number, item: any): string {
    return item.field;
  }

  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  onDragEntered(event: CdkDragEnter): void {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }

  onDragExited(event: CdkDragExit): void {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }
}