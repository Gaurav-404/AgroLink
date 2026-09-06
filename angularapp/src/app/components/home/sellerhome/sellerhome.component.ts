import { Component } from '@angular/core';

@Component({
  selector: 'app-sellerhome',
  templateUrl: './sellerhome.component.html',
  
  styleUrls: [
    '../home.component.css',          // Reuse main home theme (relative!)
    './sellerhome.component.css'      // Seller-specific tweaks
  ]

})
export class SellerhomeComponent {
  username :string= localStorage.getItem('userName');
}
