import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Diocese {
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
}

@Component({
  selector: 'app-diocese-maintenance',
  templateUrl: './diocese-maintenance.component.html',
  styleUrls: ['./diocese-maintenance.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class DioceseMaintenanceComponent {
  // List of Dioceses
  dioceses: Diocese[] = [
    {
      id: 1,
      name: 'Sydney Archdiocese',
      streetNo: '38',
      streetName: 'Renwick St',
      suburb: 'Leichardt',
      state: 'NSW',
      postcode: '2040',
      phone: '(02) 9390 5100',
      email: 'chancery@sydneycatholic.org',
      website: 'www.sydneycatholic.org.au'
    },
    {
      id: 2,
      name: 'Test Diocese1',
      streetNo: '11',
      streetName: 'Test St1',
      suburb: 'Testville1',
      state: 'ACT',
      postcode: '123451',
      phone: '(02) 9999 88881',
      email: 'test@test.com1',
      website: 'www.test.com1'
    },
    {
      id: 3,
      name: 'Wollongong Diocese',
      streetNo: '38',
      streetName: 'Harbour St',
      suburb: 'Wollongong',
      state: 'NSW',
      postcode: '2500',
      phone: '(02) 4222 2400',
      email: 'info@dow.org.au',
      website: 'dow.org.au'
    }
  ];

  // Track the currently selected diocese in the form
  selectedDiocese: Diocese = {
    id: 0,
    name: '',
    streetNo: '',
    streetName: '',
    suburb: '',
    state: '',
    postcode: '',
    phone: '',
    email: '',
    website: ''
  };

  selectDiocese(diocese: Diocese) {
    this.selectedDiocese = { ...diocese };
  }

  addDiocese() {
    if (this.selectedDiocese.name) {
      const newId = this.dioceses.length
        ? Math.max(...this.dioceses.map(d => d.id)) + 1
        : 1;

      this.dioceses.push({
        ...this.selectedDiocese,
        id: newId
      });
      this.resetForm();
    }
  }

  modifyDiocese() {
    if (this.selectedDiocese.id !== 0) {
      const index = this.dioceses.findIndex(d => d.id === this.selectedDiocese.id);
      if (index !== -1) {
        this.dioceses[index] = { ...this.selectedDiocese };
        this.resetForm();
      }
    }
  }

  deleteDiocese() {
    if (this.selectedDiocese.id !== 0) {
      this.dioceses = this.dioceses.filter(d => d.id !== this.selectedDiocese.id);
      this.resetForm();
    }
  }

  saveDiocese() {
    // Example: Could do some asynchronous save to an API here
    console.log('Saved diocese:', this.selectedDiocese);
    this.resetForm();
  }

  cancel() {
    this.resetForm();
  }

  private resetForm() {
    this.selectedDiocese = {
      id: 0,
      name: '',
      streetNo: '',
      streetName: '',
      suburb: '',
      state: '',
      postcode: '',
      phone: '',
      email: '',
      website: ''
    };
  }
}
