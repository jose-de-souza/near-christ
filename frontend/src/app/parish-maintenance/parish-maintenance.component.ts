import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ParishService, Parish } from './parish.service';
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { StateService, State } from '../state.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-parish-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss']
})
export class ParishMaintenanceComponent implements OnInit {
  allParishes: Parish[] = [];
  parishes: Parish[] = [];
  hasSubmitted = false;
  allStates: State[] = [];
  stateDropdownDisabled: boolean = true;

  selectedParish: Partial<Parish> = {
    parishId: undefined,
    parishName: '',
    parishStNumber: '',
    parishStName: '',
    parishSuburb: '',
    stateId: 0,
    dioceseId: 0,
    parishPostcode: '',
    parishPhone: '',
    parishEmail: '',
    parishWebsite: ''
  };

  columns = [
    { header: 'Parish Name', field: 'parishName' },
    { header: 'St No', field: 'parishStNumber' },
    { header: 'Street Name', field: 'parishStName' },
    { header: 'Suburb', field: 'parishSuburb' },
    { header: 'State', field: 'state' },
    { header: 'Diocese', field: 'diocese' },
    { header: 'PostCode', field: 'parishPostcode' },
    { header: 'Phone', field: 'parishPhone' },
    { header: 'Email', field: 'parishEmail' },
    { header: 'Website', field: 'parishWebsite' }
  ];

  dioceseList: Diocese[] = [];
  filteredDiocesesForFilter: Diocese[] = [];
  filterStateID: number = 0;
  filterDioceseID: number = 0;
  dioceseFilterDisabled: boolean = true;
  locationDioceses: Diocese[] = [];
  locationDioceseDisabled: boolean = true;
  uiMode: 'view' | 'editing' = 'view';

