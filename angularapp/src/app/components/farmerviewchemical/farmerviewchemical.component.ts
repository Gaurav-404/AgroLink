import { Component, NgZone, OnInit } from '@angular/core';
import { AgrochemicalService } from '../../services/agrochemical.service';
import { CropService } from 'src/app/services/crop.service';
import { RequestService } from 'src/app/services/request.service';
import { AgroChemical } from '../../models/agrochemical.model';
import { Crop } from 'src/app/models/crop.model';
import { Request } from 'src/app/models/request.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-farmerviewchemical',
  templateUrl: './farmerviewchemical.component.html',
  styleUrls: ['./farmerviewchemical.component.css']
})
export class FarmerviewchemicalComponent implements OnInit {
  farmerId = Number(localStorage.getItem('userId'));

  chemicals: AgroChemical[] = [];
  crops: Crop[] = [];
  filtered: AgroChemical[] = [];

  searchTerm = '';
  quickFilterText = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  infoOpen = false;
  selectedChemical: AgroChemical | null = null;

  requestOpen = false;
  requestModel: { cropId: number | null; quantity: number | null; agroChemicalId: number | null } = {
    cropId: null,
    quantity: null,
    agroChemicalId: null
  };
  requesting = false;

  constructor(
    private agroService: AgrochemicalService,
    private cropService: CropService,
    private requestService: RequestService,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.errorMsg = '';

    this.agroService.getAllAgroChemicals().subscribe({
      next: (list: any[]) => {
        this.chemicals = (list || []).map(c => ({
          ...c,
          AgroChemicalId: c.agroChemicalId,
          Name: c.name,
          Brand: c.brand,
          Category: c.category,
          Description: c.description,
          Unit: c.unit,
          PricePerUnit: c.pricePerUnit,
          Image: c.image
        }));
        this.filtered = [...this.chemicals];
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load agrochemicals.';
        this.loading = false;
      }
    });

    this.cropService.getCropByUserID(this.farmerId).subscribe({
      next: (res) => this.crops = res,
      error: () => console.error('Failed to load crops')
    });
  }

  applyFilter(q: string): void {
    const s = (q || '').toLowerCase().trim();
    this.filtered = !s ? [...this.chemicals] : this.chemicals.filter(c =>
      [c.Name, c.Brand, c.Category, c.Unit].some(x => (x || '').toLowerCase().includes(s))
    );
  }

  onSearchChange(val: string): void {
    this.quickFilterText = val;
  }

  openInfo(c: AgroChemical): void {
    this.ngZone.run(() => {
      this.selectedChemical = c;
      this.infoOpen = true;
    });
  }

  closeInfo(): void {
    this.ngZone.run(() => {
      this.infoOpen = false;
      this.selectedChemical = null;
    });
  }

  openRequest(c: AgroChemical): void {
    this.ngZone.run(() => {
      this.selectedChemical = c;
      this.requestModel = { cropId: null, quantity: null, agroChemicalId: c.AgroChemicalId };
      this.requestOpen = true;
    });
  }

  closeRequest(): void {
    this.ngZone.run(() => {
      this.requestOpen = false;
      this.selectedChemical = null;
      this.requestModel = { cropId: null, quantity: null, agroChemicalId: null };
      this.requesting = false;
    });
  }

  submitRequest(form: any): void {
    if (!this.requestModel.cropId || !this.requestModel.quantity || !this.requestModel.agroChemicalId) {
      this.toastr.error('Please fill all fields.', 'Validation Error');
      return;
    }

    const payload: Request = {
      RequestId: 0,
      CropId: this.requestModel.cropId,
      UserId: this.farmerId,
      Quantity: Number(this.requestModel.quantity),
      AgroChemicalId: this.requestModel.agroChemicalId,
      Status: 'Pending',
      RequestDate: new Date().toISOString()
    };

    this.requesting = true;
    this.requestService.addRequest(payload).subscribe({
      next: () => {
        this.toastr.success('Request sent successfully!', 'Success');
        this.requesting = false;
        this.closeRequest();
      },
      error: (err) => {
        console.error('Failed to submit request', err);
        this.toastr.error('Failed to submit request. Please try again.', 'Error');
        this.requesting = false;
      }
    });
  }

  // ── AG Grid ────────────────────────────────────

  agDefaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  private readonly _imageCellRenderer = (params: any) => {
    if (!params.value) return '—';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;height:100%;';
    const img = document.createElement('img');
    img.src = params.value;
    img.alt = 'Chemical image';
    img.style.cssText = `
      width: 44px; height: 44px; object-fit: cover;
      border-radius: 7px; border: 1px solid #e0ddd5; display: block;
    `;
    wrapper.appendChild(img);
    return wrapper;
  };

