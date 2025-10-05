import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { isPlatformBrowser } from '@angular/common';
import { ProductsData } from '../../pages/products/interface/products.interface';
import { ProfileInterface } from '../../pages/profile/interface/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<ProfileInterface | null>(null)
  user$ = this.currentUserSubject.asObservable()

  /* Para evitar que se pierdan los productos que se quieren agregar sin haber iniciado sesión */
  private pendingProductSubject = new BehaviorSubject<ProductsData | null>(null)
  pendingProduct$ = this.pendingProductSubject.asObservable()

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  logIn(username: string, password: string): Observable<ProfileInterface> {
    return this.http
      .post<ProfileInterface>(`${environment.url}/auth/login`, { username, password })
      .pipe(
        tap((user) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        })
      );
  }

  /* Verifica si se a iniciado sesión */
  isUserLogged(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /* Cierra la sesión, eliminando el registro de localStorage y limpiando la memoria de BehaviorSubject */
  logOut(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  // Producto pendiente
  setPendingProduct(product: ProductsData) {
    this.pendingProductSubject.next(product);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pendingProduct', JSON.stringify(product));
    }
  }

  getPendingProduct(): ProductsData | null {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('pendingProduct');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  clearPendingProduct() {
    this.pendingProductSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('pendingProduct');
    }
  }
}