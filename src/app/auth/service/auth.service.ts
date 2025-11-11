import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { isPlatformBrowser } from '@angular/common';
import { ProductsData } from '../../pages/products/interface/products.interface';
import { ProfileInterface } from '../../pages/profile/interface/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //? BehaviorSubject es un tipo de Observable que siempre almacena y emite su último valor a todas las suscripciones

  /* Almacena el estado del usuario (con sesión iniciada o no iniciada) */
  private currentUserSubject = new BehaviorSubject<ProfileInterface | null>(null)
  user$ = this.currentUserSubject.asObservable()

  /* Almacena el estado del producto que se quiere agregar al carrito cuando no ha iniciado sesión */
  private pendingProductSubject = new BehaviorSubject<ProductsData | null>(null)
  pendingProduct$ = this.pendingProductSubject.asObservable()

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      /* Se recupera la sesión del usuario guardada en localStorage para mantener la sesión activa */
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser))
      }
    }
  }

  /* Verifica si las credenciales son validas para iniciar sesión */
  logIn(username: string, password: string): Observable<ProfileInterface> {
    return this.http.post<ProfileInterface>(`${environment.url}/auth/login`, { username, password })
      .pipe(
        tap(user => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(user))
          }
          this.currentUserSubject.next(user)
        }),
        catchError(err => {
          return throwError(() => err)
        })
      );
  }

  /* Verifica si la sesión sigue activa */
  isUserLogged(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /* Cierra la sesión, eliminando el registro de localStorage y limpiando la memoria de BehaviorSubject */
  logOut(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user')
    }
    this.currentUserSubject.next(null)
  }

  /* Almacena temporalmente y actualiza el estado del producto que se quizo agregar sin haber iniciado sesión  */
  setPendingProduct(product: ProductsData) {
    this.pendingProductSubject.next(product)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pendingProduct', JSON.stringify(product))
    }
  }

  /* Verifica si existe un producto pendiente en localStorage y lo devuelve como objeto (ProductsData) o como 'null' si no existe */
  getPendingProduct(): ProductsData | null {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('pendingProduct')
      return stored ? JSON.parse(stored) : null
    }
    return null
  }

  /* Elimina el producto pendiente del localStorage y cambia el estado a 'null' una vez agregado al carrito */
  clearPendingProduct() {
    this.pendingProductSubject.next(null)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('pendingProduct')
    }
  }
}