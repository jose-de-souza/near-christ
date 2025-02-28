import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-adoration-query',
  templateUrl: './adoration-query.component.html',
  styleUrls: ['./adoration-query.component.scss'],
  imports: [FormsModule]
})
export class AdorationQueryComponent {
  // Example radio selections
  stateSelection: 'all' | 'specific' = 'all';
  dioceseSelection: 'all' | 'specific' = 'all';
  parishSelection: 'all' | 'specific' = 'all';

  // Example dropdown lists
  states = ['NSW', 'ACT', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT'];
  dioceses = ['Sydney Archdiocese', 'Test Diocese1', 'Wollongong Diocese'];
  parishes = ['All Saints', 'All Hallows', 'Blessed Sacrament', '...'];

  // Example selected dropdown values
  selectedState = '';
  selectedDiocese = '';
  selectedParish = '';

  // Example data to display in the large table area
  results: any[] = [];

  constructor() {}

  // Example method to do the query
  searchAdoration() {
    // TODO: call your backend with the selected filters
    console.log('Searching Adoration with:', {
      stateSelection: this.stateSelection,
      selectedState: this.selectedState,
      dioceseSelection: this.dioceseSelection,
      selectedDiocese: this.selectedDiocese,
      parishSelection: this.parishSelection,
      selectedParish: this.selectedParish
    });

    // Simulate results
    this.results = [
      { name: 'Adoration Chapel 1', location: 'Sydney', times: '24/7' },
      { name: 'Adoration Chapel 2', location: 'Wollongong', times: '9am - 5pm' }
    ];
  }
}
