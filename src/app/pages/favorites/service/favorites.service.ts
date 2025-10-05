import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductsData } from '../../products/interface/products.interface';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../../../shared/service/cart.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {  

  private favoritesSubject = new BehaviorSubject<ProductsData[]>([]);
  favorites$ = this.favoritesSubject.asObservable();
  
  constructor(private cartService: CartService, @Inject(PLATFORM_ID) private platformId: object) {
    // Cargar favoritos desde localStorage solo si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('favorites');
      if (saved) this.favoritesSubject.next(JSON.parse(saved));
    }
  }

  private saveToLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('favorites', JSON.stringify(this.favoritesSubject.value));
    }
  }

  toggleFavorite(product: ProductsData) {
    const items = [...this.favoritesSubject.value];
    const index = items.findIndex(p => p.id === product.id);

    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.push(product);
    }

    this.favoritesSubject.next(items);
    this.saveToLocalStorage();
  }

  isFavorite(productId: number): boolean {
    return this.favoritesSubject.value.some(p => p.id === productId);
  }

  addToCartFromFavorites(product: ProductsData) {
    const exists = this.cartService.isInCart(product.id);
    if (!exists) {
      this.cartService.addToCart(product);
    }
  }

  /** Quitar un producto de favoritos directamente */
  removeFromFavorites(productId: number): void {
    const items = this.favoritesSubject.value.filter(p => p.id !== productId);
    this.favoritesSubject.next(items);
    this.saveToLocalStorage();
  }
}
