import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  private roleKey = 'userRole';
  private userIdKey = 'userId';
  private usernameKey = 'userName';


  private userRoleSubject = new BehaviorSubject<string | null>(this.getRole());
  private loggedInSubject = new BehaviorSubject<boolean>(!!this.getToken());
  private usernameSubject = new BehaviorSubject<string | null>(this.getUsername());

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);

          const decoded = this.decodeToken(response.token);
          if (decoded) {
            if (decoded.role) {
              localStorage.setItem(this.roleKey, decoded.role);
              this.userRoleSubject.next(decoded.role);
            }

            if (decoded.sub) {
              localStorage.setItem(this.userIdKey, decoded.sub);
            } else if (decoded.userId) {
              localStorage.setItem(this.userIdKey, decoded.userId);
            }

            if (decoded.userName) {
              localStorage.setItem(this.usernameKey, decoded.userName);
              this.usernameSubject.next(decoded.username);
            }
          }

          this.loggedInSubject.next(true);
        }
      })
    );
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (e) {
      console.error('Invalid token', e);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.usernameKey);
    this.userRoleSubject.next(null);
    this.loggedInSubject.next(false);
    this.usernameSubject.next(null);
  }


  getUserRoleObservable(): Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }

  getLoggedInObservable(): Observable<boolean> {
    return this.loggedInSubject.asObservable();
  }

  getUsernameObservable(): Observable<string | null> {
    return this.usernameSubject.asObservable();
  }

  setUserRole(role: string | null): void {
    this.userRoleSubject.next(role);
  }

  setUsername(username: string | null): void {
    this.usernameSubject.next(username);
  }

  register(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
