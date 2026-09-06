import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Feedback} from '../models/feedback.model';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  public apiUrl=environment.apiUrl;

  constructor(public http:HttpClient){ }

  public sendFeedback(feedback:Feedback):Observable<Feedback>{
    return this.http.post<Feedback>(`${this.apiUrl}/Feedback`,feedback);
  }

  public getAllFeedbacksByUserId(userId:string):Observable<Feedback>{
    var j = localStorage.getItem('authToken');
    console.log(j);
    return this.http.get<Feedback>(`${this.apiUrl}/Feedback/user/${userId}`)
  }

  public getAll():Observable<Feedback[]>{
    return this.http.get<Feedback[]>(`${this.apiUrl}/Feedback`);
  }
  public deleteFeedback(feedbackId: number) {
    return this.http.delete(`${this.apiUrl}/Feedback?id=${feedbackId}`);
  }

  public getUserById(id: any): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/Feedback/User/${id}`);
  }
  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/Feedback/User`);
  }



}
