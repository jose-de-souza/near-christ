import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatTooltipModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnChanges {
  @Input() columns: { header: string, field: string }[] = [];
  @Input() data: any[] = [];
  @Input() pageSizeOptions: number[] = [10, 25, 50];
  @Input() defaultPageSize: number = 10;
  @Input() sortColumn: string = 'name';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() clickable: boolean = false;
  @Input() trackIdField: string = 'id';

  @Output() rowClicked = new EventEmitter<any>();

  filteredData: any[] = [];
  sortedData: any[] = [];
  currentPage: number = 1;
  pageSize: number = this.defaultPageSize;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.filteredData = [...(changes['data'].currentValue || [])];
      this.sortData();
    }
  }

  sortData(): void {
    this.sortedData = [...this.filteredData].sort((a, b) => {
      let valA = (a as any)[this.sortColumn] || '';
      let valB = (b as any)[this.sortColumn] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
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
    this.sortData();
  }

  getPaginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.sortedData.slice(start, end);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  getCellValue(row: any, column: { header: string; field: string }): any {
    if (column.field === 'associatedStateAbbreviations') {
      return row.associatedStateAbbreviations?.length ? row.associatedStateAbbreviations.join(', ') : '';
    }
    return (row as any)[column.field] || '';
  }

  onRowClick(row: any): void {
    if (this.clickable) {
      this.rowClicked.emit(row);
    }
  }

  trackByID(index: number, item: any): number {
    return (item as any)[this.trackIdField];
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