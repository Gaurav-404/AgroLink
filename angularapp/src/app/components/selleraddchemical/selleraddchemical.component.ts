import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AgrochemicalService } from '../../services/agrochemical.service';
import { AgroChemical } from '../../models/agrochemical.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-selleraddchemical',
  templateUrl: './selleraddchemical.component.html',
  styleUrls: ['./selleraddchemical.component.css']
})
export class SelleraddchemicalComponent {
  saving = false;
  imageReady = false;
  agro: AgroChemical = {
    Name: '',
    Brand: '',
    Category: '',
    Unit: '',
    PricePerUnit: null as unknown as number,
    Image: '',
    Description: ''
  };

  imageFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private agroSvc: AgrochemicalService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onFileSelected(e: any) {
    const file = e?.target?.files?.[0];
    if (!file) {
      this.imageFile = null;
      this.imagePreview = null;
      this.imageReady = false;
      this.agro.Image = '';
      return;
    }

    this.imageFile = file;
    this.imageReady = false;
    this.agro.Image = '';

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.imagePreview = base64;
      this.agro.Image = base64;
      this.imageReady = true;
    };
    reader.onerror = () => {
      this.toastr.error('Failed to read image. Please try again.', 'Error');
      this.imageReady = false;
      this.agro.Image = '';
    };
    reader.readAsDataURL(file);
  }

  private buildPayload(): AgroChemical {
    return {
      Name: (this.agro.Name ?? '').trim(),
      Brand: (this.agro.Brand ?? '').trim(),
      Category: (this.agro.Category ?? '').trim(),
      Unit: (this.agro.Unit ?? '').trim(),
      PricePerUnit: this.agro.PricePerUnit != null ? Number(this.agro.PricePerUnit) : 0,
      Image: (this.agro.Image ?? '').trim(),
      Description: (this.agro.Description ?? '').trim()
    } as AgroChemical;
  }

  submit(f: NgForm) {
    // ✅ Individual field validations with specific toast messages
    if (!this.agro.Name?.trim()) {
      this.toastr.error('Chemical name is required.', 'Validation Error');
      f.controls['Name']?.markAsTouched();
      return;
    }
    if (!this.agro.Brand?.trim()) {
      this.toastr.error('Brand is required.', 'Validation Error');
      f.controls['Brand']?.markAsTouched();
      return;
    }
    if (!this.agro.Category?.trim()) {
      this.toastr.error('Category is required.', 'Validation Error');
      f.controls['Category']?.markAsTouched();
      return;
    }
    if (!this.agro.Unit?.trim()) {
      this.toastr.error('Unit is required.', 'Validation Error');
      f.controls['Unit']?.markAsTouched();
      return;
    }
    if (this.agro.PricePerUnit == null || this.agro.PricePerUnit <= 0) {
      this.toastr.error('Price per unit must be greater than 0.', 'Validation Error');
      f.controls['PricePerUnit']?.markAsTouched();
      return;
    }
    if (!this.agro.Description?.trim()) {
      this.toastr.error('Description is required.', 'Validation Error');
      f.controls['Description']?.markAsTouched();
      return;
    }
    if (this.imageFile && !this.imageReady) {
      this.toastr.warning('Image is still loading, please wait a moment.', 'Validation Warning');
      return;
    }
    if (!this.agro.Image) {
      this.toastr.error('Please select an image.', 'Validation Error');
      return;
    }

    // ✅ Submit if all validations pass
    const payload = this.buildPayload();
    this.saving = true;

    this.agroSvc.addAgroChemical(payload).subscribe({
      next: (res: any) => {
        this.saving = false;
        const msg = typeof res === 'string' ? res : 'Chemical added successfully!';
        this.toastr.success(msg, 'Success');
        setTimeout(() => this.router.navigate(['/seller/view-chemical']), 1000);
      },
      error: (err: any) => {
        this.saving = false;
      
        if (err?.error?.errors) {
          // Collect all validation messages
          const messages: string[] = [];
          for (const field in err.error.errors) {
            if (err.error.errors.hasOwnProperty(field)) {
              messages.push(...err.error.errors[field]);
            }
          }
          this.toastr.error(messages.join(' | '), err.error.title || 'Validation Error');
        } else if (err?.error?.detail) {
          this.toastr.error(err.error.detail, err.error.title || 'Error');
        } else if (typeof err?.error === 'string') {
          this.toastr.error(err.error, 'Error');
        } else {
          this.toastr.error('Validation failed. Please check your input.', 'Error');
        }
      
        console.error('AddAgroChemical error:', err);
      }
      
      
    });
  }
}