  // Properly centred category badge
  private readonly _categoryRenderer = (params: any) => {
    if (!params.value) return '—';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;height:100%;';
    const span = document.createElement('span');
    span.textContent = params.value;
    span.style.cssText = `
      display: inline-block;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 4px 13px;
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif;
      white-space: nowrap;
      line-height: 1.4;
    `;
    wrapper.appendChild(span);
    return wrapper;
  };

  private readonly _priceRenderer = (params: any) => {
    if (params.value == null) return '—';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;height:100%;';
    const span = document.createElement('span');
    span.textContent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(params.value);
    span.style.cssText = `
      color: #1a4731; font-weight: 700;
      font-family: 'Lora', serif; font-size: 0.97rem;
    `;
    wrapper.appendChild(span);
    return wrapper;
  };

  // NgZone-safe action buttons
  private readonly _actionCellRenderer = (params: any) => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;gap:8px;align-items:center;height:100%;padding:0 4px;';

    const makeBtn = (
      label: string,
      gradient: string,
      shadow: string,
      shadowHover: string,
      svgPath: string,
      onClick: () => void
    ) => {
      const btn = document.createElement('button');
      btn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
             style="flex-shrink:0;vertical-align:middle;">${svgPath}</svg>
        ${label}
      `;
      btn.style.cssText = `
        display: inline-flex; align-items: center; gap: 5px;
        background: ${gradient}; color: #fff; border: none;
        border-radius: 999px; font-family: 'DM Sans', sans-serif;
        font-size: 0.8rem; font-weight: 600; letter-spacing: 0.02em;
        padding: 6px 16px; cursor: pointer; white-space: nowrap;
        box-shadow: ${shadow}; outline: none;
      `;
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = shadowHover;
        btn.style.opacity = '0.92';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = shadow;
        btn.style.opacity = '1';
      });
      btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.96)';
      });
      btn.addEventListener('mouseup', () => {
        btn.style.transform = 'translateY(-2px)';
      });
      // NgZone.run() is the critical fix — DOM events fire outside Angular zone
      btn.addEventListener('click', () => this.ngZone.run(onClick));
      return btn;
    };

    const detailBtn = makeBtn(
      'Details',
      'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)',
      '0 2px 8px rgba(29,78,216,0.30)',
      '0 6px 16px rgba(29,78,216,0.42)',
      `<circle cx="12" cy="12" r="10"/>
       <line x1="12" y1="8" x2="12" y2="8"/>
       <line x1="12" y1="12" x2="12" y2="16"/>`,
      () => this.openInfo(params.data)
    );

    const requestBtn = makeBtn(
      'Request',
      'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)',
      '0 2px 8px rgba(45,106,79,0.30)',
      '0 6px 16px rgba(45,106,79,0.44)',
      `<line x1="22" y1="2" x2="11" y2="13"/>
       <polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
      () => this.openRequest(params.data)
    );

    wrapper.appendChild(detailBtn);
    wrapper.appendChild(requestBtn);
    return wrapper;
  };

  get agColumnDefs(): any[] {
    const center = 'display:flex;align-items:center;height:100%;';
    return [
      {
        headerName: '#',
        valueGetter: 'node.rowIndex + 1',
        width: 62, sortable: false, filter: false, pinned: 'left',
        cellStyle: { color: '#6b6560', fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center' }
      },
      {
        field: 'name', headerName: 'Name', flex: 1, minWidth: 150,
        cellStyle: { fontFamily: 'Lora, serif', fontSize: '0.97rem', color: '#1c1a17', fontWeight: '600', display: 'flex', alignItems: 'center' }
      },
      {
        field: 'brand', headerName: 'Brand', flex: 1, minWidth: 130,
        cellStyle: { fontFamily: 'Lora, serif', fontSize: '0.95rem', color: '#374151', display: 'flex', alignItems: 'center' }
      },
      {
        field: 'category', headerName: 'Category', flex: 1, minWidth: 145,
        cellRenderer: this._categoryRenderer, filter: true
      },
      {
        field: 'description', headerName: 'Description', flex: 2, minWidth: 180,
        cellStyle: { fontFamily: 'Lora, serif', fontSize: '0.92rem', color: '#6b6560', display: 'flex', alignItems: 'center' },
        tooltipField: 'description'
      },
      {
        field: 'unit', headerName: 'Unit', width: 95,
        cellStyle: { fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem', color: '#374151', display: 'flex', alignItems: 'center' }
      },
      {
        field: 'pricePerUnit', headerName: 'Price / Unit', width: 145,
        sortable: true, filter: 'agNumberColumnFilter',
        cellRenderer: this._priceRenderer
      },
      {
        field: 'image', headerName: 'Image', width: 95,
        sortable: false, filter: false,
        cellRenderer: this._imageCellRenderer
      },
      {
        headerName: 'Actions', pinned: 'right', width: 225,
        sortable: false, filter: false,
        cellRenderer: this._actionCellRenderer
      }
    ];
  }
}