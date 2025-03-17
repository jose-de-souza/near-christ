import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Adoration, AdorationService } from './adoration.service';
// NEW: We'll assume  have DioceseService, ParishService, etc.
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  selector: 'app-adoration-schedule',
  templateUrl: './adoration-schedule.component.html',
  styleUrls: ['./adoration-schedule.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AdorationScheduleComponent implements OnInit {

  // The array that backs *ngFor="let schedule of schedules"
  schedules: Adoration[] = [];

  // Now we store a list of all Dioceses and Parishes for the name-based dropdown
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // States array for the dropdown options
  states: string[] = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];

  // The record currently selected for editing
  selectedAdoration: Partial<Adoration> = {
    AdorationID: undefined,
    DioceseID: 0,
    ParishID: 0,
    State: '',
    AdorationType: '',
    AdorationLocation: '',
    AdorationLocationType: '',
    AdorationDay: '',
    AdorationStart: '',
    AdorationEnd: ''
  };

  constructor(
    private adorationService: AdorationService,
    private dioceseService: DioceseService,   // so we can fetch Dioceses
    private parishService: ParishService      // so we can fetch Parishes
  ) { }

  ngOnInit(): void {
    // 1) Load existing Adoration records (with .diocese and .parish objects)
    this.loadAllAdorations();
    // 2) Also load Diocese/Parish arrays so user can pick them by name
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  // Fetch all Adoration records from the backend
  loadAllAdorations(): void {
    this.adorationService.getAllAdorations().subscribe({
      next: (data) => {
        // If backend returns relationships:
        // each Adoration might look like: 
        // {
        //   "AdorationID":4, "DioceseID":1, "ParishID":6, ...,
        //   "diocese":{"DioceseID":1,"DioceseName":"Sydney Archdiocese",...},
        //   "parish":{"ParishID":6,"ParishName":"All Saints",...}
        // }
        this.schedules = data;
      },
      error: (err) => {
        console.error('Failed to load adorations:', err);
      }
    });
  }

  // (NEW) Fetch all Dioceses for the name-based dropdown
  loadAllDioceses(): void {
    this.dioceseService.getAllDioceses().subscribe({
      next: (data) => {
        this.dioceseList = data;
      },
      error: (err) => {
        console.error('Failed to load dioceses:', err);
      }
    });
  }

  // (NEW) Fetch all Parishes for the name-based dropdown
  loadAllParishes(): void {
    this.parishService.getAllParishes().subscribe({
      next: (data) => {
        this.parishList = data;
      },
      error: (err) => {
        console.error('Failed to load parishes:', err);
      }
    });
  }

  // Called when user clicks on a row in the table
  selectSchedule(schedule: Adoration): void {
    // Copy so editing doesn't affect the table immediately
    this.selectedAdoration = { ...schedule };
  }

  // Button: Add new schedule
  addSchedule(): void {
    this.adorationService.createAdoration(this.selectedAdoration).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create adoration:', err);
      }
    });
  }

  // Button: Modify existing schedule
  modifySchedule(): void {
    if (!this.selectedAdoration.AdorationID) {
      console.error('No adoration selected to update!');
      return;
    }
    const id = this.selectedAdoration.AdorationID;
    this.adorationService.updateAdoration(id, this.selectedAdoration).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to update adoration:', err);
      }
    });
  }

  // Button: Delete existing schedule
  deleteSchedule(): void {
    if (!this.selectedAdoration.AdorationID) {
      console.error('No adoration selected to delete!');
      return;
    }
    const id = this.selectedAdoration.AdorationID;
    this.adorationService.deleteAdoration(id).subscribe({
      next: () => {
        this.loadAllAdorations();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to delete adoration:', err);
      }
    });
  }

  // Button: Cancel editing
  cancel(): void {
    this.resetForm();
  }

  // Tells *ngFor how to track each row by unique AdorationID
  trackByAdorationID(index: number, item: Adoration): number {
    return item.AdorationID;
  }

  private resetForm(): void {
    // Re-initialize only the fields from the template
    this.selectedAdoration = {
      AdorationID: undefined,
      DioceseID: 0,
      ParishID: 0,
      State: '',
      AdorationType: '',
      AdorationLocation: '',
      AdorationLocationType: '',
      AdorationDay: '',
      AdorationStart: '',
      AdorationEnd: ''
    };
  }
}
