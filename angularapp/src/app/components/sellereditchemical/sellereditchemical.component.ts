import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AgrochemicalService } from '../../services/agrochemical.service';
import { AgroChemical } from '../../models/agrochemical.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sellereditchemical',
  templateUrl: './sellereditchemical.component.html',
  styleUrls: ['./sellereditchemical.component.css']
})
export class SellereditchemicalComponent implements OnInit {
  id!: number;
  loading = false;
  saving = false;

  errorMsg = '';
  successMsg = '';

  model: AgroChemical = {
    AgroChemicalId: 0,
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
    private route: ActivatedRoute,
    private router: Router,
    private agroSvc: AgrochemicalService,
    private toastr: ToastrService   // ✅ inject toastr
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id') || 0);
    if (!this.id) {
      this.errorMsg = 'Invalid id.';
      return;
    }
    this.fetch();
  }

  private normalizeImageToPreview(img?: string | null): string | null {
    if (!img) return '/assets/no-image.png';
    if (/^data:image\//i.test(img) || /^https?:\/\//i.test(img)) return img;
    if (img === 'Z') return '/assets/no-image.png';
    return `/assets/${img}`;
  }
  
  

  fetch(): void {
    this.loading = true;
    this.errorMsg = '';
    this.agroSvc.getAgroChemicalById(String(this.id)).subscribe({
      next: (data: any) => {
        this.model = {
          AgroChemicalId: data?.AgroChemicalId ?? data?.agroChemicalId ?? this.id,
          Name: data?.Name ?? data?.name ?? '',
          Brand: data?.Brand ?? data?.brand ?? '',
          Category: data?.Category ?? data?.category ?? '',
          Unit: data?.Unit ?? data?.unit ?? '',
          PricePerUnit: data?.PricePerUnit ?? data?.pricePerUnit ?? 0,
          Image: data?.Image ?? data?.image ?? '',
          Description: data?.Description ?? data?.description ?? ''
        } as AgroChemical;

        this.imagePreview = this.normalizeImageToPreview(this.model.Image);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.statusText || err?.message || 'Failed to load data.';
        this.toastr.error(this.errorMsg, 'Error');   // ✅ show error toast
        console.error('Edit load error:', err);
      }
    });
  }

  onFileSelected(e: any) {
    const file = e?.target?.files?.[0];
    if (!file) {
      this.imageFile = null;
      this.imagePreview = this.normalizeImageToPreview(this.model.Image);
      return;
    }
  
    this.imageFile = file;
  
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.imagePreview = base64;
      this.model.Image = base64;   // ✅ store base64 for backend
    };
    reader.readAsDataURL(file);
  }
  
  
  private buildPayload(): AgroChemical {
    return {
      AgroChemicalId: this.model.AgroChemicalId,
      Name: (this.model.Name ?? '').trim(),
      Brand: (this.model.Brand ?? '').trim(),
      Category: (this.model.Category ?? '').trim(),
      Unit: (this.model.Unit ?? '').trim(),
      PricePerUnit: this.model.PricePerUnit != null ? Number(this.model.PricePerUnit) : 0,
      Image: (this.model.Image ?? '').trim(),   // ✅ now always base64 or normalized string
      Description: (this.model.Description ?? '').trim()
    } as AgroChemical;
  }
  

  submit(f: NgForm) {
    this.errorMsg = '';
    this.successMsg = '';
  
    if (!f.valid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }
  
    const payload = this.buildPayload();
    this.saving = true;
  
    this.agroSvc.updateAgroChemical(String(this.id), payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'Agrochemical updated successfully';
        this.toastr.success(this.successMsg, 'Success');   // ✅ success toast
        setTimeout(() => this.router.navigate(['/seller/view-chemical']), 700);
      },
      error: (err: any) => {
        this.saving = false;
  
        // Only show error if status is not 200
        if (err.status === 200) {
          this.successMsg = 'Agrochemical updated successfully';
          this.toastr.success(this.successMsg, 'Success');
          setTimeout(() => this.router.navigate(['/seller/view-chemical']), 700);
        } else {
          this.errorMsg = err?.error?.message || err?.statusText || 'Update failed.';
          this.toastr.error(this.errorMsg, 'Error');       // ✅ error toast
          console.error('Update error:', err);
        }
      }
    });
  }
  
}