import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

import { AdorationService, Adoration } from '../adoration-schedule/adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  standalone: true,
  selector: 'app-adoration-query',
  templateUrl: './adoration-query.component.html',
  styleUrls: ['./adoration-query.component.scss'],
  imports: [CommonModule, FormsModule, DragDropModule]
})
export class AdorationQueryComponent implements OnInit {
  // The columns we'll display. Each item is a separate "grid-column".
  columns = [
    { header: 'Parish Name',    field: 'parishName' },
    { header: 'Diocese Name',   field: 'dioceseName' },
    { header: 'State',          field: 'State' },
    { header: 'End',            field: 'AdorationEnd' },
    { header: 'Type',           field: 'AdorationType' },
    { header: 'Day',            field: 'AdorationDay' },
    { header: 'Location',       field: 'AdorationLocation' },
    { header: 'Location Type',  field: 'AdorationLocationType' },
    { header: 'Start',          field: 'AdorationStart' },
  ];

  // For the filter dropdowns
  states = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // The user’s current filter selections
  selectedState: string = '';
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;

  // The array of results from the backend
  results: Adoration[] = [];

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService
  ) {}

  ngOnInit(): void {
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  /**
   * Creates a dynamic grid layout: if you have N columns,
   * you'll get N "auto" columns (or tweak to "minmax(...)" as needed).
   */
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  /**
   * Reorder columns in the columns array whenever a user drops a column
   */
  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => { this.dioceseList = data; },
      error: (err) => { console.error('Failed to load dioceses:', err); }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => { this.parishList = data; },
      error: (err) => { console.error('Failed to load parishes:', err); }
    });
  }

  searchAdoration(): void {
    console.log('User selected:', {
      state: this.selectedState || '(All)',
      dioceseID: this.selectedDioceseID || '(All)',
      parishID: this.selectedParishID || '(All)',
    });

    const state = this.selectedState ? this.selectedState : undefined;
    const dioceseID = this.selectedDioceseID ? this.selectedDioceseID : undefined;
    const parishID = this.selectedParishID ? this.selectedParishID : undefined;

    this.adorationService.searchAdorations(state, dioceseID, parishID).subscribe({
      next: (data) => {
        this.results = data;
        console.log('Adoration query results:', data);
      },
      error: (err) => {
        console.error('Failed to search adorations:', err);
      }
    });
  }

  /**
   * Return the correct value for each cell, especially if
   * it references dioceseName or parishName from nested objects.
   */
  getCellValue(row: Adoration, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '';
    } else {
      return (row as any)[column.field] ?? '';
    }
  }

  /**
   * OPTIONAL: highlight the target column when a dragged item enters or leaves it
   */
  onDragEntered(event: any) {
    // event.container.element.nativeElement => the column element
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any) {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }
}
