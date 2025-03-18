import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { CrusadeService, Crusade } from './crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  selector: 'app-rosary-crusade',
  templateUrl: './rosary-crusade.component.html',
  styleUrls: ['./rosary-crusade.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule]
})
export class RosaryCrusadeComponent implements OnInit {

  // 1) Column definitions for the grid-based results.
  columns = [
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'Parish', field: 'parishName' },
    { header: 'State', field: 'State' },
    { header: 'Confession Start', field: 'ConfessionStartTime' },
    { header: 'Confession End', field: 'ConfessionEndTime' },
    { header: 'Mass Start', field: 'MassStartTime' },
    { header: 'Mass End', field: 'MassEndTime' },
    { header: 'Crusade Start', field: 'CrusadeStartTime' },
    { header: 'Crusade End', field: 'CrusadeEndTime' },
    { header: 'Contact Name', field: 'ContactName' },
    { header: 'Contact Phone', field: 'ContactPhone' },
    { header: 'Contact Email', field: 'ContactEmail' },
    { header: 'Comments', field: 'Comments' },
  ];

  // 2) Arrays for dropdowns
  states = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // 3) Crusade array for displaying results
  crusades: Crusade[] = [];

  // 4) The crusade record currently being edited
  selectedCrusade: Partial<Crusade> = {
    DioceseID: 0,
    ParishID: 0,
    State: '',
    ConfessionStartTime: '',
    ConfessionEndTime: '',
    MassStartTime: '',
    MassEndTime: '',
    CrusadeStartTime: '',
    CrusadeEndTime: '',
    ContactName: '',
    ContactPhone: '',
    ContactEmail: '',
    Comments: ''
  };

  // ***** THIS GETTER FIXES THE ERROR *****
  // Tells the template how many 'auto' columns to create for the grid.
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService
  ) { }

  ngOnInit(): void {
    this.loadAllCrusades();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  loadAllCrusades(): void {
    this.crusadeService.getAllCrusades().subscribe({
      next: (data) => (this.crusades = data),
      error: (err) => console.error('Failed to load crusades:', err)
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

  // Clicking any cell => load that row's data into the form
  selectCrusade(c: Crusade): void {
    this.selectedCrusade = { ...c };
  }

  // Create new record
  addCrusade(): void {
    this.crusadeService.createCrusade(this.selectedCrusade).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => console.error('Failed to create crusade:', err)
    });
  }

  // Update existing record
  modifyCrusade(): void {
    if (!this.selectedCrusade.CrusadeID) {
      console.error('No crusade selected for update!');
      return;
    }
    this.crusadeService.updateCrusade(this.selectedCrusade.CrusadeID, this.selectedCrusade).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => console.error('Failed to update crusade:', err)
    });
  }

  // Delete existing record
  deleteCrusade(): void {
    if (!this.selectedCrusade.CrusadeID) {
      console.error('No crusade selected for deletion!');
      return;
    }
    this.crusadeService.deleteCrusade(this.selectedCrusade.CrusadeID).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => console.error('Failed to delete crusade:', err)
    });
  }

  cancel(): void {
    this.resetForm();
  }

  // Drag-and-drop reordering for columns
  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  onDragEntered(event: any) {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any) {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  // Return the correct value for each cell
  getCellValue(crusade: Crusade, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return crusade.diocese?.DioceseName || '';
    } else if (column.field === 'parishName') {
      return crusade.parish?.ParishName || '';
    } else {
      return (crusade as any)[column.field] || '';
    }
  }

  private resetForm(): void {
    this.selectedCrusade = {
      DioceseID: 0,
      ParishID: 0,
      State: '',
      ConfessionStartTime: '',
      ConfessionEndTime: '',
      MassStartTime: '',
      MassEndTime: '',
      CrusadeStartTime: '',
      CrusadeEndTime: '',
      ContactName: '',
      ContactPhone: '',
      ContactEmail: '',
      Comments: ''
    };
  }
}
