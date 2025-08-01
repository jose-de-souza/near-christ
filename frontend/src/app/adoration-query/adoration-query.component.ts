import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

import { AdorationService, Adoration } from '../adoration-schedule/adoration.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';

@Component({
  standalone: true,
  selector: 'app-adoration-query',
  templateUrl: './adoration-query.component.html',
  styleUrls: ['./adoration-query.component.scss'],
  imports: [CommonModule, FormsModule, DragDropModule]
})
export class AdorationQueryComponent implements OnInit {
  // **Updated**: The column for state now uses { header: 'State', field: 'state' }
  columns = [
    { header: 'Parish Name', field: 'parishName' },
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'State', field: 'state' },  // Show "State" in header
    { header: 'End', field: 'adorationEnd' },
    { header: 'Type', field: 'adorationType' },
    { header: 'Day', field: 'adorationDay' },
    { header: 'Location', field: 'adorationLocation' },
    { header: 'Location Type', field: 'adorationLocationType' },
    { header: 'Start', field: 'adorationStart' },
  ];

  // Real states from the back end
  allStates: State[] = [];

  // Master arrays for diocese/parish
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // Filtered arrays for diocese & parish
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  // Flags
  dioceseDisabled = true;
  parishDisabled = true;

  // The user’s current filter selections
  // 0 => "All States", null => "All Dioceses / Parishes"
  selectedStateID: number = 0;
  selectedDioceseID: number | null = null;
  selectedParishID: number | null = null;

  // The result set from the server
  results: Adoration[] = [];

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService
  ) { }

  ngOnInit(): void {
    // Load states, diocese, parish
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();

    // Initially => no state => diocese & parish disabled
    this.dioceseDisabled = true;
    this.parishDisabled = true;
  }

  /* ---------------------------
     LOAD METHODS
  --------------------------- */
  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        // If your back end returns { success, message, data: [ ...states ] }
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
        // res.data => array of Dioceses
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

  /* ---------------------------
     STATE => Filter Dioceses
  --------------------------- */
  onStateChange(): void {
    if (!this.selectedStateID || this.selectedStateID === 0) {
      // "All States"
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedDioceseID = null;
      this.selectedParishID = null;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    } else {
      const chosen = Number(this.selectedStateID);
      this.filteredDioceses = this.dioceseList.filter(d => d.stateID === chosen);

      if (this.filteredDioceses.length === 0) {
        this.dioceseDisabled = true;
        this.parishDisabled = true;
        this.selectedDioceseID = null;
        this.selectedParishID = null;
        this.filteredParishes = [];
      } else {
        this.dioceseDisabled = false;
        this.selectedDioceseID = null;
        this.selectedParishID = null;
        this.filteredParishes = [];
        this.parishDisabled = true;
      }
    }
  }

  /* ---------------------------
     DIOCESE => Filter Parishes
  --------------------------- */
  onDioceseChange(): void {
    if (this.selectedDioceseID == null) {
      // "All Dioceses"
      this.parishDisabled = true;
      this.selectedParishID = null;
      this.filteredParishes = [];
    } else {
      const chosenID = Number(this.selectedDioceseID);
      const temp = this.parishList.filter(p => p.dioceseID === chosenID);
      if (temp.length === 0) {
        this.parishDisabled = true;
        this.selectedParishID = null;
        this.filteredParishes = [];
      } else {
        this.parishDisabled = false;
        this.selectedParishID = null;
        this.filteredParishes = temp;
      }
    }
  }

  /* ---------------------------
     SEARCH
  --------------------------- */
  searchAdoration(): void {
    // Convert 0 => undefined for state, null => undefined for diocese/parish
    const stateID = (this.selectedStateID && this.selectedStateID > 0) ? this.selectedStateID : undefined;
    const dioceseID = (this.selectedDioceseID != null) ? this.selectedDioceseID : undefined;
    const parishID = (this.selectedParishID != null) ? this.selectedParishID : undefined;

    this.adorationService.searchAdorations(stateID, dioceseID, parishID).subscribe({
      next: (res: any) => {
        // Usually {success, status, message, data: [... adorations ...]}
        this.results = res.data;
      },
      error: (err) => {
        console.error('Failed to search adorations =>', err);
      }
    });
  }

  /* ---------------------------
     TABLE HELPER
  --------------------------- */
  getCellValue(row: Adoration, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      // If the diocese has a website, make name clickable
      const dioceseName = row.diocese?.dioceseName || '';
      const dioceseWebsite = row.diocese?.dioceseWebsite || '';
      if (dioceseWebsite.trim()) {
        return `<a href="${dioceseWebsite}" target="_blank">${dioceseName}</a>`;
      } else {
        return dioceseName;
      }
    } else if (column.field === 'parishName') {
      // If the parish has a website, make name clickable
      const parishName = row.parish?.parishName || '';
      const parishWebsite = row.parish?.parishWebsite || '';
      if (parishWebsite.trim()) {
        return `<a href="${parishWebsite}" target="_blank">${parishName}</a>`;
      } else {
        return parishName;
      }
    } else if (column.field === 'state') {
      // We changed to "State" => row.state?.stateAbbreviation
      return row.state?.stateAbbreviation || '';
    } else {
      // e.g. adorationEnd, adorationType, etc.
      return (row as any)[column.field] ?? '';
    }
  }

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
}
