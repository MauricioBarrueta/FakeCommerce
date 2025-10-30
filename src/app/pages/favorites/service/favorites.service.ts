import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductsData } from '../../products/interface/products.interface';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../../../shared/service/cart.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {  

  /* Almacena el estado de Favoritos */
  private favoritesSubject = new BehaviorSubject<ProductsData[]>([])
  favorites$ = this.favoritesSubject.asObservable()
  
  constructor(private cartService: CartService, @Inject(PLATFORM_ID) private platformId: object) {
    /* Recupera la lista de favoritos guardada en localStorage y actualiza el estado de BehaviorSubject */
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('favorites')
      if (saved) this.favoritesSubject.next(JSON.parse(saved))
    }
  }

  /* Guarda el contenido de Favoritos en localStorage */
  private saveToLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('favorites', JSON.stringify(this.favoritesSubject.value))
    }
  }

  /* Agrega o elimina el producto de la lista de Favoritos */
  toggleFavorite(product: ProductsData) {
    const items = [...this.favoritesSubject.value]
    /* Verifica si el producto ya existe o no, si existe, lo elimina, si no, lo agrega */
    const index = items.findIndex(p => p.id === product.id)
    index > -1 ? items.splice(index, 1) : items.push(product)

    /* Actualiza la memoria y el localStorage */
    this.favoritesSubject.next(items)
    this.saveToLocalStorage()
  }

  /* Verifica si el producto ya está agregado en Favoritos de acuerdo a su id */
  isFavorite(id: number): boolean {
    return this.favoritesSubject.value.some(p => p.id === id)
  }

  /* Agrega el producto al Carrito, solo si este aún no existe en el Carrito */
  addToCartFromFavorites(product: ProductsData) {
    const exists = this.cartService.isInCart(product.id)
    if (!exists) {
      this.cartService.addToCart(product)
    }
  }

  /* Elimina el producto de Favoritos y actualiza su estado y el localStorage */
  removeFromFavorites(id: number): void {
    const items = this.favoritesSubject.value.filter(p => p.id !== id)
    this.favoritesSubject.next(items)
    this.saveToLocalStorage()
  }
}