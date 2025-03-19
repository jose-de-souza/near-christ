import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { CrusadeService, Crusade } from './crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  selector: 'app-rosary-crusade',
  templateUrl: './rosary-crusade.component.html',
  styleUrls: ['./rosary-crusade.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
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
  //    All fields are now considered "required".
  selectedCrusade: Partial<Crusade> = {
    CrusadeID: undefined,
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

  // Track if user has tried to Add or Modify (for inline errors).
  hasSubmitted = false;

  // Tells the template how many 'auto' columns to create for the grid.
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private snackBar: MatSnackBar  // <-- Inject MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllCrusades();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  // -------------- DRAG & DROP --------------
  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  onDragEntered(event: any) {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any) {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  // -------------- DATA LOADING --------------
  loadAllCrusades(): void {
    this.crusadeService.getAllCrusades().subscribe({
      next: (data) => (this.crusades = data),
      error: (err) => {
        // 403 is handled by the role-based interceptor
        if (err.status !== 403) {
          console.error('Failed to load crusades:', err);
          this.showError('Fatal error loading crusades! Please contact support.');
        }
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => (this.dioceseList = data),
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load dioceses:', err);
          this.showError('Fatal error loading dioceses! Please contact support.');
        }
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => (this.parishList = data),
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load parishes:', err);
          this.showError('Fatal error loading parishes! Please contact support.');
        }
      }
    });
  }

  // -------------- SELECT A ROW --------------
  selectCrusade(c: Crusade): void {
    this.selectedCrusade = { ...c };
  }

  // -------------- CRUD --------------
  addCrusade(): void {
    this.hasSubmitted = true;

    // If any required field is missing => show warning & skip
    if (!this.isAllFieldsValid()) {
      this.showWarning('All fields are required!');
      return;
    }

    this.crusadeService.createCrusade(this.selectedCrusade).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to create crusade:', err);
          this.showError('Fatal error creating crusade! Please contact support.');
        }
      }
    });
  }

  modifyCrusade(): void {
    if (!this.selectedCrusade.CrusadeID) {
      this.showWarning('No crusade selected for update!');
      return;
    }

    this.hasSubmitted = true;

    // Also check fields before modifying
    if (!this.isAllFieldsValid()) {
      this.showWarning('All fields are required!');
      return;
    }

    const id = this.selectedCrusade.CrusadeID;
    this.crusadeService.updateCrusade(id, this.selectedCrusade).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to update crusade:', err);
          this.showError('Fatal error updating crusade! Please contact support.');
        }
      }
    });
  }

  deleteCrusade(): void {
    if (!this.selectedCrusade.CrusadeID) {
      this.showWarning('No crusade selected for deletion!');
      return;
    }
    const id = this.selectedCrusade.CrusadeID;
    this.crusadeService.deleteCrusade(id).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to delete crusade:', err);
          this.showError('Fatal error deleting crusade! Please contact support.');
        }
      }
    });
  }

  cancel(): void {
    this.resetForm();
  }

  // -------------- UTILITY --------------
  // Check if all required fields are present
  private isAllFieldsValid(): boolean {
    // DioceseID must be > 0
    if (!this.selectedCrusade.DioceseID || this.selectedCrusade.DioceseID === 0) return false;
    // ParishID must be > 0
    if (!this.selectedCrusade.ParishID || this.selectedCrusade.ParishID === 0) return false;
    // State must not be blank
    if (!this.selectedCrusade.State?.trim()) return false;

    // Time fields must not be blank
   /*  if (!this.selectedCrusade.ConfessionStartTime?.trim()) return false;
    if (!this.selectedCrusade.ConfessionEndTime?.trim()) return false;
    if (!this.selectedCrusade.MassStartTime?.trim()) return false;
    if (!this.selectedCrusade.MassEndTime?.trim()) return false; */
    if (!this.selectedCrusade.CrusadeStartTime?.trim()) return false;
    if (!this.selectedCrusade.CrusadeEndTime?.trim()) return false;

    // Contact fields must not be blank
   /*  if (!this.selectedCrusade.ContactName?.trim()) return false;
    if (!this.selectedCrusade.ContactPhone?.trim()) return false;
    if (!this.selectedCrusade.ContactEmail?.trim()) return false; */

    // Comments must not be blank
    /* if (!this.selectedCrusade.Comments?.trim()) return false; */

    return true;
  }

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
      CrusadeID: undefined,
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
    this.hasSubmitted = false;
  }

  // -------------- SNACK BAR HELPERS --------------
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
