import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface RosaryCrusade {
  id: number;
  confessionStart: string;
  confessionEnd: string;
  massStart: string;
  massEnd: string;
  crusadeStart: string;
  crusadeEnd: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  observations: string;
}

@Component({
  standalone: true,
  selector: 'app-rosary-crusade',
  templateUrl: './rosary-crusade.component.html',
  styleUrls: ['./rosary-crusade.component.scss'],
  imports: [FormsModule]
})
export class RosaryCrusadeComponent {
  crusades: RosaryCrusade[] = [
    {
      id: 1,
      confessionStart: '09:00',
      confessionEnd: '09:30',
      massStart: '10:00',
      massEnd: '11:00',
      crusadeStart: '11:15',
      crusadeEnd: '12:00',
      contactName: 'John Doe',
      contactPhone: '555-1234',
      contactEmail: 'john@example.com',
      observations: 'First Sunday of the month'
    },
    {
      id: 2,
      confessionStart: '08:30',
      confessionEnd: '09:00',
      massStart: '09:15',
      massEnd: '10:00',
      crusadeStart: '10:15',
      crusadeEnd: '11:00',
      contactName: 'Jane Smith',
      contactPhone: '555-5678',
      contactEmail: 'jane@example.com',
      observations: 'Weekday schedule'
    }
  ];

  selectedCrusade: RosaryCrusade = {
    id: 0,
    confessionStart: '',
    confessionEnd: '',
    massStart: '',
    massEnd: '',
    crusadeStart: '',
    crusadeEnd: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    observations: ''
  };

  selectCrusade(crusade: RosaryCrusade) {
    this.selectedCrusade = { ...crusade };
  }

  addCrusade() {
    const newId = this.crusades.length
      ? Math.max(...this.crusades.map(c => c.id)) + 1
      : 1;

    this.crusades.push({ ...this.selectedCrusade, id: newId });
    this.resetForm();
  }

  modifyCrusade() {
    if (this.selectedCrusade.id !== 0) {
      const index = this.crusades.findIndex(c => c.id === this.selectedCrusade.id);
      if (index !== -1) {
        this.crusades[index] = { ...this.selectedCrusade };
      }
      this.resetForm();
    }
  }

  deleteCrusade() {
    if (this.selectedCrusade.id !== 0) {
      this.crusades = this.crusades.filter(c => c.id !== this.selectedCrusade.id);
      this.resetForm();
    }
  }

  saveCrusade() {
    // Example of a 'Save' operation if you have an API or want to finalize changes
    console.log('Saved crusade data:', this.selectedCrusade);
    this.resetForm();
  }

  cancel() {
    this.resetForm();
  }

  private resetForm() {
    this.selectedCrusade = {
      id: 0,
      confessionStart: '',
      confessionEnd: '',
      massStart: '',
      massEnd: '',
      crusadeStart: '',
      crusadeEnd: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      observations: ''
    };
  }
}
