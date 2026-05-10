import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from './auth.models';

const TOKEN_KEY = 'finanzas.auth.token';
const USER_KEY = 'finanzas.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly tokenState = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly userState = signal<AuthUser | null>(this.readStoredUser());
  private firebaseApp: FirebaseApp | null = null;
  private firebaseAuth: Auth | null = null;

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenState());

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(tap((response) => this.storeSession(response)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload).pipe(tap((response) => this.storeSession(response)));
  }

  async loginWithGoogle(): Promise<void> {
    const auth = this.getFirebaseAuth();
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const idToken = await credential.user.getIdToken();
    const response = await new Promise<AuthResponse>((resolve, reject) => {
      this.http.post<AuthResponse>(`${this.baseUrl}/auth/firebase`, { idToken }).subscribe({ next: resolve, error: reject });
    });
    this.storeSession(response);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenState.set(null);
    this.userState.set(null);
    this.router.navigate(['/login']);
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.tokenState.set(response.accessToken);
    this.userState.set(response.user);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  private getFirebaseAuth(): Auth {
    if (!environment.firebase.apiKey || !environment.firebase.projectId) {
      throw new Error('Configura Firebase en environment.ts para habilitar Google.');
    }

    this.firebaseApp ??= initializeApp(environment.firebase);
    this.firebaseAuth ??= getAuth(this.firebaseApp);
    return this.firebaseAuth;
  }
}
