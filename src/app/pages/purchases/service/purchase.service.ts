import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductsData } from '../../products/interface/products.interface';
import { isPlatformBrowser } from '@angular/common';
import { PurchaseInterface } from '../interface/purchase.interface';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

   private purchasesSubject = new BehaviorSubject<PurchaseInterface[]>([]);
  purchases$ = this.purchasesSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('purchases');
      if (saved) this.purchasesSubject.next(JSON.parse(saved));
    }
  }

  private saveToLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('purchases', JSON.stringify(this.purchasesSubject.value));
    }
  }

  /** ✅ Se llama desde el checkout del carrito */
  addPurchaseFromCart(cartItems: ProductsData[], total: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const purchase: PurchaseInterface = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cartItems,
      total,
      status: 'Entregado' // luego puedes cambiar por 'Pendiente'
    };

    const updated = [...this.purchasesSubject.value, purchase];
    this.purchasesSubject.next(updated);
    this.saveToLocalStorage();
  }
  
  deletePurchase(id: number): void {
    const updated = this.purchasesSubject.value.filter(p => p.id !== id);
    this.purchasesSubject.next(updated);
    this.saveToLocalStorage();
  }

  clearPurchases(): void {
    this.purchasesSubject.next([]);
    localStorage.removeItem('purchases');
  }
  
}
