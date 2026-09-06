// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../models/chat.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<{ reply: string }> {
    
    return this.http.post<{ reply: string }>(`${this.apiUrl}/chat/send`, { message });
  }
}


export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}
