import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-sellernav',
  templateUrl: './sellernav.component.html',
  styleUrls: ['./sellernav.component.css']
})
export class SellernavComponent {
  isAgroOpen = false;

  constructor(private authService: AuthService, private router: Router,private toastr: ToastrService) {}

  openDropdown(): void {
    this.isAgroOpen = true;
  }

  closeDropdown(): void {
    this.isAgroOpen = false;
  }

  // Prevent click on the trigger from toggling/stealing focus
  cancelClick(event: Event): void {
    event.preventDefault();
  }

  onLogout(): void {
    this.authService.logout();
    this.toastr.success('You have logged out successfully.', 'Logout');
    this.router.navigate(['/login']);
  }
}
