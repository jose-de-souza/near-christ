import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Parish {
  id: number;
  name: string;
  streetNo: string;
  streetName: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
  website: string;
  dioceseId: string; // Link to your Diocese
}

@Component({
  standalone: true,
  selector: 'app-parish-maintenance',
  templateUrl: './parish-maintenance.component.html',
  styleUrls: ['./parish-maintenance.component.scss'],
  imports: [FormsModule]
})
export class ParishMaintenanceComponent {
  parishes: Parish[] = [
    {
      id: 1,
      name: 'All Hallows',
      streetNo: '2',
      streetName: 'Hallow St',
      suburb: 'Five Dock',
      state: 'NSW',
      postcode: '20461',
      phone: '02 9713 5172',
      email: 'admin@allhallows.org.au',
      website: 'allhallows.org.au',
      dioceseId: '1'
    },
    {
      id: 2,
      name: 'All Saints',
      streetNo: '48',
      streetName: 'George St',
      suburb: 'Liverpool',
      state: 'NSW',
      postcode: '2170',
      phone: '02 9573 6500',
      email: 'info@cpasl.org.au',
      website: 'cpasl.org.au',
      dioceseId: '1'
    },
    // ... add more sample data as needed ...
  ];

  selectedParish: Parish = {
    id: 0,
    name: '',
    streetNo: '',
    streetName: '',
    suburb: '',
    state: '',
    postcode: '',
    phone: '',
    email: '',
    website: '',
    dioceseId: ''
  };

  selectParish(parish: Parish) {
    this.selectedParish = { ...parish };
  }

  addParish() {
    if (this.selectedParish.name) {
      const newId = this.parishes.length
        ? Math.max(...this.parishes.map(p => p.id)) + 1
        : 1;

      this.parishes.push({
        ...this.selectedParish,
        id: newId
      });
      this.resetForm();
    }
  }

  modifyParish() {
    if (this.selectedParish.id !== 0) {
      const index = this.parishes.findIndex(p => p.id === this.selectedParish.id);
      if (index !== -1) {
        this.parishes[index] = { ...this.selectedParish };
        this.resetForm();
      }
    }
  }

  deleteParish() {
    if (this.selectedParish.id !== 0) {
      this.parishes = this.parishes.filter(p => p.id !== this.selectedParish.id);
      this.resetForm();
    }
  }

  cancel() {
    this.resetForm();
  }

  private resetForm() {
    this.selectedParish = {
      id: 0,
      name: '',
      streetNo: '',
      streetName: '',
      suburb: '',
      state: '',
      postcode: '',
      phone: '',
      email: '',
      website: '',
      dioceseId: ''
    };
  }
}
