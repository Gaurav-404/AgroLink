import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crop } from '../models/crop.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CropService {

  private readonly apiUrl: string = environment.apiUrl;

  constructor(private ser: HttpClient) {}

  // Create
  addCrop(requestObject: Crop): Observable<string> {
    return this.ser.post(`${this.apiUrl}/crops`, requestObject, {
      responseType: 'text'
    });
  }

  // Read (by user)
  getCropByUserID(id: number): Observable<Crop[]> {
    return this.ser.get<Crop[]>(`${this.apiUrl}/crops/user/${id}`);
  }

  // Read (by id)
  getCropById(id: number): Observable<Crop> {
    return this.ser.get<Crop>(`${this.apiUrl}/crops/${id}`);
  }

  // Read (all)
  getAllCrops(): Observable<Crop[]> {
    return this.ser.get<Crop[]>(`${this.apiUrl}/crops`);
  }

  // Delete
  deleteCrop(cropId: number): Observable<string> {
    return this.ser.delete(`${this.apiUrl}/crops/${cropId}`, {
      responseType: 'text'
    });
  }

  // Update
  updateCrop(id: number, requestObject: Crop): Observable<string> {
    return this.ser.put(`${this.apiUrl}/crops/${id}`, requestObject, {
      responseType: 'text'
    });
  }
}
