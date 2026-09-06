import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgrochemicalService } from '../../services/agrochemical.service';
import { AgroChemical } from '../../models/agrochemical.model';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-sellerviewchemical',
  templateUrl: './sellerviewchemical.component.html',
  styleUrls: ['./sellerviewchemical.component.css']
})
export class SellerviewchemicalComponent implements OnInit {
  chemicals: AgroChemical[] = [];
  filtered: AgroChemical[] = [];
  loading = false;
  viewMode: 'card' | 'table' = 'card';


  errorMsg = '';
  successMsg = '';

  searchText = '';

  imageOpen = false;
  confirmOpen = false;
  selectedChemical: (AgroChemical & { ImagePreview?: string }) | null = null;

  deletingId: number | null = null;
  imageBaseUrl = '/images/';
  userId: number | null = null;

  constructor(private agroSvc: AgrochemicalService, private router: Router,  private toastr: ToastrService) {}

  ngOnInit(): void {
    this.userId = 1;
    this.fetchMyChemicals();
  }

  private pickHeaderMessage(headers: any): string | null {
    try {
      const keys = ['x-message', 'x-msg', 'x-status-message', 'x-info'];
      for (const k of keys) {
        const v = headers?.get?.(k);
        if (typeof v === 'string' && v.trim()) return v.trim();
      }
    } catch {}
    return null;
  }

  private pickBackendMessage(data: any): string | null {
    if (!data) return null;
    if (typeof data === 'string') {
      const s = data.trim();
      return s ? s : null;
    }
    const keys = ['message', 'Message', 'detail', 'Detail', 'error', 'Error', 'title', 'Title', 'result', 'statusMessage', 'msg'];
    for (const k of keys) {
      const v = data?.[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    const errors = data?.errors || data?.Errors;
    if (errors && typeof errors === 'object') {
      const parts: string[] = [];
      Object.keys(errors).forEach((field) => {
        const val = errors[field];
        if (Array.isArray(val)) parts.push(`${field}: ${val.join(', ')}`);
        else if (typeof val === 'string') parts.push(`${field}: ${val}`);
      });
      if (parts.length) return parts.join(' | ');
    }
    return null;
  }

  private isLikelySuccessfulNonJson(err: any): boolean {
    const msg = (err?.message ?? '').toString();
    const status = Number(err?.status ?? 0);
    const parseLike =
      (err instanceof SyntaxError) ||
      /Unexpected token/.test(msg) ||
      /Unexpected end of JSON input/.test(msg) ||
      /in JSON at position/.test(msg);
    const successish = [200, 201, 202, 204, 0].includes(status);
    const hasOkText = typeof err?.error === 'string' && err.error.trim().length > 0;
    return (parseLike && successish) || hasOkText;
  }

  private normalize(c: any): AgroChemical {
    return {
      ...c,
      AgroChemicalId: c.AgroChemicalId ?? c.agroChemicalId ?? null,
      Name:           c.Name           ?? c.name           ?? '',
      Brand:          c.Brand          ?? c.brand          ?? '',
      Category:       c.Category       ?? c.category       ?? '',
      Unit:           c.Unit           ?? c.unit           ?? '',
      PricePerUnit:   c.PricePerUnit   ?? c.pricePerUnit   ?? 0,
      Description:    c.Description    ?? c.description    ?? '',
      Image:          c.Image          ?? c.image          ?? ''
    };
  }

  fetchMyChemicals(): void {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
  
    this.agroSvc.getAllAgroChemicals().subscribe({
      next: (data) => {
        const raw: any[] = Array.isArray(data) ? data : (data ? [data] : []);
        this.chemicals = raw.map(c => this.normalize(c));
        this.filtered = [...this.chemicals];
        this.loading = false;
        if (this.searchText?.trim()) this.applyFilter(this.searchText);
      },
      error: (err) => {
        this.loading = false;
        const headerMsg = this.pickHeaderMessage(err?.headers);
        const bodyMsg   = this.pickBackendMessage(err?.error);
        const fallback  = err?.statusText || err?.message || 'Failed to load agrochemicals.';
        this.errorMsg = headerMsg || bodyMsg || fallback;
        console.error('Load agrochemicals error:', err);
      }
    });
  }

  applyFilter(q: string) {
    this.searchText = q;
    const s = (q || '').toLowerCase().trim();
    if (!s) { this.filtered = [...this.chemicals]; return; }
    this.filtered = this.chemicals.filter(c =>
      [
        (c as any).Name ?? (c as any).name,
        (c as any).Brand ?? (c as any).brand,
        (c as any).Category ?? (c as any).category,
        (c as any).Unit ?? (c as any).unit
      ].some(x => (String(x || '')).toLowerCase().includes(s))
    );
  }

  getImageUrl(img: string | null | undefined): string {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return this.imageBaseUrl + img;
  }

  openImage(c: AgroChemical) {
    const raw = (c as any).Image ?? (c as any).image ?? '';
    this.selectedChemical = { ...c, ImagePreview: this.getImageUrl(raw) };
    this.imageOpen = true;
  }
  closeImage() { this.imageOpen = false; this.selectedChemical = null; }

  edit(c: AgroChemical) {
    const id = (c as any).AgroChemicalId ?? (c as any).agroChemicalId;
    if (!id) { console.error('No ID found on chemical:', c); return; }
    this.router.navigate(['/seller/edit-chemical', id]);
  }

  confirmDelete(c: AgroChemical) { this.selectedChemical = c; this.confirmOpen = true; }
  cancelDelete() { this.confirmOpen = false; this.selectedChemical = null; }

  doDelete() {
    const idVal = this.selectedChemical?.AgroChemicalId;
    if (!idVal) return;
  
    this.deletingId = idVal;
  
    this.agroSvc.deleteAgroChemical(idVal.toString()).subscribe({
      next: (res: string) => {
        // res will be "Agrochemical deleted successfully"
        this.toastr.success(res, 'Success');
  
        this.chemicals = this.chemicals.filter(x => x.AgroChemicalId !== this.deletingId);
        this.applyFilter(this.searchText);
        this.deletingId = null;
        this.cancelDelete();
      },
      error: (err: any) => {
        this.toastr.error('Delete failed: ' + (err?.message || ''), 'Error');
        this.deletingId = null;
        this.cancelDelete();
      }
    });
  }
  
}