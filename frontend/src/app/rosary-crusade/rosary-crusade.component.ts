import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrusadeService, Crusade } from './crusade.service';

// Also import DioceseService, ParishService
import { DioceseService, Diocese } from '../diocese-maintenance/diocese.service';
import { ParishService, Parish } from '../parish-maintenance/parish.service';

@Component({
  selector: 'app-rosary-crusade',
  templateUrl: './rosary-crusade.component.html',
  styleUrls: ['./rosary-crusade.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RosaryCrusadeComponent implements OnInit {

  // Table data
  crusades: Crusade[] = [];

  // For the diocese/parish dropdowns
  dioceseList: Diocese[] = [];
  parishList: Parish[] = [];

  // The crusade record currently being edited
  selectedCrusade: Partial<Crusade> = {
    DioceseID: 0,
    ParishID: 0,
    State: '',
    ConfessionStartTime: '',
    ConfessionEndTime: '',
    MassStartTime: '',
    MassEndTime: '',
    CrusadeStartTime: '',
    CrusadeEndTime: '',
    ContactName: '',
    ContactPhone: '',
    ContactEmail: '',
    Comments: ''
  };

  constructor(
    private crusadeService: CrusadeService,
    private dioceseService: DioceseService,
    private parishService: ParishService
  ) { }

  ngOnInit(): void {
    this.loadAllCrusades();
    this.loadAllDioceses();
    this.loadAllParishes();
  }

  // 1) Load all crusade records
  loadAllCrusades(): void {
    this.crusadeService.getAllCrusades().subscribe({
      next: (data) => {
        this.crusades = data;
      },
      error: (err) => {
        console.error('Failed to load crusades:', err);
      }
    });
  }

  // 2) Load Diocese list
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

  // 3) Load Parish list
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

  // Row click => populate form
  selectCrusade(c: Crusade): void {
    this.selectedCrusade = { ...c };
  }

  // Add a new crusade
  addCrusade(): void {
    this.crusadeService.createCrusade(this.selectedCrusade).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create crusade:', err);
      }
    });
  }

  // Modify existing
  modifyCrusade(): void {
    if (!this.selectedCrusade.CrusadeID) {
      console.error('No crusade selected to update!');
      return;
    }
    const id = this.selectedCrusade.CrusadeID;
    this.crusadeService.updateCrusade(id, this.selectedCrusade).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to update crusade:', err);
      }
    });
  }

  // Delete existing
  deleteCrusade(): void {
    if (!this.selectedCrusade.CrusadeID) {
      console.error('No crusade selected to delete!');
      return;
    }
    const id = this.selectedCrusade.CrusadeID;
    this.crusadeService.deleteCrusade(id).subscribe({
      next: () => {
        this.loadAllCrusades();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to delete crusade:', err);
      }
    });
  }

  // Cancel editing
  cancel(): void {
    this.resetForm();
  }

  // Track rows by CrusadeID for *ngFor
  trackByCrusadeID(index: number, item: Crusade): number {
    return item.CrusadeID;
  }

  private resetForm(): void {
    this.selectedCrusade = {
      DioceseID: 0,
      ParishID: 0,
      State: '',
      ConfessionStartTime: '',
      ConfessionEndTime: '',
      MassStartTime: '',
      MassEndTime: '',
      CrusadeStartTime: '',
      CrusadeEndTime: '',
      ContactName: '',
      ContactPhone: '',
      ContactEmail: '',
      Comments: ''
    };
  }
}
