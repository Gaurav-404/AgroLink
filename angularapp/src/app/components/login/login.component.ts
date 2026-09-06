import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  submitted: boolean = false;
  rememberMe: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // Real-time email validation
  get emailError(): string {
    if (!this.submitted && !this.email) return '';

    if (!this.email) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      return 'Please enter a valid email address';
    }

    return '';
  }

  // Real-time password validation
  get passwordError(): string {
    if (!this.submitted && !this.password) return '';

    if (!this.password) {
      return 'Password is required';
    }

    if (this.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return '';
  }

  // Check if form is valid
  get isFormValid(): boolean {
    return !this.emailError && !this.passwordError && !!this.email && !!this.password;
  }

  // Validate all fields
  validateForm(): { isValid: boolean; message?: string } {
    if (!this.email?.trim()) {
      return { isValid: false, message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    if (!this.password) {
      return { isValid: false, message: 'Password is required' };
    }

    if (this.password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    return { isValid: true };
  }
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async onLogin(): Promise<void> {
    this.submitted = true;
  
    const validation = this.validateForm();
  
    if (!validation.isValid) {
      this.toastr.warning(validation.message, 'Warning');
      return;
    }

    
    const hashedPassword = await this.hashPassword(this.password);

    this.authService.login({ email: this.email, password: hashedPassword })
      .subscribe({
        next: (response) => {
          const role = this.authService.getRole();
          this.toastr.success('Login successful!', 'Success');

          // Save remember me preference
          if (this.rememberMe) {
            localStorage.setItem('rememberedEmail', this.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
  
          // Navigate based on role
          if (role === 'Admin') {
            // Admin can access both, so redirect to home or a neutral dashboard
            this.router.navigate(['/']);
          } else if (role === 'Seller') {
            this.router.navigate(['/seller']);
          } else if (role === 'Farmer') {
            this.router.navigate(['/farmer']);
          } else {
            // Fallback
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          console.error('Login failed', err);

          // Handle specific error messages
          if (err.status === 401) {
            this.errorMessage = 'Invalid email or password';
            this.toastr.error('Invalid email or password', 'Login Failed');
          } else if (err.status === 404) {
            this.errorMessage = 'User not found';
            this.toastr.error('User not found', 'Login Failed');
          } else if (err.status === 403) {
            this.errorMessage = 'Account is locked or inactive';
            this.toastr.error('Account is locked or inactive', 'Login Failed');
          } else {
            this.errorMessage = 'Login failed. Please try again.';
            this.toastr.error(this.errorMessage, 'Error');
          }
  
          const loginCard = document.querySelector('.login-card');
          loginCard?.classList.add('shake-error');
          setTimeout(() => {
            loginCard?.classList.remove('shake-error');
          }, 500);
        }
      });
  }
  

  // Forgot password handler
  onForgotPassword(): void {
    if (!this.email) {
      this.toastr.warning('Please enter your email address first', 'Warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.toastr.warning('Please enter a valid email address', 'Warning');
      return;
    }

    // Navigate to forgot password page with email
    this.router.navigate(['/forgot-password'], { queryParams: { email: this.email } });
  }

  // Load remembered email on init
  ngOnInit(): void {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  // Clear form
  resetForm(): void {
    this.email = '';
    this.password = '';
    this.submitted = false;
    this.errorMessage = '';
  }

  

togglePassword(): void {
  this.showPassword = !this.showPassword;
}
}