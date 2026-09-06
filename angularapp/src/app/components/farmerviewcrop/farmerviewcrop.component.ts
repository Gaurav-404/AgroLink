import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CropService } from '../../services/crop.service';
import { Crop } from '../../models/crop.model';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-farmerviewcrop',
  templateUrl: './farmerviewcrop.component.html',
  styleUrls: ['./farmerviewcrop.component.css']
})
export class FarmerviewcropComponent implements OnInit {

  crops: Crop[] = [];
  displayedKeys: string[] = [];
  idKey: string | null = null;

  loading = false;
  error: string | null = null;

  showDelete = false;
  deleteItem: any = null;

  private readonly idKeys = ['id', 'cropId', 'CropId', 'cropID', 'cropid', 'Id', 'ID'];
  private readonly userIdKeys = ['userId', 'UserId', 'UserID', 'userID', 'userid'];
  private readonly plantingDateKeys = ['plantingDate', 'PlantingDate', 'plantingdate', 'PLANTINGDATE'];

  private readonly labelMap: Record<string, string> = {
    cropName:     'Crop Name',
    CropName:     'Crop Name',
    cropname:     'Crop Name',
    CROPNAME:     'Crop Name',
    cropType:     'Crop Type',
    CropType:     'Crop Type',
    croptype:     'Crop Type',
    CROPTYPE:     'Crop Type',
    description:  'Description',
    Description:  'Description',
    DESCRIPTION:  'Description',
    plantingDate: 'Planting Date',
    PlantingDate: 'Planting Date',
    plantingdate: 'Planting Date',
    PLANTINGDATE: 'Planting Date',
  };

  constructor(
    private cropService: CropService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    const userIdStr = this.authService.getUserId();
    const userId = userIdStr !== null ? Number(userIdStr) : NaN;

    if (!Number.isFinite(userId)) {
      this.error = 'Unable to determine the logged-in user. Please sign in again.';
      this.loading = false;
      return;
    }

    this.cropService.getCropByUserID(userId).subscribe({
      next: (data) => {
        this.crops = [...(data || [])];
        this.setup();
        this.loading = false;
      },
      error: (_err) => {
        this.error = 'Failed to load crops';
        this.toastr.error(this.error, 'Error');
        this.loading = false;
      }
    });
  }

  setup(): void {
    if (!this.crops.length) {
      this.displayedKeys = [];
      this.idKey = null;
      return;
    }

    const sample = this.crops[0] as any;
    this.idKey = this.idKeys.find(k => k in sample) || null;

    const primitives = Object.keys(sample).filter(k => {
      const v = sample[k];
      const isPrimitive = v === null || v === undefined || typeof v !== 'object';
      const isUserId = this.userIdKeys.includes(k);
      return isPrimitive && !isUserId;
    });

    if (this.idKey && primitives.includes(this.idKey)) {
      this.displayedKeys = [this.idKey, ...primitives.filter(k => k !== this.idKey)];
    } else {
      this.displayedKeys = primitives;
    }
  }

  labelFor(key: string): string {
    return this.labelMap[key] ?? key;
  }

  isDateKey(key: string): boolean {
    return this.plantingDateKeys.includes(key);
  }

  formatDate(val: any): string {
    if (!val) return '—';
    const raw = typeof val === 'string' && !val.endsWith('Z') && !val.includes('+') ? val + 'Z' : val;
    const date = new Date(raw);
    if (isNaN(date.getTime())) return String(val);
    const day     = String(date.getDate()).padStart(2, '0');
    const month   = date.toLocaleString('en-GB', { month: 'short' });
    const year    = date.getFullYear();
    const hours   = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  }

  value(row: any, key: string) {
    return row ? row[key] : '';
  }

  getId(row: any) {
    const k = this.idKey || this.idKeys.find(x => x in row);
    return k ? row[k] : null;
  }

  edit(c: any) {
    const id = this.getId(c);
    if (id != null) {
      this.ngZone.run(() => this.router.navigate(['/farmer/edit-crop', id]));
    }
  }

  delete(c: any) {
    this.ngZone.run(() => {
      this.deleteItem = c;
      this.showDelete = true;
    });
  }

  confirm(): void {
    if (!this.deleteItem) return;

    const id = this.getId(this.deleteItem);
    if (id == null) return;

    this.showDelete = false;
    const idNum = Number(id);
    this.deleteItem = null;
    this.error = null;

    this.cropService.deleteCrop(idNum).subscribe({
      next: (res: string) => {
        this.crops = [...this.crops.filter(x => Number(this.getId(x)) !== idNum)];
        if (!this.crops.length) {
          this.displayedKeys = [];
          this.idKey = null;
        }
        this.toastr.success(res || 'Crop deleted successfully.', 'Success');
      },
      error: (err) => {
        const okLike =
          (typeof err?.error === 'string' && (err.status === 200 || err.status === 0)) ||
          (err?.status === 200);

        if (okLike) {
          this.crops = [...this.crops.filter(x => Number(this.getId(x)) !== idNum)];
          if (!this.crops.length) {
            this.displayedKeys = [];
            this.idKey = null;
          }
          this.toastr.success('Crop deleted successfully.', 'Success');
          return;
        }

        this.error = 'Delete failed';
        this.toastr.error(this.error, 'Error');
      }
    });
  }

