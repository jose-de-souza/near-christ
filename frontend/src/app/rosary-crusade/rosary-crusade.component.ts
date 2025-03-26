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
  // 1) Columns for the results grid
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

  // Filtered arrays for diocese & parish
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  // Flags to enable/disable diocese & parish
  dioceseDisabled = true;
  parishDisabled = true;

  // 3) Crusade array for displaying results
  crusades: Crusade[] = [];

  // 4) The crusade record currently being edited
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

  // For inline validation
  hasSubmitted = false;

  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllCrusades();
    this.loadAllDioceses();
    this.loadAllParishes();
    // Start with empty filtered arrays
    this.filteredDioceses = [];
    this.filteredParishes = [];
    // By default, no state => diocese & parish disabled
    this.dioceseDisabled = true;
    this.parishDisabled = true;
  }

  /* ------------------------------------------
     SELECT ROW => Re-enable State/Diocese/Parish
     ------------------------------------------ */
  selectCrusade(c: Crusade): void {
    this.hasSubmitted = false;
    // Copy the row
    this.selectedCrusade = { ...c };

    // 1) If c.State is not empty => run onStateChange logic
    if (c.State?.trim()) {
      // Force the logic that sets filteredDioceses & dioceseDisabled
      this.onStateChange();
      // Then set the selectedCrusade.State again (just to ensure it's correct)
      this.selectedCrusade.State = c.State;
    } else {
      // If c.State is empty => onStateChange() logic disables diocese & parish
    }

    // 2) If c.DioceseID is > 0 => run onDioceseChange logic
    if (c.DioceseID && c.DioceseID > 0) {
      this.selectedCrusade.DioceseID = c.DioceseID;
      this.onDioceseChange();
    }

    // 3) If c.ParishID is > 0 => set it
    if (c.ParishID && c.ParishID > 0) {
      this.selectedCrusade.ParishID = c.ParishID;
    }
  }

  /* ------------------------------------------
     DISABLING + FILTER LOGIC FOR STATE/ DIOCESE
     ------------------------------------------ */
  onStateChange(): void {
    if (!this.selectedCrusade.State) {
      // No state => disable diocese & parish
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedCrusade.DioceseID = 0;
      this.selectedCrusade.ParishID = 0;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    } else {
      // Filter diocese by chosen state
      const chosenState = this.selectedCrusade.State;
      this.filteredDioceses = this.dioceseList.filter(d => d.DioceseState === chosenState);

      if (this.filteredDioceses.length === 0) {
        // No diocese => disable both
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.selectedCrusade.DioceseID = 0;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = [];
      } else {
        // Enable diocese
        this.dioceseDisabled = false;
        // Clear old diocese & parish
        this.selectedCrusade.DioceseID = 0;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = [];
        // Keep parish disabled until user picks a diocese
        this.parishDisabled = true;
      }
    }
  }

  onDioceseChange(): void {
    if (!this.selectedCrusade.DioceseID || this.selectedCrusade.DioceseID === 0) {
      // No diocese => disable parish
      this.parishDisabled = true;
      this.selectedCrusade.ParishID = 0;
      this.filteredParishes = [];
    } else {
      const chosenID = Number(this.selectedCrusade.DioceseID);
      const temp = this.parishList.filter(p => p.DioceseID === chosenID);
      if (temp.length === 0) {
        // No parishes => disable
        this.parishDisabled = true;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = [];
      } else {
        // Enable parish
        this.parishDisabled = false;
        this.selectedCrusade.ParishID = 0;
        this.filteredParishes = temp;
      }
    }
  }

  /* ------------------------------------------
     DRAG & DROP
     ------------------------------------------ */
  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  onDragEntered(event: any) {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any) {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  /* ------------------------------------------
     LOADING
     ------------------------------------------ */
  loadAllCrusades(): void {
    this.crusadeService.getAllCrusades().subscribe({
      next: (data) => {
        this.crusades = data;
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load crusades:', err);
          this.showError('Fatal error loading crusades! Please contact support.');
        }
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => {
        this.dioceseList = data;
      },
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
      next: (data) => {
        this.parishList = data;
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to load parishes:', err);
          this.showError('Fatal error loading parishes! Please contact support.');
        }
      }
    });
  }

  /* ------------------------------------------
     SELECT / CRUD
     ------------------------------------------ */
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
        if (err.status !== 403) {
          console.error('Failed to create crusade:', err);
          this.showError('Fatal error creating crusade! Please contact support.');
        }
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
        if (err.status !== 403) {
          console.error('Failed to update crusade:', err);
          this.showError('Fatal error updating crusade! Please contact support.');
        }
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

  /* ------------------------------------------
     VALIDATION / UTILS
     ------------------------------------------ */
  private isAllFieldsValid(): boolean {
    // minimal checks for demonstration:
    if (!this.selectedCrusade.State?.trim()) return false;
    if (!this.selectedCrusade.DioceseID || this.selectedCrusade.DioceseID === 0) return false;
    if (!this.selectedCrusade.ParishID || this.selectedCrusade.ParishID === 0) return false;
    if (!this.selectedCrusade.CrusadeStartTime?.trim()) return false;
    if (!this.selectedCrusade.CrusadeEndTime?.trim()) return false;
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

    // Also reset the diocese & parish dropdown states
    this.dioceseDisabled = true;
    this.parishDisabled = true;
    this.filteredDioceses = [];
    this.filteredParishes = [];
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
