import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ProductsData } from '../../pages/products/interface/products.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItemsSubject = new BehaviorSubject<ProductsData[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // Cargar carrito desde localStorage si existe
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItemsSubject.next(JSON.parse(savedCart));
      }
    }
  }

  private saveCart() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(this.cartItemsSubject.value));
    }
  }

  addToCart(product: ProductsData): Observable<ProductsData[]> {
    const items = [...this.cartItemsSubject.value, product];
    this.cartItemsSubject.next(items);
    this.saveCart();
    return of(items); // retorna observable
  }

  // removeFromCart(id: number): Observable<ProductsData[]> {
  //   const items = this.cartItemsSubject.value.filter(p => p.id !== id);
  //   this.cartItemsSubject.next(items);
  //   this.saveCart();
  //   return of(items); // retorna observable
  // }

  clearCart(): Observable<ProductsData[]> {
    this.cartItemsSubject.next([]);
    this.saveCart();
    return of([]); // retorna observable vacío
  }

  /* Verifica si el producto ya está agregado en el carrito */
  isInCart(id: number): boolean {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]') as ProductsData[]
    return cart.some(product => product.id === id)
  }

  addToCartFromFavs(product: ProductsData) {
    const items = [...this.cartItemsSubject.value];
    const exists = items.find(p => p.id === product.id);
    if (!exists) {
      items.push(product);
      this.cartItemsSubject.next(items);
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }



  updateQuantity(productId: number, quantity: number) {
  const updatedCart = this.cartItemsSubject.value.map(p =>
    p.id === productId ? { ...p, quantity } : p
  );
  this.cartItemsSubject.next(updatedCart);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
}

removeFromCart(productId: number) {
  const updatedCart = this.cartItemsSubject.value.filter(p => p.id !== productId);
  this.cartItemsSubject.next(updatedCart);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
}


  increaseQuantity(productId: number, maxStock: number) {
    const items = this.cartItemsSubject.value;
    const item = items.find(p => p.id === productId);
    if (!item) return;
    if ((item.quantity ?? 1) < maxStock) {
      item.quantity!++;
      this.cartItemsSubject.next([...items]);
      this.saveCart();
    }
  }

  decreaseQuantity(productId: number, isCart: boolean = false) {
    let items = this.cartItemsSubject.value;
    const item = items.find(p => p.id === productId);
    if (!item) return;

    if ((item.quantity ?? 1) > 1) {
      item.quantity!--;
    } else if (isCart) {
      // eliminar solo si estamos en /cart
      items = items.filter(p => p.id !== productId);
    } else {
      item.quantity = 1;
    }

    this.cartItemsSubject.next([...items]);
    this.saveCart();
  }












}