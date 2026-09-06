import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AgroChemical } from '../models/agrochemical.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgrochemicalService {

  public apiUrl = `${environment.apiUrl}/agrochemicals`;

  constructor(private ser: HttpClient) {}

  addAgroChemical(requestObject: AgroChemical): Observable<any> {
    return this.ser.post<any>(`${this.apiUrl}`, requestObject);
  }

  getAgroChemicalByUserID(id: number): Observable<AgroChemical[] | AgroChemical> {
    return this.ser.get<AgroChemical[] | AgroChemical>(`${this.apiUrl}/${id}`);
  }

  getAgroChemicalById(id: number | string): Observable<AgroChemical> {
    return this.ser.get<AgroChemical>(`${this.apiUrl}/${id}`);
  }

  getAllAgroChemicals(): Observable<AgroChemical[]> {
    return this.ser.get<AgroChemical[]>(`${this.apiUrl}`);
  }

  deleteAgroChemical(agroChemicalId: string | number): Observable<string> {
    return this.ser.delete(`${this.apiUrl}/${agroChemicalId}`, { responseType: 'text' });
  }
  

  updateAgroChemical(id: string | number, requestObject: AgroChemical): Observable<any> {
    return this.ser.put<any>(`${this.apiUrl}/${id}`, requestObject);
  }
}