  constructor(
    private parishService: ParishService,
    private dioceseService: DioceseService,
    private stateService: StateService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAllStates();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  loadAllStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (res: any) => {
        this.allStates = res.data;
        this.stateDropdownDisabled = this.allStates.length === 0;
      },
      error: (err: any) => {
        console.error('Failed to load states:', err);
        this.showError('Could not load states from server.');
        this.stateDropdownDisabled = true;
      }
    });
  }

  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (res: any) => {
        this.dioceseList = res.data;
        this.locationDioceses = res.data;
        this.locationDioceseDisabled = this.dioceseList.length === 0;
      },
      error: (err: any) => {
        console.error('Failed to load dioceses:', err);
        this.showError('Could not load dioceses from server.');
        this.locationDioceseDisabled = true;
      }
    });
  }

  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (res: any) => {
        this.allParishes = res.data;
        this.parishes = res.data;
        this.applyParishFilter();
      },
      error: (err: any) => {
        console.error('Failed to load parishes:', err);
        this.showError('Fatal error loading parishes!');
      }
    });
  }

  onLocationStateChange(): void {
    this.locationDioceses = this.dioceseList;
    this.locationDioceseDisabled = this.dioceseList.length === 0;
    console.log('Location State Changed:', { 
      stateId: this.selectedParish.stateId, 
      locationDioceses: this.locationDioceses.map(d => ({ dioceseId: d.dioceseId, dioceseName: d.dioceseName }))
    });
  }

  selectParish(parish: Parish): void {
    this.selectedParish = {
      parishId: parish.parishId,
      parishName: parish.parishName,
      parishStNumber: parish.parishStNumber,
      parishStName: parish.parishStName,
      parishSuburb: parish.parishSuburb,
      parishPostcode: parish.parishPostcode,
      parishPhone: parish.parishPhone,
      parishEmail: parish.parishEmail,
      parishWebsite: parish.parishWebsite,
      stateId: parish.stateId,
      dioceseId: parish.dioceseId
    };
    this.hasSubmitted = false;
    this.uiMode = 'editing';
    this.onLocationStateChange();
    console.log('Selected Parish:', this.selectedParish);
  }

  isFormValid(): boolean {
    if (!this.selectedParish.parishName?.trim()) return false;
    if (!this.selectedParish.stateId || this.selectedParish.stateId <= 0) return false;
    if (!this.selectedParish.dioceseId || this.selectedParish.dioceseId <= 0) return false;
    return true;
  }

  addParish(): void {
    this.hasSubmitted = true;
    if (!this.isFormValid()) {
      this.showWarning('Parish Name, State, and Diocese are required!');
      return;
    }
    const parishToCreate = {
      parishName: this.selectedParish.parishName,
      parishStNumber: this.selectedParish.parishStNumber,
      parishStName: this.selectedParish.parishStName,
      parishSuburb: this.selectedParish.parishSuburb,
      parishPostcode: this.selectedParish.parishPostcode,
      parishPhone: this.selectedParish.parishPhone,
      parishEmail: this.selectedParish.parishEmail,
      parishWebsite: this.selectedParish.parishWebsite,
      stateId: this.selectedParish.stateId,
      dioceseId: this.selectedParish.dioceseId
    };
    this.parishService.createParish(parishToCreate).subscribe({
      next: () => {
        this.showInfo(`${this.selectedParish.parishName} has been added`);
        this.loadAllParishes();
        this.resetForm();
        this.uiMode = 'view';
      },
      error: (err: any) => {
        console.error('Failed to create parish:', err);
        this.showError('Error creating parish: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  modifyParish(): void {
    if (!this.selectedParish.parishId) {
      this.showWarning('No parish selected to update!');
      return;
    }
    this.hasSubmitted = true;
    if (!this.isFormValid()) {
      this.showWarning('Parish Name, State, and Diocese are required!');
      return;
    }
    const id = this.selectedParish.parishId;
    const parishToUpdate = {
      parishName: this.selectedParish.parishName,
      parishStNumber: this.selectedParish.parishStNumber,
      parishStName: this.selectedParish.parishStName,
      parishSuburb: this.selectedParish.parishSuburb,
      parishPostcode: this.selectedParish.parishPostcode,
      parishPhone: this.selectedParish.parishPhone,
      parishEmail: this.selectedParish.parishEmail,
      parishWebsite: this.selectedParish.parishWebsite,
      stateId: this.selectedParish.stateId,
      dioceseId: this.selectedParish.dioceseId
    };
    console.log('Updating Parish:', parishToUpdate);
    this.parishService.updateParish(id, parishToUpdate).subscribe({
      next: () => {
        this.showInfo(`${this.selectedParish.parishName} modified`);
        this.loadAllParishes();
        this.resetForm();
        this.uiMode = 'view';
      },
      error: (err: any) => {
        console.error('Failed to update parish:', err);
        this.showError('Error updating parish: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  deleteParish(): void {
    if (!this.selectedParish.parishId) {
      this.showWarning('No parish selected to delete!');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        message: `Are you sure you wish to delete parish "${this.selectedParish.parishName}"?`
      },
      panelClass: 'orange-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedParish.parishId!;
        this.parishService.deleteParish(id).subscribe({
          next: () => {
            this.showInfo('Parish deleted successfully');
            this.loadAllParishes();
            this.resetForm();
            this.uiMode = 'view';
          },
          error: (err: any) => {
            console.error('Failed to delete parish:', err);
            this.showError('Error deleting parish: ' + (err.error?.message || 'Unknown error'));
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
    this.selectedParish = {
      parishId: undefined,
      parishName: '',
      parishStNumber: '',
      parishStName: '',
      parishSuburb: '',
      stateId: 0,
      dioceseId: 0,
      parishPostcode: '',
      parishPhone: '',
      parishEmail: '',
      parishWebsite: ''
    };
    this.hasSubmitted = false;
    this.onLocationStateChange();
  }

  onFilterStateChange(): void {
    const stateId = Number(this.filterStateID);
    if (!stateId) {
      this.filteredDiocesesForFilter = this.dioceseList;
      this.filterDioceseID = 0;
      this.dioceseFilterDisabled = false;
      this.parishes = this.allParishes;
    } else {
      const selectedState = this.allStates.find(s => s.stateId === stateId);
      const abbrev = selectedState?.stateAbbreviation || '';
      this.filteredDiocesesForFilter = this.dioceseList.filter(d => d.associatedStateAbbreviations?.includes(abbrev) || false);
      this.dioceseFilterDisabled = this.filteredDiocesesForFilter.length === 0;
      this.applyParishFilter();
    }
  }

  onFilterDioceseChange(): void {
    this.applyParishFilter();
  }

  applyParishFilter(): void {
    const stateId = Number(this.filterStateID);
    const dioceseId = Number(this.filterDioceseID);
    let filtered = this.allParishes;
    if (stateId > 0) {
      filtered = filtered.filter(p => p.stateId === stateId);
    }
    if (dioceseId > 0) {
      filtered = filtered.filter(p => p.dioceseId === dioceseId);
    }
    this.parishes = filtered;
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

  getCellValue(row: Parish, column: { header: string; field: string }): any {
    if (column.field === 'state') {
      return row.state?.stateAbbreviation || '';
    } else if (column.field === 'diocese') {
      return row.diocese?.dioceseName || '';
    } else {
      return (row as any)[column.field] || '';
    }
  }

  trackByParishID(index: number, item: Parish): number {
    return item.parishId;
  }

  trackByParishColumn(index: number, item: any): string {
    return item.field;
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