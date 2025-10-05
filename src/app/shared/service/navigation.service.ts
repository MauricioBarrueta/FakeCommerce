import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';
import { ProductsData } from '../../pages/products/interface/products.interface';
import { CartService } from './cart.service';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  // private favoritesSubject = new BehaviorSubject<ProductsData[]>([])
  // favorites$ = this.favoritesSubject.asObservable()



  // //04/10/25
  // private cartSubject = new BehaviorSubject<ProductsData[]>([]);
  // cart$ = this.cartSubject.asObservable();



  constructor(private authService: AuthService, private cartService: CartService, private router: Router, @Inject(PLATFORM_ID) private platformId: object) {
    
    // // Cargar favoritos desde localStorage al iniciar
    // if (isPlatformBrowser(this.platformId)) {
    //   const saved = localStorage.getItem('favorites');
    //   if (saved) this.favoritesSubject.next(JSON.parse(saved));

    //   //04/10/25
    //   const cart = localStorage.getItem('cart');
    //   if (cart) this.cartSubject.next(JSON.parse(cart))
    // }
  }
  
  getProductDetails(id: number) {
    this.router.navigate([`product-detail`], { queryParams: { id: `${id}` } })
  }

  /* Manda el id del usuario para mostrar su información */
  getProfileDetails(id: number) {
    this.router.navigate(['profile'], { queryParams: {id: `${id}`} })
  }

  /* Agrega el producto al carrito, controla si se ha iniciado sesión o no, almacena el producto cuando no hay una sesión activa */
  onAddToCart(product: ProductsData) {
    if (this.authService.isUserLogged()) {
      this.cartService.addToCart(product)
      this.router.navigate(['/cart'])
    } else {
      /* Guarda el producto en localStorage y lo agrega una vez iniciada la sesión */
      this.authService.setPendingProduct(product)
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } })
    }
  }



  // private saveToLocalStorage() {
  //   if (isPlatformBrowser(this.platformId)) {
  //     localStorage.setItem('favorites', JSON.stringify(this.favoritesSubject.value));
  //   }
  // }

  // toggleFavorite(product: ProductsData) {
  //   const items = [...this.favoritesSubject.value];
  //   const index = items.findIndex(p => p.id === product.id);

  //   if (index > -1) items.splice(index, 1);
  //   else items.push(product);

  //   this.favoritesSubject.next(items);
  //   this.saveFavorites();
  // }

  //  isFavorite(id: number): boolean {
  //   return this.favoritesSubject.value.some(p => p.id === id);
  // }

  // private saveFavorites() {
  //   if (isPlatformBrowser(this.platformId)) {
  //     localStorage.setItem('favorites', JSON.stringify(this.favoritesSubject.value));
  //   }
  // }

  //! QUEDA PENDIENTE QUE HAGA OTRO MÉTODO addToCart ESPECÍFICAMENTE PARA favorites, YA QUE LA SOLUCIÓN ACTUAL ESTÁ MODIFICANDO EL PRINCIPAL
  //! SI TIENE QUE REDIRECCIONAR A CART EN LOS DEMÁS Y ME LO ESTÁ QUITANDO, CHECAR ESO




  // isInCart(id: number): boolean {
  //   return this.cartSubject.value.some(p => p.id === id);
  // }
  



}
