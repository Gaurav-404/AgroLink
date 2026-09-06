import { Component } from '@angular/core';

@Component({
  selector: 'app-farmerhome',
  templateUrl: './farmerhome.component.html',
  
  styleUrls: [
    '../home.component.css',          // Reuse main home theme (relative!)
    './farmerhome.component.css'      // Farmer-specific tweaks
  ]

})
export class FarmerhomeComponent {
  username :string= localStorage.getItem('userName');
}
