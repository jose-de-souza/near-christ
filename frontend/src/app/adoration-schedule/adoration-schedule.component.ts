import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule

@Component({
  selector: 'app-adoration-schedule',
  templateUrl: './adoration-schedule.component.html',
  styleUrls: ['./adoration-schedule.component.scss'],
  standalone: true,  // Declare the component as standalone
  imports: [FormsModule]  // Add FormsModule to imports here
})
export class AdorationScheduleComponent {
  // Initialize the selectedAdoration property
  selectedAdoration: { 
    id: number;  // Ensure id is always a number
    type: string; 
    locationType: string; 
    location: string; 
    day: string; 
    start: string; 
    end: string; 
    state: string; 
  } = {
    id: 0,  // Default value to avoid undefined
    type: '',
    locationType: '',
    location: '',
    day: '',
    start: '',
    end: '',
    state: ''
  };
  
  

  adorationTypes = ['Perpetual', 'Regular'];
  locationTypes = ['Parish Church', 'Other'];
  days = ['Sunday', 'Wednesday'];

  schedules = [
    { id: 4, type: 'Perpetual', locationType: 'Other', location: 'Adoration Chapel', day: '', start: '', end: '', state: 'NSW' },
    { id: 5, type: 'Perpetual', locationType: 'Parish Church', location: 'Blessed Sacrament 59 Bradley', day: '', start: '', end: '', state: 'NSW' },
    { id: 6, type: 'Regular', locationType: 'Parish Church', location: 'Blessed Sacrament 59 Bradley', day: 'Sunday', start: '18:00', end: '19:00', state: 'NSW' },
    { id: 7, type: 'Regular', locationType: 'Other', location: 'Adoration Chapel', day: 'Wednesday', start: '10:30', end: '11:30', state: 'NSW' }
  ];

  selectedSchedule: any = null;

  selectSchedule(schedule: any) {
    // Set selectedAdoration when selecting a schedule
    this.selectedAdoration = { ...schedule };
  } 

  addSchedule() {
    const newId = this.schedules.length > 0 ? Math.max(...this.schedules.map(s => s.id)) + 1 : 1;
  
    this.schedules.push({
      id: newId,  // Set explicitly
      type: this.selectedAdoration.type,
      locationType: this.selectedAdoration.locationType,
      location: this.selectedAdoration.location,
      day: this.selectedAdoration.day,
      start: this.selectedAdoration.start,
      end: this.selectedAdoration.end,
      state: this.selectedAdoration.state
    });
  
    this.selectedAdoration = {
      id: 0,  // Reset after adding
      type: '',
      locationType: '',
      location: '',
      day: '',
      start: '',
      end: '',
      state: ''
    };
  }
  
  modifySchedule() {
    if (this.selectedAdoration.id !== undefined) {
      const index = this.schedules.findIndex(s => s.id === this.selectedAdoration.id);
      if (index !== -1) {
        this.schedules[index] = { ...this.selectedAdoration };
      }
    }
  }
  
  deleteSchedule() {
    if (this.selectedAdoration && this.selectedAdoration.id) {
      // Filter out the schedule with the selected id
      this.schedules = this.schedules.filter(s => s.id !== this.selectedAdoration.id);
      // Reset the form after deletion
      this.resetForm();
    }
  }
  

  cancel() {
    this.resetForm();
  }

  private resetForm() {
    this.selectedAdoration = { 
      id: 0,  // Reset id value
      type: '', 
      locationType: '', 
      location: '', 
      day: '', 
      start: '', 
      end: '', 
      state: '' 
    };
  }
  
}
