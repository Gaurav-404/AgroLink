import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';

@Component({
  selector: 'app-sellerviewfeedback',
  templateUrl: './sellerviewfeedback.component.html',
  styleUrls: ['./sellerviewfeedback.component.css']
})
export class SellerviewfeedbackComponent implements OnInit {

  // ── Data ──
  feedbacks: any[] = [];
  filteredFeedbacks: any[] = [];
  searchTerm = '';

  // ── Modal ──
  showModal = false;
  selectedUser: any = null;

  // ── Grid config ──
  rowHeight = 48;
  paginationPageSize = 10;
  pageSizeOptions = [10, 20, 50, 100];

  columnDefs: any[] = [
    {
      field: 'FeedbackId',
      headerName: 'Feedback ID',
      sortable: true,
      filter: true,
      width: 140
    },
    {
      field: 'Username',
      headerName: 'Username',
      sortable: true,
      filter: true,
      width: 180,
      cellRenderer: (p: any) => {
        const name: string = p.value || '-';
        return `<span style="font-family:'Playfair Display',Georgia,serif;font-weight:700;color:#3b1f0f;">${name}</span>`;
      }
    },
    {
      field: 'UserId',
      headerName: 'User ID',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (p: any) => {
        const id = p.value ?? '-';
        return `<span style="
          background:#fef3c7;
          color:#92400e;
          font-size:0.78rem;
          font-weight:600;
          padding:3px 10px;
          border-radius:999px;
          border:1px solid #fde68a;
          font-family:Inter,sans-serif;
        ">${id}</span>`;
      }
    },
    {
      field: 'FeedbackText',
      headerName: 'Feedback',
      sortable: true,
      filter: true,
      tooltipField: 'FeedbackText',
      flex: 1,
      minWidth: 280,
      cellRenderer: (p: any) => {
        const txt: string = p.value || '';
        const short = txt.length > 90 ? txt.substring(0, 90) + '…' : txt;
        return `<span style="
          font-family:'Lora',Georgia,serif;
          font-size:0.88rem;
          color:#374151;
          line-height:1.4;
        ">${short}</span>`;
      }
    },
    {
      field: 'Date',
      headerName: 'Date',
      sortable: true,
      filter: true,
      width: 175,
      cellRenderer: (p: any) => {
        const v = p.value;
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
          font-family:Inter,sans-serif;
          font-size:0.82rem;
          color:#a8856a;
          font-weight:500;
        ">${formatted}</span>`;
      }
    },
    {
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filter: false,
      cellRenderer: () => {
        const btnStyle =
          'background:transparent;' +
          'color:#7f3e1e;' +
          'border:2px solid #7f3e1e;' +
          'padding:5px 14px;' +
          'border-radius:6px;' +
          'cursor:pointer;' +
          'font-size:0.78rem;' +
          'font-weight:700;' +
          'font-family:Inter,sans-serif;' +
          'transition:background 0.15s,color 0.15s;';
        return `<button
          data-action="viewUser"
          style="${btnStyle}"
          onmouseover="this.style.background='#7f3e1e';this.style.color='#fff'"
          onmouseout="this.style.background='transparent';this.style.color='#7f3e1e'"
        >View User</button>`;
      }
    }
  ];

  defaultColDef: any = {
    resizable: true,
    sortable: true,
    suppressMovable: false
  };

  private gridApi: any;
  private gridColumnApi: any;

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  // ── Helpers ──

  private asArray<T>(data: T | T[] | null | undefined): T[] {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  }

  // ── Load Data ──

  loadFeedbacks(): void {
    forkJoin({
      feedbacks: this.feedbackService.getAll(),
      users:     this.feedbackService.getUsers()
    }).subscribe({
      next: ({ feedbacks, users }) => {
        const fbArr   = this.asArray<any>(feedbacks);
        const userArr = this.asArray<any>(users);

        const userMap = new Map<number | string, any>(
          userArr.map(u => [u.userId ?? u.UserId ?? u.id, u])
        );

        this.feedbacks = fbArr.map(fb => {
          const FeedbackId   = fb.feedbackId   ?? fb.FeedbackId   ?? fb.id;
          const UserId       = fb.userId       ?? fb.UserId       ?? fb.farmerId ?? fb.sellerId;
          const FeedbackText = fb.feedbackText ?? fb.FeedbackText ?? fb.message  ?? '';
          const Date         = fb.date ?? fb.Date ?? fb.createdAt ?? fb.timestamp ?? null;

          const u        = userMap.get(UserId);
          const Username = u?.username ?? u?.Username ?? u?.name ?? '-';

          return { FeedbackId, UserId, Username, FeedbackText, Date };
        });

        this.filteredFeedbacks = [...this.feedbacks];
      },
      error: (err) => console.error('Failed to load feedbacks/users', err)
    });
  }

  // ── Grid Events ──

  onGridReady(params: any): void {
    this.gridApi       = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onCellClicked(event: any): void {
    const action = event.event?.target?.dataset?.action
                ?? event.event?.target?.closest('[data-action]')?.dataset?.action;
    if (action === 'viewUser') this.openModal(event.data);
  }

  onPageSizeChanged(): void {
    if (this.gridApi) {
      this.gridApi.paginationSetPageSize(Number(this.paginationPageSize));
    }
  }

  // ── Search / Filter ──

  filter(): void {
    const q = (this.searchTerm || '').trim().toLowerCase();
    this.filteredFeedbacks = this.feedbacks.filter(fb => {
      if (!q) return true;
      const hay = `${fb.Username ?? ''} ${fb.FeedbackText ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // ── Modal ──

  openModal(row: any): void {
    const id = row?.UserId ?? row?.farmerId ?? row?.sellerId;
    if (!id) return;

    this.feedbackService.getUserById(id).subscribe({
      next: (userProfile: any) => {
        this.selectedUser = {
          ...userProfile,
          username: userProfile.username     ?? userProfile.Username     ?? '-',
          name:     userProfile.name         ?? userProfile.Name         ?? '-',
          email:    userProfile.email        ?? userProfile.Email        ?? '-',
          phone:    userProfile.mobileNumber ?? userProfile.phone        ?? userProfile.Phone ?? '-'
        };
        this.showModal = true;
      },
      error: (err) => console.error('User profile not found', err)
    });
  }

  closeModal(): void {
    this.showModal    = false;
    this.selectedUser = null;
  }
}