  cancel() {
    this.showDelete = false;
    this.deleteItem = null;
    this.toastr.info('Delete cancelled.', 'Info');
  }

  // ── View Toggle ──────────────────────────────
  viewMode: 'card' | 'table' = 'card';

  // ── Keys without the ID field ─────────────────
  get visibleKeys(): string[] {
    return this.displayedKeys.filter(k => k !== this.idKey);
  }

  // ── AG Grid ───────────────────────────────────
  quickFilterText = '';

  agDefaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  // ── Inline-styled pill buttons (bypass AG Grid CSS isolation) ──
  private readonly _actionCellRenderer = (params: any) => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      height: 100%;
      padding: 0 4px;
    `;

    // ── Edit button ──
    const editBtn = document.createElement('button');
    editBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
           style="flex-shrink:0;">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      Edit
    `;
    const editBase = `
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: linear-gradient(135deg, #2d6a4f 0%, #52b788 100%);
      color: #ffffff;
      border: none;
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 5px 14px;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(45,106,79,0.32);
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
      outline: none;
    `;
    editBtn.style.cssText = editBase;

    editBtn.addEventListener('mouseenter', () => {
      editBtn.style.transform = 'translateY(-2px)';
      editBtn.style.boxShadow = '0 6px 16px rgba(45,106,79,0.42)';
      editBtn.style.opacity = '0.92';
    });
    editBtn.addEventListener('mouseleave', () => {
      editBtn.style.transform = 'translateY(0)';
      editBtn.style.boxShadow = '0 2px 8px rgba(45,106,79,0.32)';
      editBtn.style.opacity = '1';
    });
    editBtn.addEventListener('mousedown', () => {
      editBtn.style.transform = 'translateY(0) scale(0.96)';
      editBtn.style.boxShadow = '0 1px 4px rgba(45,106,79,0.2)';
    });
    editBtn.addEventListener('mouseup', () => {
      editBtn.style.transform = 'translateY(-2px)';
      editBtn.style.boxShadow = '0 6px 16px rgba(45,106,79,0.42)';
    });
    editBtn.addEventListener('click', () => this.edit(params.data));

    // ── Delete button ──
    const delBtn = document.createElement('button');
    delBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
           style="flex-shrink:0;">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
      Delete
    `;
    const delBase = `
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: linear-gradient(135deg, #dc2626 0%, #f87171 100%);
      color: #ffffff;
      border: none;
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 5px 14px;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(220,38,38,0.32);
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
      outline: none;
    `;
    delBtn.style.cssText = delBase;

    delBtn.addEventListener('mouseenter', () => {
      delBtn.style.transform = 'translateY(-2px)';
      delBtn.style.boxShadow = '0 6px 16px rgba(220,38,38,0.42)';
      delBtn.style.opacity = '0.92';
    });
    delBtn.addEventListener('mouseleave', () => {
      delBtn.style.transform = 'translateY(0)';
      delBtn.style.boxShadow = '0 2px 8px rgba(220,38,38,0.32)';
      delBtn.style.opacity = '1';
    });
    delBtn.addEventListener('mousedown', () => {
      delBtn.style.transform = 'translateY(0) scale(0.96)';
      delBtn.style.boxShadow = '0 1px 4px rgba(220,38,38,0.2)';
    });
    delBtn.addEventListener('mouseup', () => {
      delBtn.style.transform = 'translateY(-2px)';
      delBtn.style.boxShadow = '0 6px 16px rgba(220,38,38,0.42)';
    });
    delBtn.addEventListener('click', () => this.delete(params.data));

    wrapper.appendChild(editBtn);
    wrapper.appendChild(delBtn);
    return wrapper;
  };

  get agColumnDefs(): any[] {
    const cols: any[] = [
      {
        headerName: '#',
        valueGetter: 'node.rowIndex + 1',
        width: 60,
        sortable: false,
        filter: false,
        pinned: 'left',
        cellStyle: { color: '#6b6560', fontSize: '0.82rem', fontFamily: 'DM Sans, sans-serif' }
      }
    ];

    for (const key of this.visibleKeys) {
      const col: any = {
        field: key,
        headerName: this.labelFor(key),
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        minWidth: 130,
        cellStyle: { fontFamily: 'Lora, serif', fontSize: '0.875rem', color: '#1c1a17' }
      };
      if (this.isDateKey(key)) {
        col.valueFormatter = (params: any) => this.formatDate(params.value);
      }
      cols.push(col);
    }

    cols.push({
      headerName: 'Actions',
      pinned: 'right',
      width: 200,
      sortable: false,
      filter: false,
      cellRenderer: this._actionCellRenderer
    });

    return cols;
  }

  onSearchChange(val: string): void {
    this.quickFilterText = val;
  }
}