import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { Adoration, AdorationService } from './adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  selector: 'app-adoration-schedule',
  templateUrl: './adoration-schedule.component.html',
  styleUrls: ['./adoration-schedule.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule]
})
export class AdorationScheduleComponent implements OnInit {
  // Columns for our grid-based results
  columns = [
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'Parish Name', field: 'parishName' },
    { header: 'Type', field: 'AdorationType' },
    { header: 'Location Type', field: 'AdorationLocationType' },
    { header: 'Location', field: 'AdorationLocation' },
    { header: 'State', field: 'State' },
    { header: 'Day', field: 'AdorationDay' },
    { header: 'Start', field: 'AdorationStart' },
    { header: 'End', field: 'AdorationEnd' },
  ];

  // The schedules array
  schedules: Adoration[] = [];

  // Diocese/Parish arrays for dropdowns
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // States array
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // The record currently being edited
  selectedAdoration: Partial<Adoration> = {
    AdorationID: undefined,
    DioceseID: 0,
    ParishID: 0,
    State: '',
    AdorationType: '',
    AdorationLocation: '',
    AdorationLocationType: '',
    AdorationDay: '',
    AdorationStart: '',
    AdorationEnd: ''
  };

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService
  ) { }

  ngOnInit(): void {
    this.loadAllAdorations();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  // For the dynamic grid columns
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  onDragEntered(event: any) {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any) {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  loadAllAdorations(): void {
    this.adorationService.getAllAdorations().subscribe({
      next: (data) => (this.schedules = data),
      error: (err) => console.error('Failed to load adorations:', err)
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => (this.dioceseList = data),
      error: (err) => console.error('Failed to load dioceses:', err)
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => (this.parishList = data),
      error: (err) => console.error('Failed to load parishes:', err)
    });
  }

  // Return the correct cell value
  getCellValue(row: Adoration, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  selectSchedule(schedule: Adoration): void {
    this.selectedAdoration = { ...schedule };
  }

  addSchedule(): void {
    this.adorationService.createAdoration(this.selectedAdoration).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => console.error('Failed to create adoration:', err)
    });
  }

  modifySchedule(): void {
    if (!this.selectedAdoration.AdorationID) {
      console.error('No adoration selected to update!');
      return;
    }
    const id = this.selectedAdoration.AdorationID;
    this.adorationService.updateAdoration(id, this.selectedAdoration).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => console.error('Failed to update adoration:', err)
    });
  }

  deleteSchedule(): void {
    if (!this.selectedAdoration.AdorationID) {
      console.error('No adoration selected to delete!');
      return;
    }
    const id = this.selectedAdoration.AdorationID;
    this.adorationService.deleteAdoration(id).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => console.error('Failed to delete adoration:', err)
    });
  }

  cancel(): void {
    this.resetForm();
  }

  trackByAdorationID(index: number, item: Adoration): number {
    return item.AdorationID;
  }

  private resetForm(): void {
    this.selectedAdoration = {
      AdorationID: undefined,
      DioceseID: 0,
      ParishID: 0,
      State: '',
      AdorationType: '',
      AdorationLocation: '',
      AdorationLocationType: '',
      AdorationDay: '',
      AdorationStart: '',
      AdorationEnd: ''
    };
  }
}
