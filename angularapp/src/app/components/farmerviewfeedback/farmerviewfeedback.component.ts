import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Feedback } from 'src/app/models/feedback.model';
import { FeedbackService } from 'src/app/services/feedback.service';

declare var Swal: any;

@Component({
  selector: 'app-farmerviewfeedback',
  templateUrl: './farmerviewfeedback.component.html',
  styleUrls: ['./farmerviewfeedback.component.css']
})
export class FarmerviewfeedbackComponent implements OnInit {

  // ── Data ──
  feedback: Feedback[] = [];
  filteredFeedback: Feedback[] = [];
  loading = true;

  // ── Search ──
  searchTerm = '';

  // ── Grid ──
  gridApi: any;
  paginationPageSize = 10;

  // ── Modal ──
  showDeleteModal = false;
  selectedFeedbackId: number | null = null;

  columnDefs: any[] = [
    {
      headerName: 'S.No',
      valueGetter: 'node.rowIndex + 1',
      width: 80,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        return `<span style="
          color:#9ca3af;
          font-size:0.82rem;
          font-family:'Lora',Georgia,serif;
        ">${params.value}</span>`;
      }
    },
    {
      headerName: 'Feedback',
      field: 'feedbackText',
      flex: 1,
      sortable: true,
      filter: true,
      tooltipField: 'feedbackText',
      cellRenderer: (params: any) => {
        const txt: string = params.value || '';
        const short = txt.length > 100 ? txt.substring(0, 100) + '…' : txt;
        return `<span style="
          font-family:'Lora',Georgia,serif;
          font-size:0.88rem;
          color:#374151;
          line-height:1.4;
        ">${short}</span>`;
      }
    },
    {
      headerName: 'Date',
      field: 'date',
      width: 170,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const v = params.value;
        const d = v ? new Date(v) : null;
        const formatted = d && !isNaN(d.getTime())
          ? d.toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '-';
        return `<span style="
          font-family:'Inter',sans-serif;
          font-size:0.82rem;
          color:#6b7280;
          white-space:nowrap;
        ">${formatted}</span>`;
      }
    },
    {
      headerName: 'Actions',
      width: 130,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const btn = document.createElement('button');
        btn.innerText = '🗑 Delete';
        btn.style.cssText =
          'background:#ef4444;color:#fff;border:none;border-radius:6px;' +
          'padding:5px 12px;font-size:0.78rem;font-weight:600;' +
          'font-family:Inter,sans-serif;cursor:pointer;transition:background 0.15s;';
        btn.onmouseover = () => btn.style.background = '#dc2626';
        btn.onmouseout  = () => btn.style.background = '#ef4444';
        btn.addEventListener('click', () => {
          this.openDeleteModal(params.data.feedbackId);
        });
        return btn;
      }
    }
  ];

  defaultColDef: any = {
    sortable: true,
    filter: true,
    resizable: true
  };

  constructor(
    public ser: FeedbackService,
    public rt: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // ── Load Data ──

  loadData(): void {
    this.loading = true;
    this.ser.getAll().subscribe({
      next: (r: Feedback[]) => {
        this.feedback         = r;
        this.filteredFeedback = [...r];
        this.loading          = false;
      },
      error: (err: any) => {
        console.error('Failed to load feedback', err);
        this.loading = false;
      }
    });
  }

  // ── Search / Filter ──

  onSearch(): void {
    const q = (this.searchTerm || '').trim().toLowerCase();
    this.filteredFeedback = this.feedback.filter(f => {
      if (!q) return true;
      const hay = `${(f as any).feedbackText ?? ''} ${(f as any).date ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // ── Grid Events ──

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onPageSizeChanged(event: any): void {
    this.paginationPageSize = Number(event.target.value);
    if (this.gridApi) {
      this.gridApi.paginationSetPageSize(this.paginationPageSize);
    }
  }

  // ── Delete Modal ──

  openDeleteModal(id: number): void {
    this.selectedFeedbackId = id;
    this.showDeleteModal    = true;
  }

  closeModal(): void {
    this.showDeleteModal    = false;
    this.selectedFeedbackId = null;
  }

  confirmDelete(): void {
    if (this.selectedFeedbackId === null) return;

    this.ser.deleteFeedback(this.selectedFeedbackId).subscribe({
      next: () => this.handleSuccess(),
      error: (err: any) => {
        if (err.status === 200) {
          this.handleSuccess();
        } else {
          console.error('Delete error:', err);
          this.closeModal();
          Swal.fire('Error', 'Could not delete feedback.', 'error');
        }
      }
    });
  }

  private handleSuccess(): void {
    this.closeModal();
    Swal.fire({
      title: 'Deleted!',
      text: 'Feedback has been deleted.',
      icon: 'success',
      confirmButtonColor: '#1d6f42'
    });
    this.loadData();
  }
}