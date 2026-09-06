import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { RequestService } from 'src/app/services/request.service';
import { AgrochemicalService } from 'src/app/services/agrochemical.service';
import { CropService } from 'src/app/services/crop.service';
import { Request } from 'src/app/models/request.model';
import { ToastrService } from 'ngx-toastr';

type RequestWithRelations = Request & { AgroChemical?: any; Crop?: any };

@Component({
  selector: 'app-farmermyrequest',
  templateUrl: './farmermyrequest.component.html',
  styleUrls: ['./farmermyrequest.component.css']
})
export class FarmermyrequestComponent implements OnInit, OnDestroy {

  requests: RequestWithRelations[] = [];
  loading = false;
  errorMsg = '';
  q = '';

  userId!: string;
  confirmDeleteId: number | null = null;

  private sub?: Subscription;
  trackByRequestId = (_: number, r: any) => r?.RequestId ?? _;

  constructor(
    private requestService: RequestService,
    private agroService: AgrochemicalService,
    private cropService: CropService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      this.errorMsg = 'User not found. Please login again.';
      return;
    }
    this.userId = uid;
    this.fetch(this.userId);
  }

  fetch(userId: string) {
    this.loading = true;
    this.errorMsg = '';
    this.sub = this.requestService.getRequestsByUserId(userId).subscribe({
      next: (data: any[]) => {
        const baseRequests: Request[] = (data || []).map(r => ({
          ...r,
          RequestId: r.requestId,
          AgroChemicalId: r.agroChemicalId,
          CropId: r.cropId,
          UserId: r.userId,
          Quantity: r.quantity,
          Status: r.status,
          RequestDate: r.requestDate
        }));

        const enrichedCalls = baseRequests.map(req =>
          forkJoin({
            agro: this.agroService.getAgroChemicalById(req.AgroChemicalId),
            crop: this.cropService.getCropById(req.CropId)
          })
        );

        if (enrichedCalls.length === 0) {
          this.requests = [];
          this.loading = false;
          return;
        }

        forkJoin(enrichedCalls).subscribe({
          next: (results) => {
            this.requests = baseRequests.map((req, i) => ({
              ...req,
              AgroChemical: results[i].agro,
              Crop: results[i].crop
            }));
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to enrich requests', err);
            this.requests = baseRequests;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 404) {
          this.requests = [];
          this.errorMsg = '';
        } else {
          this.errorMsg = this.humanizeError(err);
        }
      }
    });
  }

  refresh() {
    if (!this.userId) return;
    this.fetch(this.userId);
  }

  filtered(): RequestWithRelations[] {
    const term = (this.q || '').toLowerCase();
    if (!term) return this.requests;
    return this.requests.filter(r =>
      (r?.AgroChemical?.Name || '').toLowerCase().includes(term) ||
      (r?.AgroChemical?.Brand || '').toLowerCase().includes(term) ||
      (r?.AgroChemical?.Category || '').toLowerCase().includes(term) ||
      (r?.Crop?.CropName || '').toLowerCase().includes(term) ||
      (r?.Status || '').toLowerCase().includes(term)
    );
  }

  fmt(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toISOString().slice(0, 10);
  }

  statusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'badge badge--approved';
      case 'rejected': return 'badge badge--rejected';
      default: return 'badge badge--pending';
    }
  }

  askDelete(id?: number) {
    if (id) this.confirmDeleteId = id;
  }

  cancelDelete() {
    this.confirmDeleteId = null;
  }

  confirmDelete() {
    if (this.confirmDeleteId == null) return;
    const id = this.confirmDeleteId;
    this.loading = true;

    this.requestService.deleteRequest(String(id)).subscribe({
      next: (res: string) => {
        this.requests = this.requests.filter(r => r.RequestId !== id);
        this.toastr.success(res || 'Request deleted successfully.', 'Success'); // ✅ toast
        this.loading = false;
        this.confirmDeleteId = null;
      },
      error: err => {
        this.errorMsg = this.humanizeError(err);
        this.toastr.error(this.errorMsg, 'Error'); // ✅ toast for error
        this.loading = false;
        this.confirmDeleteId = null;
      }
    });
  }

  private humanizeError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (err?.error) return typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
    if (err?.message) return err.message;
    return 'Something went wrong. Please try again.';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
