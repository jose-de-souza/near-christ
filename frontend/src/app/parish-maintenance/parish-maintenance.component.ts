import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { ParishService, Parish } from './parish.service';

@Component({
  selector: 'app-parish-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss'],
})
export class ParishMaintenanceComponent implements OnInit {
  // The array of parishes loaded from the backend
  parishes: Parish[] = [];

  // Predefined states for the dropdown
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // The parish currently selected for editing in the form
  selectedParish: Partial<Parish> = {
    ParishName: '',
    ParishStNumber: '',
    ParishStName: '',
    ParishSuburb: '',
    ParishState: '',
    ParishPostcode: '',
    ParishPhone: '',
    ParishEmail: '',
    ParishWebsite: ''
  };

  // Columns for the grid-based results
  columns = [
    { header: 'Parish Name', field: 'ParishName' },
    { header: 'St No', field: 'ParishStNumber' },
    { header: 'Street Name', field: 'ParishStName' },
    { header: 'Suburb', field: 'ParishSuburb' },
    { header: 'State', field: 'ParishState' },
    { header: 'PostCode', field: 'ParishPostcode' },
    { header: 'Phone', field: 'ParishPhone' },
    { header: 'Email', field: 'ParishEmail' },
    { header: 'Website', field: 'ParishWebsite' },
  ];

  constructor(
    private parishService: ParishService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllParishes();
  }

  // For the drag-and-drop grid
  get gridTemplateColumns(): string {
    // e.g., 9 columns => 'auto auto auto ...'
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

  // Return the correct cell value for each row & column
  getCellValue(row: Parish, column: { header: string; field: string }): any {
    return (row as any)[column.field] || '';
  }

  // Fetch all from backend
  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => {
        // If the backend returns { ParishID, ParishName, ... }
        // we can store them directly or transform if needed.
        this.parishes = data;
      },
      error: (err) => {
        console.error('Failed to load parishes:', err);
      }
    });
  }

  // For *ngFor trackBy
  trackByParishID(index: number, item: Parish) {
    return item.ParishID;
  }

  // Called when user clicks on a row in the results grid
  selectParish(parish: Parish): void {
    this.selectedParish = { ...parish };
  }

  // Button: Add new parish
  addParish(): void {
    this.parishService.createParish(this.selectedParish).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create parish:', err);
      }
    });
  }

  // Button: Modify existing parish
  modifyParish(): void {
    if (!this.selectedParish.ParishID) {
      console.error('No parish selected to update!');
      return;
    }
    const id = this.selectedParish.ParishID;
    this.parishService.updateParish(id, this.selectedParish).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to update parish:', err);
      }
    });
  }

  // Button: Delete existing parish
  deleteParish(): void {
    if (!this.selectedParish.ParishID) {
      console.error('No parish selected to delete!');
      return;
    }
    const id = this.selectedParish.ParishID;
    this.parishService.deleteParish(id).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to delete parish:', err);
      }
    });
  }

  // Button: Cancel
  cancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedParish = {};
  }
}
