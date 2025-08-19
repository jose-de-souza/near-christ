import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AdorationService, Adoration } from '../adoration-schedule/adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';

@Component({
  standalone: true,
  selector: 'app-adoration-query',
  templateUrl: './adoration-query.component.html',
  styleUrls: ['./adoration-query.component.scss'],
  imports: [CommonModule, FormsModule, DragDropModule, MatTooltipModule]
})
export class AdorationQueryComponent implements OnInit {
  columns = [
    { header: 'Parish Name', field: 'parishName' },
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'State', field: 'state' },
    { header: 'End', field: 'adorationEnd' },
    { header: 'Type', field: 'adorationType' },
    { header: 'Day', field: 'adorationDay' },
    { header: 'Location', field: 'adorationLocation' },
    { header: 'Location Type', field: 'adorationLocationType' },
    { header: 'Start', field: 'adorationStart' },
  ];

  allStates: State[] = [];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];
  dioceseDisabled = true;
  parishDisabled = true;
  selectedStateID: number = 0;
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;
  results: Adoration[] = [];

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService
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

  searchAdoration(): void {
    const stateId = (this.selectedStateID && this.selectedStateID > 0) ? this.selectedStateID : undefined;
    const dioceseId = (this.selectedDioceseID != null) ? this.selectedDioceseID : undefined;
    const parishId = (this.selectedParishID != null) ? this.selectedParishID : undefined;

    this.adorationService.searchAdorations(stateId, dioceseId, parishId).subscribe({
      next: (res: any) => {
        this.results = res.data;
        console.log('Search Results:', this.results.map(a => ({
          adorationId: a.adorationId,
          stateId: a.stateId,
          dioceseId: a.dioceseId,
          parishId: a.parishId,
          state: a.state,
          diocese: a.diocese,
          parish: a.parish
        })));
      },
      error: (err) => {
        console.error('Failed to search adorations =>', err);
      }
    });
  }

  getTooltip(row: Adoration, column: { header: string; field: string }): string {
    if (column.field === 'state' && !this.allStates.find(s => s.stateId === row.stateId)?.stateAbbreviation) {
      return 'This Adoration has no State registered.';
    }
    return '';
  }

  getCellValue(row: Adoration, column: { header: string; field: string }): any {
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
      return (row as any)[column.field] ?? '';
    }
  }

  getCellClass(row: Adoration, column: { header: string; field: string }): string {
    if (column.field === 'state' && !this.allStates.find(s => s.stateId === row.stateId)?.stateAbbreviation) {
      return 'no-state';
    }
    return '';
  }

  trackByAdorationID(index: number, item: Adoration): number {
    return item.adorationId;
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
}