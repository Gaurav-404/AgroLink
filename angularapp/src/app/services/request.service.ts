import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// ⬇️ Type-only import + alias to avoid clashing with DOM Request
import type { Request as RequestModel } from '../models/request.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  public apiUrl = environment.apiUrl;

  constructor(public http: HttpClient) {}

  // Create
// RequestService
addRequest(request: RequestModel): Observable<string> {
  return this.http.post(`${this.apiUrl}/requests`, request, {
    responseType: 'text'
  });
}

  
  // Read (by user)
  getRequestsByUserId(userId: string): Observable<RequestModel[]> {
    return this.http.get<RequestModel[]>(`${this.apiUrl}/requests/user/${userId}`);
  }

  // Read (all)
  getAllRequest(): Observable<RequestModel[]> {
    return this.http.get<RequestModel[]>(`${this.apiUrl}/requests`);
  }

  // Update (status or full request as your API expects)
  updateRequestStatus(
    requestId: number,
    request: Partial<RequestModel> | { status: string } | any
  ): Observable<string> {
    return this.http.put(`${this.apiUrl}/requests/${requestId}`, request, {
      responseType: 'text'
    });
  }
  

  // Delete
  deleteRequest(requestId: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/requests/${requestId}`, {
      responseType: 'text'
    });
  }
  
}