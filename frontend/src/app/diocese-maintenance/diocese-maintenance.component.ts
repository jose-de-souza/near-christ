import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DioceseService, Diocese } from './diocese.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { DioceseEditDialogComponent } from '../diocese-edit-dialog/diocese-edit-dialog.component';

@Component({
  selector: 'app-diocese-maintenance',
  templateUrl: './diocese-maintenance.component.html',
  styleUrls: ['./diocese-maintenance.component.scss'],
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
export class DioceseMaintenanceComponent implements OnInit {
  allDioceses: Diocese[] = [];
  dioceses: Diocese[] = [];
  allStates: State[] = [];
  filterStateID: number = 0;

  columns = [
    { header: 'Diocese Name', field: 'dioceseName' },
    { header: 'Street No', field: 'dioceseStreetNo' },
    { header: 'Street Name', field: 'dioceseStreetName' },
    { header: 'Suburb', field: 'dioceseSuburb' },
    { header: 'State(s)', field: 'associatedStateAbbreviations' },
    { header: 'Post Code', field: 'diocesePostcode' },
    { header: 'Phone', field: 'diocesePhone' },
    { header: 'Email', field: 'dioceseEmail' },
    { header: 'Website', field: 'dioceseWebsite' },
  ];

  constructor(
    private dioceseService: DioceseService,
    private stateService: StateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
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
        this.dioceses = [...this.allDioceses];
        console.log('Loaded Dioceses:', this.allDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
        this.showError('Fatal error loading dioceses! Please contact support.');
      }
    });
  }

  onFilterStateChange(): void {
    const chosenID = Number(this.filterStateID);
    if (chosenID === 0) {
      this.dioceses = [...this.allDioceses];
    } else {
      const selectedState = this.allStates.find(s => s.stateId === chosenID);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.dioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
    }
    console.log('Filtered Dioceses:', this.dioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName })));
  }

  onRowClicked(row: Diocese): void {
    this.openEditDialog(row);
  }

  addDiocese(): void {
    this.openEditDialog({} as Diocese);
  }

  openEditDialog(diocese: Diocese): void {
    const dialogRef = this.dialog.open(DioceseEditDialogComponent, {
      data: diocese,
      maxWidth: '90vw',
      height: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllDioceses();
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