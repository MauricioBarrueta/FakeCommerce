import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ProductsData } from '../../pages/products/interface/products.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  /* Almacena el estado del Carrito */
  private cartItemsSubject = new BehaviorSubject<ProductsData[]>([])
  cartItems$ = this.cartItemsSubject.asObservable()

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    /* Se recuperan los productos guardados en el carrito y se actualiza el estado del BehaviorSubject */
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        this.cartItemsSubject.next(JSON.parse(savedCart))
      }
    }
  }

  /* Guarda el contenido del Carrito en localStorage */
  private saveCart() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(this.cartItemsSubject.value))
    }
  }

  /* Limpia el Carrito después de haber realizado la compra */
  clearCart(): Observable<ProductsData[]> {
    this.cartItemsSubject.next([])
    this.saveCart()
    /* Retorna un Observable vacío */
    return of([])
  }

  /* Verifica mediante el id si el producto ya está agregado en el Carrito o no */
  isInCart(id: number): boolean {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]') as ProductsData[]
    return cart.some(product => product.id === id)
  }

  /* Agrega el producto al Carrito desde Favorites, solamente cuando no se ha agregado */
  addToCartFromFavs(product: ProductsData) {
    const items = [...this.cartItemsSubject.value]
    const exists = items.find(p => p.id === product.id)
    if (!exists) {
      items.push(product)
      this.cartItemsSubject.next(items)
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }

  /* Actualiza la cantidad de un producto y actualiza su valor en memoria y en localStorage */
  updateQuantity(productId: number, quantity: number) {
    const updatedCart = this.cartItemsSubject.value.map(p =>
      p.id === productId ? { ...p, quantity } : p
    );
    this.cartItemsSubject.next(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  /* Agrega el producto seleccionado al Carrito */
  addToCart(product: ProductsData) {
    const items = [...this.cartItemsSubject.value]

    /* Verifica si ya existe el producto o no, si existe: suma la cantidad, si no: agrega el producto */
    const index = items.findIndex(p => p.id === product.id)
    index > -1 ? items[index].quantity! += product.quantity! : items.push(product) 

    /* Actualiza la memoria y localStorage */
    this.cartItemsSubject.next(items)
    localStorage.setItem('cart', JSON.stringify(items))
  }

  /* Elimina el producto del Carrito */
  removeFromCart(productId: number) {
    const items = this.cartItemsSubject.value.filter(p => p.id !== productId);
    this.cartItemsSubject.next(items);
    this.saveCart();
  }

  /* Incrementa o disminuye la cantidad del producto de acuerdo a su id */
  increaseQuantity(id: number) {
    /* Clona el producto para posteriormente actualizarlo */
    const items = [...this.cartItemsSubject.value]
    const item = items.find(p => p.id === id)
    if (item) {
      item.quantity = (item.quantity || 1) + 1
      this.cartItemsSubject.next(items)
      this.saveCart()
    }
  }

  decreaseQuantity(id: number) {
    /* Clona el producto para posteriormente actualizarlo */
    const items = [...this.cartItemsSubject.value]
    const item = items.find(p => p.id === id)
    
    if (item) {
      /* Disminuye la cantidad si esta es > 1 o borra el producto del carrito si esta es = 0 */
      if (item.quantity! > 1) {
        item.quantity!--
      } else {
        const index = items.indexOf(item)
        items.splice(index, 1)
      }

      this.cartItemsSubject.next(items)
      this.saveCart()
    }
  }
}