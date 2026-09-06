import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CropService } from '../../services/crop.service';
import { Crop } from '../../models/crop.model';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-farmereditcrop',
  templateUrl: './farmereditcrop.component.html',
  styleUrls: ['./farmereditcrop.component.css']
})
export class FarmereditcropComponent implements OnInit {
  fieldKeys: string[] = [];
  cropId!: number;

  isLoading = false;
  loaded = false;
  error?: string;
  success?: string;

  private readonly idKeyCandidates = ['id', 'cropId', 'CropId', 'cropID', 'cropid', 'Id', 'ID'];
  private readonly userIdKeyCandidates = ['UserId', 'userId', 'UserID', 'userID', 'userid'];

  readonly cropTypeOptions = ['Rabi', 'Kharif', 'Zaid'];
  private readonly cropTypeKeyCandidates = ['cropType', 'CropType', 'croptype', 'CROPTYPE'];
  private readonly plantingDateKeyCandidates = ['plantingDate', 'PlantingDate', 'plantingdate', 'PLANTINGDATE'];

  idKeyDetected: string | null = null;
  formModel: Record<string, any> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cropService: CropService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cropId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchCrop();
  }

  private fetchCrop(): void {
    this.isLoading = true;
    this.error = undefined;

    this.cropService.getCropById(this.cropId).subscribe({
      next: (crop: Crop) => {
        this.buildModelFromCrop(crop as any);
        this.loaded = true;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = this.prettyError(err, 'Failed to load crop.');
        this.toastr.error(this.error, 'Error');
        this.isLoading = false;
      }
    });
  }

 

private buildModelFromCrop(crop: any): void {
  this.idKeyDetected = this.idKeyCandidates.find(k => k in crop) ?? null;

  const fm: Record<string, any> = {};

  Object.keys(crop).forEach((key) => {
    const val = crop[key];

    const isPrimitive =
      ['string', 'number', 'boolean', 'bigint'].includes(typeof val) || val == null;

    const isUserIdKey = this.userIdKeyCandidates.includes(key);
    const isIdKey = this.idKeyCandidates.includes(key);

    if (isPrimitive && !isUserIdKey && !isIdKey) {

    if (this.plantingDateKeyCandidates.includes(key) && typeof val === 'string' && val) {
        fm[key] = val.length >= 16 ? val.substring(0, 16) : val;
      } else {
        fm[key] = val;
      }

    }
  });

  this.formModel = fm;
  this.fieldKeys = Object.keys(this.formModel);
}


  onSubmit(ngForm: NgForm): void {
    if (!ngForm) return;
    if (ngForm.invalid) {
      ngForm.control.markAllAsTouched();
      this.error = 'Please fill all required fields.';
      this.toastr.error(this.error, 'Validation Error');
      return;
    }

    // Check for whitespace-only values in text fields
    for (const key of this.fieldKeys) {
      if (this.idKeyDetected === key) continue;
      if (this.isCropTypeControl(key)) continue;
      if (this.isPlantingDateControl(key)) continue;
      const val = this.formModel[key];
      if (typeof val === 'string' && val.trim() === '') {
        this.error = 'Cannot have white space only input.';
        this.toastr.error(this.error, 'Validation Error');
        ngForm.control.markAllAsTouched();
        return;
      }
    }

    const payload: Crop = { ...(this.formModel as any) } as Crop;

    // Convert datetime-local value back to full ISO string for the API
    for (const key of this.plantingDateKeyCandidates) {
      if (key in (payload as any) && (payload as any)[key]) {
        const val: string = (payload as any)[key];
        // Append seconds if missing so the API receives a valid ISO string
        (payload as any)[key] = val.length === 16 ? val + ':00' : val;
      }
    }

    const userIdStr = this.authService.getUserId();
    const userId = userIdStr !== null ? Number(userIdStr) : NaN;
    if (!Number.isFinite(userId)) {
      this.error = 'Unable to determine the logged-in user. Please sign in again.';
      this.toastr.error(this.error, 'Error');
      return;
    }
    (payload as any).UserId = userId;

    this.isLoading = true;
    this.error = undefined;

    this.cropService.updateCrop(this.cropId, payload).subscribe({
      next: (res: string) => {
        this.success = res || 'Crop updated successfully!';
        this.toastr.success(this.success, 'Success');
        this.isLoading = false;
        this.router.navigate(['/farmer/my-crop']);
      },
      error: (err) => {
        this.error = this.prettyError(err, 'Failed to update crop.');
        this.toastr.error(this.error, 'Error');
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/farmer/my-crop']);
    this.toastr.info('Crop editing cancelled.', 'Info');
  }

  isCropTypeControl(key: string): boolean {
    return this.cropTypeKeyCandidates.includes(key);
  }

  isPlantingDateControl(key: string): boolean {
    return this.plantingDateKeyCandidates.includes(key);
  }

  isBooleanControl(key: string): boolean {
    return typeof this.formModel?.[key] === 'boolean';
  }

  inputTypeFor(key: string): string {
    return typeof this.formModel?.[key] === 'number' ? 'number' : 'text';
  }

  
friendlyLabel(key: string): string {

  const map: Record<string, string> = {
    cropName: 'Crop Name',
    CropName: 'Crop Name',

    cropType: 'Crop Type',
    CropType: 'Crop Type',

    plantingDate: 'Planting Date',
    PlantingDate: 'Planting Date',

    quantity: 'Quantity',
    Quantity: 'Quantity',

    price: 'Price',
    Price: 'Price',

    isOrganic: 'Organic Crop',
    IsOrganic: 'Organic Crop'
  };

  if (map[key]) return map[key];

  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}


  private prettyError(err: any, fallback: string): string {
    if (!err) return fallback;
    if (typeof err === 'string') {
      try {
        const parsed = JSON.parse(err);
        if (parsed?.errors || parsed?.title) return 'Something has gone wrong. Please try again.';
      } catch {
        return err;
      }
    }
    if (err?.error) {
      if (typeof err.error === 'string') {
        try {
          const parsed = JSON.parse(err.error);
          if (parsed?.errors || parsed?.title) return 'Something has gone wrong. Please try again.';
        } catch {
          return err.error;
        }
      }
      if (typeof err.error === 'object' && (err.error?.errors || err.error?.title)) {
        return 'Something has gone wrong. Please try again.';
      }
    }
    if (err?.status === 400) return 'Something has gone wrong. Please try again.';
    if (typeof err?.message === 'string') return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return fallback;
    }
  }
}