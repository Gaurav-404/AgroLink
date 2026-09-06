import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-farmernav',
  templateUrl: './farmernav.component.html',
  styleUrls: ['./farmernav.component.css']
})
export class FarmernavComponent {
  
  isCropOpen = false;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  openDropdown() {
    this.isCropOpen = true;
  }

  closeDropdown() {
    this.isCropOpen = false;
  }

  cancelClick(event: Event) {
    // Prevent click toggling
    event.preventDefault();
  }

  onLogout(): void {
    this.authService.logout();
    this.toastr.success('You have logged out successfully.', 'Logout');
    this.router.navigate(['/login']);
  }
}