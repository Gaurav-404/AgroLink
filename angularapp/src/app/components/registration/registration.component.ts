import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  newUser: User = {
    Email: "",
    Password: "",
    Username: "",
    MobileNumber: "",
    UserRole: ""
  };

  submitted: boolean = false;
  confirmPassword: string = "";
  acceptedTerms: boolean = false;

  // Password strength
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  strengthPercentage: number = 0;
  passwordStrengthText: string = '';

  // Touched flags — trigger validation on input (not just on submit)
  usernameTouched: boolean = false;
  emailTouched: boolean = false;
  mobileTouched: boolean = false;
  passwordTouched: boolean = false;
  confirmTouched: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const roleParam = (params['role'] || '').toString().trim();
      const normalized = roleParam
        ? roleParam.charAt(0).toUpperCase() + roleParam.slice(1).toLowerCase()
        : '';
      if (normalized === 'Farmer' || normalized === 'Seller') {
        this.newUser.UserRole = normalized;
      }
    });
  }

  // ─── Input Handlers (fire validation immediately on any keystroke) ───

  onUsernameInput(): void {
    this.usernameTouched = true;
  }

  onEmailInput(): void {
    this.emailTouched = true;
  }

  onMobileInput(): void {
    this.mobileTouched = true;
  }

  onPasswordInput(): void {
    this.passwordTouched = true;
    this.checkPasswordStrength();
  }

  onConfirmInput(): void {
    this.confirmTouched = true;
  }

  // ─── Password Strength ───

  checkPasswordStrength(): void {
    const password = this.newUser.Password;

    if (!password) {
      this.passwordStrength = 'weak';
      this.strengthPercentage = 0;
      this.passwordStrengthText = '';
      return;
    }

    let strength = 0;
    if (password.length >= 6)  strength += 20;
    if (password.length >= 8)  strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

    this.strengthPercentage = Math.min(strength, 100);

    if (this.strengthPercentage < 40) {
      this.passwordStrength = 'weak';
      this.passwordStrengthText = 'Weak';
    } else if (this.strengthPercentage < 70) {
      this.passwordStrength = 'medium';
      this.passwordStrengthText = 'Medium';
    } else {
      this.passwordStrength = 'strong';
      this.passwordStrengthText = 'Strong';
    }
  }

  // ─── Password Rule Getters (used directly in template) ───

  get hasMinLength(): boolean   { return (this.newUser.Password?.length ?? 0) >= 8; }
  get hasUpperCase(): boolean   { return /[A-Z]/.test(this.newUser.Password || ''); }
  get hasLowerCase(): boolean   { return /[a-z]/.test(this.newUser.Password || ''); }
  get hasNumber(): boolean      { return /[0-9]/.test(this.newUser.Password || ''); }
  get hasSpecialChar(): boolean { return /[^a-zA-Z0-9]/.test(this.newUser.Password || ''); }
  get hasNoSpaces(): boolean    { return !/\s/.test(this.newUser.Password || ''); }

  get isPasswordValid(): boolean {
    return this.hasMinLength &&
           this.hasUpperCase &&
           this.hasLowerCase &&
           this.hasNumber &&
           this.hasSpecialChar &&
           this.hasNoSpaces;
  }

  // ─── Field Validation Getters ───

  get passwordsMatch(): boolean {
    return this.newUser.Password === this.confirmPassword;
  }

  get isUsernameValid(): boolean {
    return !!this.newUser.Username?.trim() &&
           !this.newUser.Username.includes(' ');
  }

  get isEmailValid(): boolean {
    return !!this.newUser.Email?.trim() &&
           !this.newUser.Email.includes(' ') &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.Email);
  }

  get isMobileValid(): boolean {
    return !!this.newUser.MobileNumber?.trim() &&
           !this.newUser.MobileNumber.includes(' ') &&
           /^\d{10,}$/.test(this.newUser.MobileNumber);
  }

  // ─── Full Form Validation (runs on submit) ───

  validateForm(): { isValid: boolean; message?: string } {

    // Username
    if (!this.newUser.Username?.trim())
      return { isValid: false, message: 'Username is required' };
    if (this.newUser.Username.includes(' '))
      return { isValid: false, message: 'Username must not contain spaces' };

    // Email
    if (!this.newUser.Email?.trim())
      return { isValid: false, message: 'Email is required' };
    if (this.newUser.Email.includes(' '))
      return { isValid: false, message: 'Email must not contain spaces' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.Email))
      return { isValid: false, message: 'Please enter a valid email address' };

    // Mobile
    if (!this.newUser.MobileNumber?.trim())
      return { isValid: false, message: 'Mobile number is required' };
    if (this.newUser.MobileNumber.includes(' '))
      return { isValid: false, message: 'Mobile number must not contain spaces' };
    if (!/^\d{10,}$/.test(this.newUser.MobileNumber))
      return { isValid: false, message: 'Mobile number must be at least 10 digits' };

    // Password
    if (!this.newUser.Password)
      return { isValid: false, message: 'Password is required' };
    if (!this.hasNoSpaces)
      return { isValid: false, message: 'Password must not contain spaces' };
    if (!this.hasMinLength)
      return { isValid: false, message: 'Password must be at least 8 characters' };
    if (!this.hasUpperCase)
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    if (!this.hasLowerCase)
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    if (!this.hasNumber)
      return { isValid: false, message: 'Password must contain at least one number' };
    if (!this.hasSpecialChar)
      return { isValid: false, message: 'Password must contain at least one special character' };

    // Confirm Password
    if (!this.confirmPassword)
      return { isValid: false, message: 'Please confirm your password' };
    if (!this.passwordsMatch)
      return { isValid: false, message: 'Passwords do not match' };

    // Role
    if (!this.newUser.UserRole)
      return { isValid: false, message: 'Please select a role' };

    return { isValid: true };
  }

  // ─── Register ───

  register(): void {
    this.submitted = true;

    // Mark all fields as touched so all errors show on submit
    this.usernameTouched = true;
    this.emailTouched = true;
    this.mobileTouched = true;
    this.passwordTouched = true;
    this.confirmTouched = true;

    const validation = this.validateForm();
    if (!validation.isValid) {
      this.toastr.warning(validation.message, 'Warning');
      return;
    }

    this.authService.register(this.newUser).subscribe({
      next: () => {
        this.toastr.success('Registration successful!', 'Success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration failed', err);
        if (err.error && err.error.message) {
          this.toastr.error(err.error.message, 'Registration Failed');
        } else if (err.status === 409) {
          this.toastr.error('User already exists with this email', 'Registration Failed');
        } else {
          this.toastr.error('Registration failed. Please try again.', 'Error');
        }
      }
    });
  }

  // ─── Reset ───

  resetForm(): void {
    this.newUser = {
      Email: "",
      Password: "",
      Username: "",
      MobileNumber: "",
      UserRole: ""
    };
    this.confirmPassword = "";
    this.acceptedTerms = false;
    this.submitted = false;
    this.passwordStrength = 'weak';
    this.strengthPercentage = 0;
    this.passwordStrengthText = '';
    this.usernameTouched = false;
    this.emailTouched = false;
    this.mobileTouched = false;
    this.passwordTouched = false;
    this.confirmTouched = false;
  }
}