import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';

@Component({
  selector: 'app-diocese-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatTooltipModule],
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
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
  }

  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data;
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
        this.onStateChange(); // Initialize filteredDioceses
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
      }
    });
  }

  onStateChange(): void {
    const stateId = Number(this.selectedStateID);
    if (stateId === 0) {
      this.filteredDioceses = [...this.dioceseList];
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.dioceseList.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
    }
    this.sortDioceses();
    this.currentPage = 1;
  }

  sortDioceses(): void {
    this.sortedDioceses = [...this.filteredDioceses].sort((a, b) => {
      let valA = (a as any)[this.sortColumn];
      let valB = (b as any)[this.sortColumn];
      if (this.sortColumn === 'associatedStateAbbreviations') {
        valA = valA?.join(', ') || '';
        valB = valB?.join(', ') || '';
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

  getCellValue(row: Diocese, column: { header: string; field: string }): any {
    if (column.field === 'associatedStateAbbreviations') {
      return row.associatedStateAbbreviations?.join(', ') || '';
    } else if (column.field === 'dioceseWebsite') {
      const website = row.dioceseWebsite || '';
      if (website.trim()) {
        return `<a href="${website}" target="_blank">${website}</a>`;
      } else {
        return '';
      }
    } else {
      return (row as any)[column.field] || '';
    }
  }

  trackByDioceseID(index: number, item: Diocese): number {
    return item.dioceseId;
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