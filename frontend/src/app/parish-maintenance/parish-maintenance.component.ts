import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ParishService, Parish } from './parish.service';

@Component({
  selector: 'app-parish-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss'],
})
export class ParishMaintenanceComponent implements OnInit {
  // The array of parishes loaded from the backend
  parishes: Parish[] = [];

  // Predefined states for the dropdown
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // The parish currently selected for editing in the form
  selectedParish: Partial<Parish> = {
    ParishName: '',
    ParishStNumber: '',
    ParishStName: '',
    ParishSuburb: '',
    ParishState: '',
    ParishPostcode: '',
    ParishPhone: '',
    ParishEmail: '',
    ParishWebsite: ''
  };

  constructor(
    private parishService: ParishService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllParishes();
  }

  // Fetch all from backend
  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => {
        // If the backend returns { ParishID, ParishName, ... }
        //  can map them directly or transform if needed.
        this.parishes = data.map((p) => ({
          ParishID: p.ParishID,
          ParishName: p.ParishName,
          ParishStNumber: p.ParishStNumber,
          ParishStName: p.ParishStName,
          ParishSuburb: p.ParishSuburb,
          ParishState: p.ParishState,
          ParishPostcode: p.ParishPostcode,
          ParishPhone: p.ParishPhone,
          ParishEmail: p.ParishEmail,
          ParishWebsite: p.ParishWebsite
        }));
      },
      error: (err) => {
        console.error('Failed to load parishes:', err);
      }
    });
  }

  // For *ngFor trackBy
  trackByParishID(index: number, item: Parish) {
    return item.ParishID;
  }

  // Called when user clicks on a row in the table
  selectParish(parish: Parish): void {
    // Make a copy so editing doesn't immediately affect the table
    this.selectedParish = { ...parish };
  }

  // Button: Add new parish
  addParish(): void {
    this.parishService.createParish(this.selectedParish).subscribe({
      next: () => {
        // Reload table
        this.loadAllParishes();
        // Clear form
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create parish:', err);
      }
    });
  }

  // Button: Modify existing parish
  modifyParish(): void {
    if (!this.selectedParish.ParishID) {
      console.error('No parish selected to update!');
      return;
    }
    const id = this.selectedParish.ParishID;
    this.parishService.updateParish(id, this.selectedParish).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to update parish:', err);
      }
    });
  }

  // Button: Delete existing parish
  deleteParish(): void {
    if (!this.selectedParish.ParishID) {
      console.error('No parish selected to delete!');
      return;
    }
    const id = this.selectedParish.ParishID;
    this.parishService.deleteParish(id).subscribe({
      next: () => {
        this.loadAllParishes();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to delete parish:', err);
      }
    });
  }

  // Button: Cancel
  cancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedParish = {};
  }
}
