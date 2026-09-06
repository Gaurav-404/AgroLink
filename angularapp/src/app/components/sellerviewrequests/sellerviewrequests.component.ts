import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { RequestService } from '../../services/request.service';
import { AgrochemicalService } from '../../services/agrochemical.service';
import { CropService } from '../../services/crop.service';
import type { Request as RequestModel } from '../../models/request.model';
import { ToastrService } from 'ngx-toastr';
import { FeedbackService } from 'src/app/services/feedback.service';

type RequestWithRelations = RequestModel & {
  User?: any;
  AgroChemical?: any;
  Crop?: any;
};

type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'app-sellerviewrequests',
  templateUrl: './sellerviewrequests.component.html',
  styleUrls: ['./sellerviewrequests.component.css']
})
export class SellerviewrequestsComponent implements OnInit, OnDestroy {
  requests: RequestWithRelations[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';
  updatingRequestId: number | null = null;

  q = '';
  statusFilter: StatusFilter = 'All';

  showMoreOpen = false;
  activeItem: RequestWithRelations | null = null;

  private sub?: Subscription;
  trackByRequestId = (_: number, r: any) => r?.RequestId ?? _;

  constructor(
    private requestService: RequestService,
    private agroService: AgrochemicalService,
    private feedbackService:FeedbackService,
    private cropService: CropService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll() {
    this.loading = true;
    this.requests = [];
    this.errorMsg = '';
    this.successMsg = '';

    this.requestService.getAllRequest().subscribe({
      next: (data: any[]) => {
        const baseRequests: RequestModel[] = (data || []).map(r => ({
          ...r,
          RequestId: r.requestId,
          AgroChemicalId: r.agroChemicalId,
          CropId: r.cropId,
          UserId: r.userId,
          Quantity: r.quantity,
          Status: r.status,
          RequestDate: r.requestDate
        }));

        if (baseRequests.length === 0) {
          this.requests = [];
          this.loading = false;
          return;
        }

        // 🔑 Enrich each request with AgroChemical, Crop, and User
        const enrichedCalls = baseRequests.map(req =>
          forkJoin({
            agro: this.agroService.getAgroChemicalById(req.AgroChemicalId),
            crop: this.cropService.getCropById(req.CropId),
            user: this.feedbackService.getUserById(req.UserId) // <-- call your getUsers() API
          })
        );

        forkJoin(enrichedCalls).subscribe({
          next: results => {
            this.requests = baseRequests.map((req, i) => {
              const agroRaw: any = results[i].agro;
              const cropRaw: any = results[i].crop;
              const userRaw: any = results[i].user;

              return {
                ...req,
                AgroChemical: {
                  AgroChemicalId: agroRaw.agroChemicalId,
                  Name: agroRaw.name,
                  Brand: agroRaw.brand,
                  Category: agroRaw.category,
                  Description: agroRaw.description,
                  Unit: agroRaw.unit,
                  PricePerUnit: agroRaw.pricePerUnit,
                  Image: agroRaw.image
                },
                Crop: {
                  CropId: cropRaw.cropId,
                  CropName: cropRaw.cropName,
                  CropType: cropRaw.cropType,
                  Description: cropRaw.description,
                  PlantingDate: cropRaw.plantingDate,
                  UserId: cropRaw.userId
                },
                User: {
                  UserId: userRaw.userId,
                  Username: userRaw.username,
                  Email: userRaw.email
                }
              };
            });
            this.loading = false;
          },
          error: err => {
            console.error('Failed to enrich requests', err);
            this.requests = baseRequests; // fallback
            this.loading = false;
            this.toastr.warning('Some product/crop/user details could not be loaded');
          }
        });
      },
      error: err => {
        this.errorMsg = this.humanizeError(err);
        this.loading = false;
        this.toastr.error(this.errorMsg);
      }
    });
  }

  refresh() {
    this.fetchAll();
  }

  filtered(): RequestWithRelations[] {
    const t = (this.q || '').toLowerCase();
    let list = [...this.requests];

    if (this.statusFilter !== 'All') {
      list = list.filter(r => (r.Status || '').toLowerCase() === this.statusFilter.toLowerCase());
    }

    if (t) {
      list = list.filter(r =>
        (r?.User?.Username || '').toLowerCase().includes(t) ||
        (r?.AgroChemical?.Name || '').toLowerCase().includes(t) ||
        (r?.AgroChemical?.Brand || '').toLowerCase().includes(t) ||
        (r?.Crop?.CropName || '').toLowerCase().includes(t) ||
        (r?.Status || '').toLowerCase().includes(t)
      );
    }
    return list;
  }

  fmt(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toISOString().slice(0, 10);
  }

  openShowMore(item: RequestWithRelations) {
    this.activeItem = item;
    this.showMoreOpen = true;
  }

  closeShowMore() {
    this.showMoreOpen = false;
    this.activeItem = null;
  }

  setStatus(item: RequestWithRelations, newStatus: 'Approved' | 'Rejected') {
    if (!item.RequestId) return;
    if (this.updatingRequestId === item.RequestId) return;
  
    this.updatingRequestId = item.RequestId;
  
    const payload: RequestModel = {
      RequestId: item.RequestId,
      AgroChemicalId: item.AgroChemicalId,
      UserId: item.UserId,
      CropId: item.CropId,
      Quantity: item.Quantity,
      Status: newStatus,
      RequestDate: item.RequestDate
    };
  
    this.requestService.updateRequestStatus(item.RequestId, payload).subscribe({
      next: (res: string) => {
        // res will be plain text like "Request approved successfully"
        this.toastr.success(res, 'Success');
        this.updatingRequestId = null;
  
        // Instead of full page reload, just refresh the list
        this.fetchAll();
      },
      error: err => {
        this.toastr.error(this.humanizeError(err));
        this.updatingRequestId = null;
      }
    });
  }
  
  isUpdating(requestId: number | undefined): boolean {
    return this.updatingRequestId === requestId;
  }

  statusClass(s: string): string {
    switch ((s || '').toLowerCase()) {
      case 'approved': return 'badge badge--approved';
      case 'rejected': return 'badge badge--rejected';
      default: return 'badge badge--pending';
    }
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
