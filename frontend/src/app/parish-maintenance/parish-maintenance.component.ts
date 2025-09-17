import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ParishService, Parish } from './parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { ParishEditDialogComponent } from '../parish-edit-dialog/parish-edit-dialog.component';

@Component({
  selector: 'app-parish-maintenance',
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss'],
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
export class ParishMaintenanceComponent implements OnInit {
  allParishes: Parish[] = [];
  parishes: any[] = [];
  allStates: State[] = [];
  allDioceses: Diocese[] = [];
  filteredDioceses: Diocese[] = [];
  filterStateID: number = 0;
  filterDioceseID: number | null = null;
  dioceseDisabled: boolean = true;

  columns = [
    { header: 'Parish Name', field: 'parishName' },
    { header: 'St No', field: 'parishStNumber' },
    { header: 'Street Name', field: 'parishStName' },
    { header: 'Suburb', field: 'parishSuburb' },
    { header: 'State', field: 'stateAbbreviation' },
    { header: 'Diocese', field: 'dioceseName' },
    { header: 'PostCode', field: 'parishPostcode' },
    { header: 'Phone', field: 'parishPhone' },
    { header: 'Email', field: 'parishEmail' },
    { header: 'Website', field: 'parishWebsite' },
  ];

  constructor(
    private parishService: ParishService,
    private dioceseService: DioceseService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData(); // Initial load for all data
  }

  // New method to load all necessary data
  loadAllData(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data || [];
        // No need to call onFilterStateChange here, as loadAllDioceses will handle it
      },
      error: (err) => {
        this.showError('Error loading states from server.');
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        this.allDioceses = res.data || [];
        // Re-apply filters after dioceses are loaded
        this.onFilterStateChange(); // This correctly updates filteredDioceses and parishes
        this.dioceseDisabled = this.filteredDioceses.length === 0; // Update based on filteredDioceses
      },
      error: (err) => {
        this.showError('Error loading dioceses.');
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (res: any) => {
        this.allParishes = res.data || [];
        // Only re-map and detect changes if filters are not applied
        // If filters are active, onFilterStateChange/onFilterDioceseChange will handle setting this.parishes
        if (this.filterStateID === 0 && this.filterDioceseID === null) {
          this.parishes = this.mapParishData(this.allParishes);
          this.cdr.detectChanges();
        } else {
            // Re-apply current filters to the newly loaded allParishes
            this.onFilterDioceseChange(); // This will use the latest allParishes data
        }
      },
      error: (err) => {
        this.showError('Fatal error loading parishes! Please contact support.');
      }
    });
  }

  private mapParishData(parishes: Parish[]): any[] {
    return parishes.map(parish => {
      const state = this.allStates.find(s => s.stateId === parish.stateId);
      const diocese = this.allDioceses.find(d => d.dioceseId === parish.dioceseId);
      return {
        ...parish,
        stateAbbreviation: state?.stateAbbreviation || '',
        dioceseName: diocese?.dioceseName || ''
      };
    });
  }

  onFilterStateChange(): void {
    const stateId = Number(this.filterStateID);
    if (stateId === 0) {
      this.filteredDioceses = [];
      this.filterDioceseID = null;
      this.dioceseDisabled = true;
      this.parishes = this.mapParishData(this.allParishes);
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseDisabled = this.filteredDioceses.length === 0;
      this.filterDioceseID = null;
      this.parishes = this.mapParishData(this.allParishes.filter(p => p.stateId === stateId));
    }
    this.cdr.detectChanges();
  }

  onFilterDioceseChange(): void {
    const stateId = Number(this.filterStateID);
    const dioceseId = this.filterDioceseID !== null ? Number(this.filterDioceseID) : null;
    let filtered = this.allParishes;
    if (stateId > 0) {
      filtered = filtered.filter(p => p.stateId === stateId);
    }
    if (dioceseId !== null) {
      filtered = filtered.filter(p => p.dioceseId === dioceseId);
    }
    this.parishes = this.mapParishData(filtered);
    this.cdr.detectChanges();
  }

  onRowClicked(row: Parish): void {
    this.openEditDialog(row);
  }

  addParish(): void {
    this.openEditDialog({} as Parish);
  }

  openEditDialog(parish: Parish): void {
    const dialogRef = this.dialog.open(ParishEditDialogComponent, {
      data: parish,
      maxWidth: '90vw',
      height: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Re-fetch all data to ensure dropdowns and table are fully refreshed
        this.loadAllData();
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