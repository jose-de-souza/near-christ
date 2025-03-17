import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DioceseService, Diocese } from './diocese.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diocese-maintenance',
  templateUrl: './diocese-maintenance.component.html',
  styleUrls: ['./diocese-maintenance.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule ]
})
export class DioceseMaintenanceComponent {
  // The array of dioceses loaded from the backend
  dioceses: Diocese[] = [];

  // The diocese currently selected for editing in the form
  selectedDiocese: Partial<Diocese> = {
    DioceseName: '',
    DioceseStreetNo: '',
    DioceseStreetName: '',
    DioceseSuburb: '',
    DioceseState: '',
    DiocesePostcode: '',
    DiocesePhone: '',
    DioceseEmail: '',
    DioceseWebsite: ''
  };

   // States dropdown options
   states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  constructor(
    private dioceseService: DioceseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllDioceses();
  }

  // Fetch all from backend
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => {
        this.dioceses = data.map((d) => {
          // If the backend returns { DioceseID, DioceseName, ... }
          // but we want a uniform interface, map as needed:
          return {
            DioceseID: d.DioceseID, // or d.DioceseID if the backend uses that
            DioceseName: d.DioceseName,
            DioceseStreetNo: d.DioceseStreetNo,
            DioceseStreetName: d.DioceseStreetName,
            DioceseSuburb: d.DioceseSuburb,
            DioceseState: d.DioceseState,
            DiocesePostcode: d.DiocesePostcode,
            DiocesePhone: d.DiocesePhone,
            DioceseEmail: d.DioceseEmail,
            DioceseWebsite: d.DioceseWebsite
          };
        });
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
      }
    });
  }

  trackByDioceseID(index: number, item: any) {
    return item.DioceseID; // Must be unique per item
  }

  // Called when user clicks on a row in the table
  selectDiocese(diocese: Diocese): void {
    // Make a copy so editing doesn't immediately affect the table
    this.selectedDiocese = { ...diocese };
  }

  // Button: Add new diocese
  addDiocese(): void {
    // Create via backend
    this.dioceseService.createDiocese(this.selectedDiocese).subscribe({
      next: () => {
        // Reload table
        this.loadAllDioceses();
        // Clear form
        this.selectedDiocese = {};
      },
      error: (err) => {
        console.error('Failed to create diocese:', err);
      }
    });
  }

  // Button: Modify existing diocese
  modifyDiocese(): void {
    if (!this.selectedDiocese.DioceseID) {
      console.error('No diocese selected to update!');
      return;
    }
    const id = this.selectedDiocese.DioceseID;
    this.dioceseService.updateDiocese(id, this.selectedDiocese).subscribe({
      next: () => {
        this.loadAllDioceses();
        this.selectedDiocese = {};
      },
      error: (err) => {
        console.error('Failed to update diocese:', err);
      }
    });
  }

  // Button: Delete existing diocese
  deleteDiocese(): void {
    if (!this.selectedDiocese.DioceseID) {
      console.error('No diocese selected to delete!');
      return;
    }
    const id = this.selectedDiocese.DioceseID;
    this.dioceseService.deleteDiocese(id).subscribe({
      next: () => {
        this.loadAllDioceses();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to delete diocese:', err);
      }
    });
  }

  saveDiocese() {
    // Example: Could do some asynchronous save to an API here
    console.log('Saved diocese:', this.selectedDiocese);
    this.resetForm();
  }

  // Button: Cancel editing
  cancel(): void {
    this.selectedDiocese = {};
  }

  private resetForm() {
    this.selectedDiocese = {};
  }
}
