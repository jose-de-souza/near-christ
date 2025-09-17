import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DioceseService, Diocese } from './diocese.service';
import { StateService, State } from '../state.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { DioceseEditDialogComponent } from '../diocese-edit-dialog/diocese-edit-dialog.component';
import { forkJoin } from 'rxjs';

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
  private isRestoring: boolean = false;

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
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData(0);
  }

  private loadAllData(
    restoreStateID: number
  ): void {
    forkJoin({
      states: this.stateService.getAllStates(),
      dioceses: this.dioceseService.getAllDioceses()
  }).subscribe({
      next: ({ states, dioceses }) => {
        this.allStates = this.getData<State>(states);
        this.allDioceses = this.getData<Diocese>(dioceses);

        console.log('loadAllData:', {
          states: this.allStates.length,
          dioceses: this.allDioceses.length,
          restoreStateID
        });

        this.filterStateID = restoreStateID;

        this.reapplyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showError('Error loading data from server.');
        this.allStates = [];
        this.allDioceses = [];
        this.dioceses = [];
        this.cdr.detectChanges();
      }
    });
  }

  private getData<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    return Array.isArray(res.data) ? res.data : [];
  }

  private reapplyFilters(): void {
    const savedStateID = Number(this.filterStateID);

    console.log('reapplyFilters start:', {
      savedStateID,
      allDiocesesLength: this.allDioceses.length
    });

    this.isRestoring = true;
    this.filterStateID = savedStateID;
    this.onFilterStateChange();
    this.isRestoring = false;

    console.log('reapplyFilters end:', {
      filterStateID: this.filterStateID,
      diocesesLength: this.dioceses.length
    });

    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onFilterStateChange(): void {
    const stateId = Number(this.filterStateID);
    if (!Array.isArray(this.allDioceses)) {
      this.dioceses = [];
    }
    if (stateId === 0) {
      this.dioceses = [...this.allDioceses];
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.dioceses = this.allDioceses.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
    }
    console.log('onFilterStateChange:', {
      stateId,
      diocesesLength: this.dioceses.length
    });
    this.cdr.detectChanges();
  }

  onRowClicked(row: Diocese): void {
    console.log('Row clicked:', row);
    this.openEditDialog(row);
  }

  addDiocese(): void {
    this.openEditDialog({} as Diocese);
  }

  openEditDialog(diocese: Diocese): void {
    try {
      const currentFilters = {
        stateId: this.filterStateID
      };

      const dialogRef = this.dialog.open(DioceseEditDialogComponent, {
        data: diocese,
        maxWidth: '90vw',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          setTimeout(() => {
            this.loadAllData(
              currentFilters.stateId
            );
          }, 500);
        }
      });
    } catch (err) {
      this.showError('Error opening edit dialog. Please try again.');
    }
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