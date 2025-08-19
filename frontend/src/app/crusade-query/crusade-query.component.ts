import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CrusadeService, Crusade } from '../rosary-crusade/crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';

@Component({
  standalone: true,
  selector: 'app-crusade-query',
  templateUrl: './crusade-query.component.html',
  styleUrls: ['./crusade-query.component.scss'],
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule, MatTooltipModule]
})
export class CrusadeQueryComponent implements OnInit {
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
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];
  dioceseDisabled = true;
  parishDisabled = true;
  selectedStateID = 0;
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;
  results: Crusade[] = [];

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
    this.dioceseDisabled = true;
    this.parishDisabled = true;
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

  onStateChange(): void {
    const stateId = Number(this.selectedStateID);
    if (!stateId || stateId === 0) {
      this.filteredDioceses = [];
      this.filteredParishes = [];
      this.selectedDioceseID = null;
      this.selectedParishID = null;
      this.dioceseDisabled = true;
      this.parishDisabled = true;
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.dioceseList.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      this.selectedDioceseID = null;
      this.selectedParishID = null;
      this.filteredParishes = [];
      this.parishDisabled = true;
      console.log('State Changed:', { 
        stateId, 
        stateAbbreviation: abbrev, 
        filteredDioceses: this.filteredDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName }))
      });
    }
  }

  onDioceseChange(): void {
    const dioceseId = this.selectedDioceseID != null ? Number(this.selectedDioceseID) : null;
    if (!dioceseId) {
      this.filteredParishes = [];
      this.selectedParishID = null;
      this.parishDisabled = true;
    } else {
      this.filteredParishes = this.parishList.filter(p => p.dioceseId === dioceseId);
      this.parishDisabled = this.filteredParishes.length === 0;
      this.selectedParishID = null;
      console.log('Diocese Changed:', { 
        dioceseId, 
        dioceseName: this.dioceseList.find(d => d.dioceseId === dioceseId)?.dioceseName, 
        filteredParishes: this.filteredParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName, dioceseId: p.dioceseId }))
      });
    }
  }

  searchCrusade(): void {
    const stateId = this.selectedStateID > 0 ? this.selectedStateID : undefined;
    const dioceseId = this.selectedDioceseID != null ? this.selectedDioceseID : undefined;
    const parishId = this.selectedParishID != null ? this.selectedParishID : undefined;

    this.crusadeService.searchCrusades(stateId, dioceseId, parishId).subscribe({
      next: (res: any) => {
        this.results = res.data;
        console.log('Search Results:', this.results.map(c => ({
          crusadeId: c.crusadeId,
          stateId: c.stateId,
          dioceseId: c.dioceseId,
          parishId: c.parishId,
          state: c.state,
          diocese: c.diocese,
          parish: c.parish
        })));
      },
      error: (err) => {
        console.error('Failed to search crusades =>', err);
        this.showError('Fatal error searching Crusades!');
      }
    });
  }

  getTooltip(row: Crusade, column: { header: string; field: string }): string {
    if (column.field === 'state' && !this.allStates.find(s => s.stateId === row.stateId)?.stateAbbreviation) {
      return 'This Crusade has no State registered.';
    }
    return '';
  }

  getCellValue(row: Crusade, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      const diocese = this.dioceseList.find(d => d.dioceseId === row.dioceseId);
      const dioceseName = diocese?.dioceseName || '';
      const dioceseWebsite = diocese?.dioceseWebsite || '';
      if (dioceseWebsite.trim()) {
        return `<a href="${dioceseWebsite}" target="_blank">${dioceseName}</a>`;
      } else {
        return dioceseName;
      }
    } else if (column.field === 'parishName') {
      const parish = this.parishList.find(p => p.parishId === row.parishId);
      const parishName = parish?.parishName || '';
      const parishWebsite = parish?.parishWebsite || '';
      if (parishWebsite.trim()) {
        return `<a href="${parishWebsite}" target="_blank">${parishName}</a>`;
      } else {
        return parishName;
      }
    } else if (column.field === 'state') {
      const state = this.allStates.find(s => s.stateId === row.stateId);
      return state?.stateAbbreviation || '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  getCellClass(row: Crusade, column: { header: string; field: string }): string {
    if (column.field === 'state' && !this.allStates.find(s => s.stateId === row.stateId)?.stateAbbreviation) {
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

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}