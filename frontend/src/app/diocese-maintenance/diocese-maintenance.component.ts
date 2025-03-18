import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { DioceseService, Diocese } from './diocese.service';

@Component({
  selector: 'app-diocese-maintenance',
  templateUrl: './diocese-maintenance.component.html',
  styleUrls: ['./diocese-maintenance.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule]
})
export class DioceseMaintenanceComponent implements OnInit {
  // The array of dioceses loaded from the backend
  dioceses: Diocese[] = [];

  // The diocese currently selected for editing in the form
  selectedDiocese: Partial<Diocese> = {
    DioceseID: undefined,
    DioceseName: '',
    DioceseStreetNo: '',
    DioceseStreetName: '',
    DioceseSuburb: '',
    DioceseState: '',
    DiocesePostcode: '',
    DiocesePhone: '',
    DioceseEmail: '',
    DioceseWebsite: ''
  };

  // States dropdown options
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // Define columns for the drag-and-drop grid
  columns = [
    { header: 'Diocese Name', field: 'DioceseName' },
    { header: 'Street No', field: 'DioceseStreetNo' },
    { header: 'Street Name', field: 'DioceseStreetName' },
    { header: 'Suburb', field: 'DioceseSuburb' },
    { header: 'State', field: 'DioceseState' },
    { header: 'Post Code', field: 'DiocesePostcode' },
    { header: 'Phone', field: 'DiocesePhone' },
    { header: 'Email', field: 'DioceseEmail' },
    { header: 'Website', field: 'DioceseWebsite' },
  ];

  constructor(private dioceseService: DioceseService) { }

  ngOnInit(): void {
    this.loadAllDioceses();
  }

  // Build a dynamic grid: one 'auto' column per entry in `columns`
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  // Drag-and-drop event handlers
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
  getCellValue(row: Diocese, column: { header: string; field: string }): any {
    // Simply read the field from the row, e.g. row['DioceseName']
    return (row as any)[column.field] || '';
  }

  // Called when user clicks on a row
  selectDiocese(diocese: Diocese): void {
    this.selectedDiocese = { ...diocese };
  }

  // CRUD methods
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => {
        this.dioceses = data;
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
      }
    });
  }

  trackByDioceseID(index: number, item: Diocese) {
    return item.DioceseID; // Must be unique
  }

  addDiocese(): void {
    this.dioceseService.createDiocese(this.selectedDiocese).subscribe({
      next: () => {
        this.loadAllDioceses();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create diocese:', err);
      }
    });
  }

  modifyDiocese(): void {
    if (!this.selectedDiocese.DioceseID) {
      console.error('No diocese selected to update!');
      return;
    }
    const id = this.selectedDiocese.DioceseID;
    this.dioceseService.updateDiocese(id, this.selectedDiocese).subscribe({
      next: () => {
        this.loadAllDioceses();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to update diocese:', err);
      }
    });
  }

  deleteDiocese(): void {
    if (!this.selectedDiocese.DioceseID) {
      console.error('No diocese selected to delete!');
      return;
    }
    const id = this.selectedDiocese.DioceseID;
    this.dioceseService.deleteDiocese(id).subscribe({
      next: () => {
        this.loadAllDioceses();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to delete diocese:', err);
      }
    });
  }

  cancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedDiocese = {
      DioceseID: undefined,
      DioceseName: '',
      DioceseStreetNo: '',
      DioceseStreetName: '',
      DioceseSuburb: '',
      DioceseState: '',
      DiocesePostcode: '',
      DiocesePhone: '',
      DioceseEmail: '',
      DioceseWebsite: ''
    };
  }
}
