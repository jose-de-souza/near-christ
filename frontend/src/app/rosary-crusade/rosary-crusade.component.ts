import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CrusadeService, Crusade } from './crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-rosary-crusade',
  templateUrl: './rosary-crusade.component.html',
  styleUrls: ['./rosary-crusade.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ]
})
export class RosaryCrusadeComponent implements OnInit {
  columns = [
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'Parish', field: 'parishName' },
    { header: 'State', field: 'state' },
    { header: 'Confession Start', field: 'confessionStartTime' },
    { header: 'Confession End', field: 'confessionEndTime' },
    { header: 'Mass Start', field: 'massStartTime' },
    { header: 'Mass End', field: 'massEndTime' },
    { header: 'Crusade Start', field: 'crusadeStartTime' },
    { header: 'Crusade End', field: 'crusadeEndTime' },
    { header: 'Contact Name', field: 'contactName' },
    { header: 'Contact Phone', field: 'contactPhone' },
    { header: 'Contact Email', field: 'contactEmail' },
    { header: 'Comments', field: 'comments' },
  ];

  allStates: State[] = [];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];
  crusades: Crusade[] = [];
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];
  dioceseDisabled = true;
  parishDisabled = true;
  hasSubmitted = false;
  uiMode: 'view' | 'editing' = 'view';

  selectedCrusade: Partial<Crusade> = {
    crusadeId: undefined,
    stateId: 0,
    dioceseId: 0,
    parishId: 0,
    confessionStartTime: '',
    confessionEndTime: '',
    massStartTime: '',
    massEndTime: '',
    crusadeStartTime: '',
    crusadeEndTime: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    comments: ''
  };

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
    this.loadAllCrusades();
  }

  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data;
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
        this.crusades = res.data;
      },
      error: (err) => {
        console.error('Failed to load crusades:', err);
        this.showError('Error loading crusades from server.');
      }
    });
  }

  selectCrusade(c: Crusade): void {
    this.hasSubmitted = false;
    this.selectedCrusade = {
      ...c,
      stateId: Number(c.stateId),
      dioceseId: Number(c.dioceseId),
      parishId: Number(c.parishId)
    };
    this.uiMode = 'editing';
    if (this.selectedCrusade.stateId && Number(this.selectedCrusade.stateId) > 0) {
      this.onStateChange();
    } else {
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    }
    if (this.selectedCrusade.dioceseId && Number(this.selectedCrusade.dioceseId) > 0) {
      this.onDioceseChange();
    } else {
      this.parishDisabled = true;
      this.filteredParishes = [];
    }
  }

  onStateChange(): void {
    const stateId = Number(this.selectedCrusade.stateId);
    if (!stateId || stateId === 0) {
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedCrusade.dioceseId = 0;
      this.selectedCrusade.parishId = 0;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.dioceseList.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      this.selectedCrusade.dioceseId = 0;
      this.selectedCrusade.parishId = 0;
      this.filteredParishes = [];
      this.parishDisabled = true;
    }
  }

  onDioceseChange(): void {
    const dioceseId = Number(this.selectedCrusade.dioceseId);
    if (!dioceseId || dioceseId === 0) {
      this.parishDisabled = true;
      this.selectedCrusade.parishId = 0;
      this.filteredParishes = [];
    } else {
      const stateId = Number(this.selectedCrusade.stateId);
      this.filteredParishes = this.parishList.filter(p => p.dioceseId === dioceseId && (!stateId || p.state?.stateId === stateId));
      this.parishDisabled = this.filteredParishes.length === 0;
      this.selectedCrusade.parishId = 0;
    }
  }

  addCrusade(): void {
    this.hasSubmitted = true;
    if (!this.isAllFieldsValid()) {
      this.showWarning('Some required fields are missing.');
      return;
    }
    this.crusadeService.createCrusade(this.selectedCrusade).subscribe({
      next: () => {
        this.showInfo('The Crusade has been added');
        this.loadAllCrusades();
        this.resetForm();
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to create crusade:', err);
        this.showError('Error creating crusade.');
      }
    });
  }

  modifyCrusade(): void {
    if (!this.selectedCrusade.crusadeId) {
      this.showWarning('No crusade selected to modify!');
      return;
    }
    this.hasSubmitted = true;
    if (!this.isAllFieldsValid()) {
      this.showWarning('Some required fields are missing.');
      return;
    }
    const id = this.selectedCrusade.crusadeId;
    this.crusadeService.updateCrusade(id, this.selectedCrusade).subscribe({
      next: () => {
        this.showInfo('Crusade modified');
        this.loadAllCrusades();
        this.resetForm();
        this.uiMode = 'view';
      },
      error: (err) => {
        console.error('Failed to update crusade:', err);
        this.showError('Error updating crusade.');
      }
    });
  }

  deleteCrusade(): void {
    if (!this.selectedCrusade.crusadeId) {
      this.showWarning('No crusade selected to delete!');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        message: `Are you sure you want to delete this Crusade?`
      },
      panelClass: 'orange-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedCrusade.crusadeId!;
        this.crusadeService.deleteCrusade(id).subscribe({
          next: () => {
            this.loadAllCrusades();
            this.resetForm();
            this.uiMode = 'view';
          },
          error: (err) => {
            console.error('Failed to delete crusade:', err);
            this.showError('Error deleting crusade.');
          }
        });
      }
    });
  }

  cancel(): void {
    this.resetForm();
    this.uiMode = 'view';
  }

  private resetForm(): void {
    this.selectedCrusade = {
      crusadeId: undefined,
      stateId: 0,
      dioceseId: 0,
      parishId: 0,
      confessionStartTime: '',
      confessionEndTime: '',
      massStartTime: '',
      massEndTime: '',
      crusadeStartTime: '',
      crusadeEndTime: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      comments: ''
    };
    this.hasSubmitted = false;
    this.dioceseDisabled = true;
    this.parishDisabled = true;
    this.filteredDioceses = [];
    this.filteredParishes = [];
  }

  private isAllFieldsValid(): boolean {
    if (!this.selectedCrusade.stateId || Number(this.selectedCrusade.stateId) <= 0) return false;
    if (!this.selectedCrusade.dioceseId || Number(this.selectedCrusade.dioceseId) <= 0) return false;
    if (!this.selectedCrusade.parishId || Number(this.selectedCrusade.parishId) <= 0) return false;
    if (!this.selectedCrusade.crusadeStartTime?.trim()) return false;
    if (!this.selectedCrusade.crusadeEndTime?.trim()) return false;
    return true;
  }

  getCellValue(row: Crusade, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      const dName = row.diocese?.dioceseName || '';
      const dWebsite = row.diocese?.dioceseWebsite || '';
      if (dWebsite.trim()) {
        return `<a href="${dWebsite}" target="_blank">${dName}</a>`;
      } else {
        return dName;
      }
    } else if (column.field === 'parishName') {
      const pName = row.parish?.parishName || '';
      const pWebsite = row.parish?.parishWebsite || '';
      if (pWebsite.trim()) {
        return `<a href="${pWebsite}" target="_blank">${pName}</a>`;
      } else {
        return pName;
      }
    } else if (column.field === 'state') {
      return row.state?.stateAbbreviation || '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  getCellClass(row: Crusade, column: { header: string; field: string }): string {
    if (column.field === 'state' && !row.state?.stateAbbreviation) {
      return 'no-state';
    }
    return '';
  }

  trackByCrusadeID(index: number, item: Crusade): number {
    return item.crusadeId;
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

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-info']
    });
  }

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