import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-crusade-query',
  templateUrl: './crusade-query.component.html',
  styleUrls: ['./crusade-query.component.scss'],
  imports: [FormsModule]
})
export class CrusadeQueryComponent {
  stateSelection: 'all' | 'specific' = 'all';
  dioceseSelection: 'all' | 'specific' = 'all';
  parishSelection: 'all' | 'specific' = 'all';

  states = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];
  dioceses = ['Sydney Archdiocese', 'Test Diocese1', 'Wollongong Diocese'];
  parishes = ['All Saints', 'All Hallows', 'Blessed Sacrament', '...'];

  selectedState = '';
  selectedDiocese = '';
  selectedParish = '';

  results: any[] = [];

  searchCrusade() {
    console.log('Searching Crusade with:', {
      stateSelection: this.stateSelection,
      selectedState: this.selectedState,
      dioceseSelection: this.dioceseSelection,
      selectedDiocese: this.selectedDiocese,
      parishSelection: this.parishSelection,
      selectedParish: this.selectedParish
    });

    // Simulate results
    this.results = [
      { crusade: 'Rosary Crusade 1', location: 'Sydney', schedule: 'Every Friday 7pm' },
      { crusade: 'Rosary Crusade 2', location: 'Wollongong', schedule: 'Weekdays 6pm' }
    ];
  }
}
