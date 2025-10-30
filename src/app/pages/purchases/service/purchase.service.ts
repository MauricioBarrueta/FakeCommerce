import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductsData } from '../../products/interface/products.interface';
import { isPlatformBrowser } from '@angular/common';
import { PurchaseInterface } from '../interface/purchase.interface';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  /* Almacena el estado de las compras */
  private purchasesSubject = new BehaviorSubject<PurchaseInterface[]>([])
  purchases$ = this.purchasesSubject.asObservable()

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    /* Recupera los registros de compra guardados en el localStorage y actualiza el estado del BehaviorSubject */
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('purchases')
      if (saved) this.purchasesSubject.next(JSON.parse(saved))
    }
  }

  /* Guarda el contenido de Compras en el localStorage */
  private saveToLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('purchases', JSON.stringify(this.purchasesSubject.value))
    }
  }

  /* Agrega una compra a la lista, actualiza el estado en memoria y se guarda en localStorage */
  addPurchaseFromCart(cart: ProductsData[], total: number): void {
    if (!isPlatformBrowser(this.platformId)) return

    /* Datos de la compra */
    const purchase: PurchaseInterface = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cart,
      total,
      status: 'Entregado'
    };

    /* Se agrega la nueva compra y se actualiza en memoria */
    const updated = [...this.purchasesSubject.value, purchase]
    this.purchasesSubject.next(updated)
    this.saveToLocalStorage()
  }
  
  /* Borra la compra de acuerdo a su id */
  deletePurchase(id: number): void {
    /* Filtra todas las compras excepto la que coincida con el id */
    const updated = this.purchasesSubject.value.filter(p => p.id !== id)
    this.purchasesSubject.next(updated)
    this.saveToLocalStorage()
  }

  /* Borra toda la lista de compras, limpia la memoria y el localStorage */
  clearPurchases(): void {
    this.purchasesSubject.next([])
    localStorage.removeItem('purchases')
  }  
}