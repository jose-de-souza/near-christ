import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { CrusadeService, Crusade } from '../rosary-crusade/crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';

@Component({
  standalone: true,
  selector: 'app-crusade-query',
  templateUrl: './crusade-query.component.html',
  styleUrls: ['./crusade-query.component.scss'],
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule]
})
export class CrusadeQueryComponent implements OnInit {
  // Columns for the results grid
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
    { header: 'comments', field: 'comments' },
  ];

  allStates: State[] = [];
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];

  dioceseDisabled = true;
  parishDisabled = true;

  // 0 => "All States", null => "All Dioceses/Parishes"
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

  /* -----------------------------------
     LOAD
  ----------------------------------- */
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

  /* -----------------------------------
     FILTER LOGIC
  ----------------------------------- */
  onStateChange(): void {
    if (!this.selectedStateID || this.selectedStateID === 0) {
      this.dioceseDisabled = true;
      this.parishDisabled = true;
      this.selectedDioceseID = null;
      this.selectedParishID = null;
      this.filteredDioceses = [];
      this.filteredParishes = [];
    } else {
      const chosenStateID = Number(this.selectedStateID);
      this.filteredDioceses = this.dioceseList.filter(d => d.stateID === chosenStateID);
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

  onDioceseChange(): void {
    if (this.selectedDioceseID == null) {
      this.parishDisabled = true;
      this.selectedParishID = null;
      this.filteredParishes = [];
    } else {
      const chosenDioceseID = Number(this.selectedDioceseID);
      const temp = this.parishList.filter(p => p.dioceseId === chosenDioceseID);
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

  /* -----------------------------------
     SEARCH
  ----------------------------------- */
  searchCrusade(): void {
    const stateID = this.selectedStateID > 0 ? this.selectedStateID : undefined;
    const dioceseId = this.selectedDioceseID != null ? this.selectedDioceseID : undefined;
    const parishId = this.selectedParishID != null ? this.selectedParishID : undefined;

    this.crusadeService.searchCrusades(stateID, dioceseId, parishId).subscribe({
      next: (res: any) => {
        this.results = res.data;
      },
      error: (err) => {
        console.error('Failed to search crusades =>', err);
        this.showError('Fatal error searching Crusades!');
      }
    });
  }

  /* -----------------------------------
     TABLE
  ----------------------------------- */
  getCellValue(row: Crusade, column: { header: string; field: string }): any {
    if (column.field === 'dioceseName') {
      // If diocese has a website, build <a> link
      const dName = row.diocese?.dioceseName || '';
      const dWebsite = row.diocese?.dioceseWebsite || '';
      if (dWebsite.trim()) {
        return `<a href="${dWebsite}" target="_blank">${dName}</a>`;
      } else {
        return dName;
      }
    } else if (column.field === 'parishName') {
      // If parish has a website, build <a> link
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

  /* -----------------------------------
     HELPER
  ----------------------------------- */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}
