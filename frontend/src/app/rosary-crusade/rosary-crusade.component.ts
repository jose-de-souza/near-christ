import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CrusadeService, Crusade } from './crusade.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { RosaryCrusadeEditDialogComponent } from '../rosary-crusade-edit-dialog/rosary-crusade-edit-dialog.component';

@Component({
  selector: 'app-rosary-crusade',
  templateUrl: './rosary-crusade.component.html',
  styleUrls: ['./rosary-crusade.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    DataTableComponent
  ]
})
export class RosaryCrusadeComponent implements OnInit {
  allCrusades: Crusade[] = [];
  crusades: any[] = [];
  allStates: State[] = [];
  allDioceses: Diocese[] = [];
  allParishes: Parish[] = [];
  filteredDioceses: Diocese[] = [];
  filteredParishes: Parish[] = [];
  filterStateID: number = 0;
  filterDioceseID: number | null = null;
  filterParishID: number | null = null;
  dioceseDisabled: boolean = true;
  parishDisabled: boolean = true;

  columns = [
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'Parish', field: 'parishName' },
    { header: 'State', field: 'stateAbbreviation' },
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

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
    this.loadAllCrusades();
  }

  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data || [];
        console.log('Loaded States:', this.allStates.map(s => ({ stateId: s.stateId, stateAbbreviation: s.stateAbbreviation })));
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
        this.allDioceses = res.data || [];
        this.filteredDioceses = [];
        this.dioceseDisabled = true;
        console.log('Loaded Dioceses:', this.allDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
        this.onFilterStateChange();
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
        this.allParishes = res.data || [];
        this.filteredParishes = [];
        this.parishDisabled = true;
        console.log('Loaded Parishes:', this.allParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName })));
        this.onFilterDioceseChange();
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
        this.allCrusades = res.data || [];
        this.crusades = this.mapCrusadeData(this.allCrusades);
        console.log('Loaded Crusades:', this.crusades.map(c => ({
          crusadeId: c.crusadeId,
          stateAbbreviation: c.stateAbbreviation,
          dioceseName: c.dioceseName,
          parishName: c.parishName
        })));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load crusades:', err);
        this.showError('Fatal error loading crusades! Please contact support.');
      }
    });
  }

  private mapCrusadeData(crusades: Crusade[]): any[] {
    return crusades.map(crusade => {
      const state = this.allStates.find(s => s.stateId === crusade.stateId);
      const diocese = this.allDioceses.find(d => d.dioceseId === crusade.dioceseId);
      const parish = this.allParishes.find(p => p.parishId === crusade.parishId);
      const dioceseName = diocese?.dioceseName || '';
      const parishName = parish?.parishName || '';
      return {
        ...crusade,
        stateAbbreviation: state?.stateAbbreviation || '',
        dioceseName: diocese?.dioceseWebsite ? `<a href="${diocese.dioceseWebsite}" target="_blank">${dioceseName}</a>` : dioceseName,
        parishName: parish?.parishWebsite ? `<a href="${parish.parishWebsite}" target="_blank">${parishName}</a>` : parishName
      };
    });
  }

  onFilterStateChange(): void {
    const stateId = Number(this.filterStateID);
    if (stateId === 0) {
      this.filteredDioceses = [];
      this.filterDioceseID = null;
      this.dioceseDisabled = true;
      this.filteredParishes = [];
      this.filterParishID = null;
      this.parishDisabled = true;
      this.crusades = this.mapCrusadeData(this.allCrusades);
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      this.filterDioceseID = null;
      this.filteredParishes = [];
      this.filterParishID = null;
      this.parishDisabled = true;
      this.crusades = this.mapCrusadeData(this.allCrusades.filter(c => c.stateId === stateId));
    }
    console.log('Filtered Dioceses:', this.filteredDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
    this.cdr.detectChanges();
  }

  onFilterDioceseChange(): void {
    const stateId = Number(this.filterStateID);
    const dioceseId = this.filterDioceseID !== null ? Number(this.filterDioceseID) : null;
    if (dioceseId === null) {
      this.filteredParishes = [];
      this.filterParishID = null;
      this.parishDisabled = true;
      this.crusades = this.mapCrusadeData(
        this.allCrusades.filter(c => !stateId || c.stateId === stateId)
      );
    } else {
      this.filteredParishes = this.allParishes.filter(p => p.dioceseId === dioceseId);
      this.parishDisabled = this.filteredParishes.length === 0;
      this.filterParishID = null;
      this.crusades = this.mapCrusadeData(
        this.allCrusades.filter(c => c.dioceseId === dioceseId && (!stateId || c.stateId === stateId))
      );
    }
    console.log('Filtered Parishes:', this.filteredParishes.map(p => ({ parishId: p.parishId, parishName: p.parishName })));
    this.cdr.detectChanges();
  }

  onFilterParishChange(): void {
    const stateId = Number(this.filterStateID);
    const dioceseId = this.filterDioceseID !== null ? Number(this.filterDioceseID) : null;
    const parishId = this.filterParishID !== null ? Number(this.filterParishID) : null;
    let filtered = this.allCrusades;
    if (stateId > 0) {
      filtered = filtered.filter(c => c.stateId === stateId);
    }
    if (dioceseId !== null) {
      filtered = filtered.filter(c => c.dioceseId === dioceseId);
    }
    if (parishId !== null) {
      filtered = filtered.filter(c => c.parishId === parishId);
    }
    this.crusades = this.mapCrusadeData(filtered);
    console.log('Filtered Crusades:', this.crusades.map(c => ({
      crusadeId: c.crusadeId,
      stateAbbreviation: c.stateAbbreviation,
      dioceseName: c.dioceseName,
      parishName: c.parishName
    })));
    this.cdr.detectChanges();
  }

  onRowClicked(row: Crusade): void {
    this.openEditDialog(row);
  }

  addCrusade(): void {
    this.openEditDialog({} as Crusade);
  }

  openEditDialog(crusade: Crusade): void {
    const dialogRef = this.dialog.open(RosaryCrusadeEditDialogComponent, {
      data: crusade,
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllCrusades();
      }
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