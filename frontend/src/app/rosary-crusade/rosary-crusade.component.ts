import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { CrusadeService, Crusade } from './crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';

@Component({
  selector: 'app-rosary-crusade',
  templateUrl: './rosary-crusade.component.html',
  styleUrls: ['./rosary-crusade.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
})
export class RosaryCrusadeComponent implements OnInit {
  // Columns for the results grid
  columns = [
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'Parish', field: 'parishName' },
    { header: 'StateID', field: 'StateID' },
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

  // Arrays for states, dioceses, parishes, and crusade records
  allStates: State[] = [];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];
  crusades: Crusade[] = [];

  // Filtered lists for diocese & parish
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  // Flags
  dioceseDisabled = true;
  parishDisabled = true;

  // The crusade record currently edited
  selectedCrusade: Partial<Crusade> = {
    CrusadeID: undefined,
    StateID: 0,
    DioceseID: 0,
    ParishID: 0,
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

  hasSubmitted = false;

  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
    this.loadAllCrusades();
  }

  // ---------------------------
  // Load Data
  // ---------------------------
  loadAllStates(): void {
    // If back end returns { success, status, message, data: [ ... ] }
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data; // Must assign .data
      },
      error: (err) => {
        console.error('Failed to load states:', err);
        this.showError('Error loading states from server.');
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        this.dioceseList = res.data;
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
        this.showError('Error loading dioceses.');
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (res: any) => {
        this.parishList = res.data;
      },
      error: (err) => {
        console.error('Failed to load parishes:', err);
        this.showError('Error loading parishes.');
      }
    });
  }

  loadAllCrusades(): void {
    this.crusadeService.getAllCrusades().subscribe({
      next: (res: any) => {
        // res.data => array of Crusade objects
        this.crusades = res.data;
      },
      error: (err) => {
        console.error('Failed to load crusades:', err);
        this.showError('Error loading crusades from server.');
      }
    });
  }

  // ---------------------------
  // SELECT / EDIT
  // ---------------------------
  selectCrusade(c: Crusade): void {
    this.hasSubmitted = false;
    this.selectedCrusade = { ...c };

    if (c.StateID && c.StateID > 0) {
      this.onStateChange(); // filter diocese
    } else {
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    }

    if (c.DioceseID && c.DioceseID > 0) {
      this.onDioceseChange(); // filter parish
    } else {
      this.parishDisabled = true;
      this.filteredParishes = [];
    }
  }

  // ---------------------------
  // FILTER / DROPDOWN LOGIC
  // ---------------------------
  onStateChange(): void {
    if (!this.selectedCrusade.StateID || this.selectedCrusade.StateID === 0) {
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedCrusade.DioceseID = 0;
      this.selectedCrusade.ParishID = 0;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    } else {
      const chosenID = Number(this.selectedCrusade.StateID);
      this.filteredDioceses = this.dioceseList.filter(d => d.StateID === chosenID);
      if (this.filteredDioceses.length === 0) {
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.selectedCrusade.DioceseID = 0;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = [];
      } else {
        this.dioceseDisabled = false;
        this.selectedCrusade.DioceseID = 0;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = [];
        this.parishDisabled = true;
      }
    }
  }

  onDioceseChange(): void {
    if (!this.selectedCrusade.DioceseID || this.selectedCrusade.DioceseID === 0) {
      this.parishDisabled = true;
      this.selectedCrusade.ParishID = 0;
      this.filteredParishes = [];
    } else {
      const chosenDioceseID = Number(this.selectedCrusade.DioceseID);
      const temp = this.parishList.filter(p => p.DioceseID === chosenDioceseID);
      if (temp.length === 0) {
        this.parishDisabled = true;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = [];
      } else {
        this.parishDisabled = false;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = temp;
      }
    }
  }

  // ---------------------------
  // CRUD
  // ---------------------------
  addCrusade(): void {
    this.hasSubmitted = true;
    if (!this.isAllFieldsValid()) {
      this.showWarning('Some required fields are missing.');
      return;
    }
    this.crusadeService.createCrusade(this.selectedCrusade).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create crusade:', err);
        this.showError('Error creating crusade.');
      }
    });
  }

  modifyCrusade(): void {
    if (!this.selectedCrusade.CrusadeID) {
      this.showWarning('No crusade selected to modify!');
      return;
    }
    this.hasSubmitted = true;
    if (!this.isAllFieldsValid()) {
      this.showWarning('Some required fields are missing.');
      return;
    }
    const id = this.selectedCrusade.CrusadeID;
    this.crusadeService.updateCrusade(id, this.selectedCrusade).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to update crusade:', err);
        this.showError('Error updating crusade.');
      }
    });
  }

  deleteCrusade(): void {
    if (!this.selectedCrusade.CrusadeID) {
      this.showWarning('No crusade selected to delete!');
      return;
    }
    const id = this.selectedCrusade.CrusadeID;
    this.crusadeService.deleteCrusade(id).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to delete crusade:', err);
        this.showError('Error deleting crusade.');
      }
    });
  }

  cancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedCrusade = {
      CrusadeID: undefined,
      StateID: 0,
      DioceseID: 0,
      ParishID: 0,
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
    this.hasSubmitted = false;
    this.dioceseDisabled = true;
    this.parishDisabled = true;
    this.filteredDioceses = [];
    this.filteredParishes = [];
  }

  private isAllFieldsValid(): boolean {
    if (!this.selectedCrusade.StateID || this.selectedCrusade.StateID <= 0) return false;
    if (!this.selectedCrusade.DioceseID || this.selectedCrusade.DioceseID <= 0) return false;
    if (!this.selectedCrusade.ParishID || this.selectedCrusade.ParishID <= 0) return false;
    if (!this.selectedCrusade.CrusadeStartTime?.trim()) return false;
    if (!this.selectedCrusade.CrusadeEndTime?.trim()) return false;
    return true;
  }

  // ---------------------------
  // DRAG & DROP
  // ---------------------------
  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  onDragEntered(event: any) {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any) {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  getCellValue(row: Crusade, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      return row.diocese?.DioceseName || '';
    } else if (column.field === 'parishName') {
      return row.parish?.ParishName || '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  // ---------------------------
  // SNACK BAR HELPERS
  // ---------------------------
  private showWarning(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    });
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
