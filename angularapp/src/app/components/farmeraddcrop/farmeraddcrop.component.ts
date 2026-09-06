import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Crop } from 'src/app/models/crop.model';
import { CropService } from 'src/app/services/crop.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-farmeraddcrop',
  templateUrl: './farmeraddcrop.component.html',
  styleUrls: ['./farmeraddcrop.component.css']
})
export class FarmeraddcropComponent implements OnInit {
  @ViewChild('form') form?: NgForm;

  formModel: {
    cropId: number;
    cropName: string;
    cropType: string;
    description: string;
    plantingDate: string;
  } = {
    cropId: 0,
    cropName: '',
    cropType: '',
    description: '',
    plantingDate: ''
  };

  cropType: string[] = ['Rabi', 'Kharif', 'Zaid'];
  saving = false;

  // 👇 Add these back so template compiles
  error?: string;
  success?: string;

  constructor(
    private cropService: CropService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.formModel.plantingDate = this.localNowForDatetimeLocal();
  }

  private localNowForDatetimeLocal(): string {
    const d = new Date();
    const tzShifted = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tzShifted.toISOString().slice(0, 16);
  }

  addCrop(ngForm?: NgForm): void {
    this.error = undefined;
    this.success = undefined;

    if (!ngForm || ngForm.invalid) {
      ngForm?.control.markAllAsTouched();
      this.error = 'Please fill all required fields.';
      this.toastr.error(this.error, 'Validation Error');
      return;
    }

    const userIdStr = this.authService.getUserId();
    const userId = userIdStr !== null ? Number(userIdStr) : NaN;
    if (!Number.isFinite(userId)) {
      this.error = 'Unable to determine the logged-in user. Please sign in again.';
      this.toastr.error(this.error, 'Error');
      return;
    }

    this.saving = true;

    let localDT: string = this.formModel.plantingDate;
    if (localDT && localDT.length === 16) localDT += ':00';
    const isoUtc = new Date(localDT).toISOString();

    const payload: Crop = {
      CropId: this.formModel.cropId,
      CropName: this.formModel.cropName,
      CropType: this.formModel.cropType,
      Description: this.formModel.description,
      PlantingDate: isoUtc,
      UserId: userId
    };

    this.cropService.addCrop(payload).subscribe({
      next: () => {
        this.success = 'Crop added successfully!';
        this.toastr.success(this.success, 'Success');
        this.resetForm(ngForm);
        this.router.navigate(['farmer/my-crop']);
        this.saving = false;
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'Failed to add crop';
        this.error = msg;
        this.toastr.error(this.error, 'Error');
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/crops']);
    this.toastr.info('Crop creation cancelled.', 'Info');
  }

  resetForm(ngForm?: NgForm): void {
    this.formModel = {
      cropId: 0,
      cropName: '',
      cropType: '',
      description: '',
      plantingDate: this.localNowForDatetimeLocal()
    };
    ngForm?.resetForm(this.formModel);
  }
}
