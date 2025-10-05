import { Component, OnInit } from '@angular/core';
import { CartService } from '../../shared/service/cart.service';
import { CommonModule } from '@angular/common';
import { ProductsData } from '../products/interface/products.interface';
import { map, Observable } from 'rxjs';
import { NavService } from '../../shared/service/navigation.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit {

  cartProducts$!: Observable<ProductsData[]>
  origTotal$!: Observable<number>
  totalSaved$!: Observable<number>
  totalDisc$!: Observable<number>

  constructor(private cartService: CartService, public navService: NavService) {}

  ngOnInit(): void {
    /* Se inicializan los Observables que listan los productos agregados y calculan precios, descuentos y total */
    this.cartProducts$ = this.cartService.cartItems$
    this.origTotal$ = this.calcOrigTotal()
    this.totalSaved$ = this.calcTotalDisc()
    this.totalDisc$ = this.calcTotalWithDisc()
  }

  removeFromCart(id: number) {
    this.cartProducts$ = this.cartService.removeFromCart(id)
  }


   // Simular la compra
  checkout() {
    this.cartProducts$.subscribe(items => {
      if (items.length === 0) {
        alert('El carrito está vacío 😅');
        return;
      }

      alert(
        `Compra simulada ✅\n` +
        `Productos: ${items.length}\n` +
        `Total a pagar: $${(items.reduce((acc, p) => acc + (p.price * (p.quantity ?? 1)), 0)).toFixed(2)}\n` +
        `Total ahorrado: $${(items.reduce((acc, p) => acc + (this.getOriginalPrice(p) - p.price) * (p.quantity ?? 1), 0)).toFixed(2)}`
      );

      // Vaciar carrito
      this.cartService.clearCart();
    }).unsubscribe(); // nos desuscribimos para no dejar subscripción abierta
  }

  calcOrigTotal(): Observable<number> {
    return this.cartProducts$.pipe(
      map(items =>
        +items
          .reduce((acc, p) => acc + this.getOriginalPrice(p) * (p.quantity ?? 1), 0)
          .toFixed(2)
      )
    );
  }

  calcTotalDisc(): Observable<number> {
    return this.totalSaved$ = this.cartProducts$
      .pipe(
        map(items => + items
          .reduce((acc, p) => acc + (this.getOriginalPrice(p) - p.price) * (p.quantity ?? 1), 0 )
          .toFixed(2)
        )
      );
  }

  calcTotalWithDisc(): Observable<number>{
    return  this.totalDisc$ = this.cartProducts$
    .pipe(
      map(items => + items
        .reduce((acc, p) => acc + (p.price * (p.quantity ?? 1)), 0)
        .toFixed(2)
      )
    );
  }

  /* Calcula el precio original del producto sin aplicar el descuento (totalOriginal = totalConDescuento / (1 - (descuento (%) / 100)) */
  getOriginalPrice(product: ProductsData): number {
    return +(product.price / (1 - product.discountPercentage / 100)).toFixed(2)
  }
}