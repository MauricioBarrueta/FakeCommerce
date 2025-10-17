import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CartService } from '../../shared/service/cart.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsData } from '../products/interface/products.interface';
import { map, Observable, take } from 'rxjs';
import { NavService } from '../../shared/service/navigation.service';
import { PurchaseService } from '../purchases/service/purchase.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit {

  cartProducts$!: Observable<ProductsData[]>
  origTotal$!: Observable<number>
  totalSaved$!: Observable<number>
  totalDisc$!: Observable<number>

  toastMessage = '';
  showToast = false;

  constructor(private cartService: CartService, public navService: NavService, private purchaseService: PurchaseService, private ngZone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    /* Se inicializan los Observables que listan los productos agregados y calculan precios, descuentos y total */
    this.cartProducts$ = this.cartService.cartItems$
    this.origTotal$ = this.calcOrigTotal()
    this.totalSaved$ = this.calcTotalDisc()
    this.totalDisc$ = this.calcTotalWithDisc()
  }

  removeFromCart(id: number) {
    this.cartService.removeFromCart(id)
  }


   // Simular la compra
  // checkout() {
  //   this.cartProducts$.subscribe(items => {
  //     if (items.length === 0) {
  //       alert('El carrito está vacío 😅');
  //       return;
  //     }

  //     alert(
  //       `Compra simulada ✅\n` +
  //       `Productos: ${items.length}\n` +
  //       `Total a pagar: $${(items.reduce((acc, p) => acc + (p.price * (p.quantity ?? 1)), 0)).toFixed(2)}\n` +
  //       `Total ahorrado: $${(items.reduce((acc, p) => acc + (this.getOriginalPrice(p) - p.price) * (p.quantity ?? 1), 0)).toFixed(2)}`
  //     );

  //     // Vaciar carrito
  //     this.cartService.clearCart();
  //   }).unsubscribe(); // nos desuscribimos para no dejar subscripción abierta
  // }
  checkout() {
  this.cartProducts$.pipe(take(1)).subscribe(items => { // mejor take(1) que subscribe+unsubscribe manual
    if (items.length === 0) {
      alert('El carrito está vacío 😅');
      return;
    }

    // Calcular total
    const total = items.reduce((acc, p) => acc + (p.price * (p.quantity ?? 1)), 0);

    // Crear compra
    this.purchaseService.addPurchaseFromCart(items, total);

    // Vaciar carrito
    this.cartService.clearCart();

    // Alert opcional de simulación
    alert(
      `Compra simulada ✅\n` +
      `Productos: ${items.length}\n` +
      `Total a pagar: $${total.toFixed(2)}\n` +
      `Total ahorrado: $${items.reduce((acc, p) => acc + ((this.getOriginalPrice(p) - p.price) * (p.quantity ?? 1)), 0).toFixed(2)}`
    );
  });
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


  
  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 2500);
  }

  increaseQuantity(product: ProductsData) {
    this.cartService.increaseQuantity(product.id, product.stock);
  }

  decreaseQuantity(product: ProductsData) {
    const isDeleting = (product.quantity ?? 1) === 1;
    this.cartService.decreaseQuantity(product.id, true);

    if (isDeleting) {
      this.showToastMessage(`🗑️ "${product.title}" eliminado del carrito`);
    }
  }

  

  //! PASARLOS A cart.service YA QUE TAMBIÉN SE USAN EN products.html
//   increaseQuantity(product: ProductsData) {
//   const newQty = (product.quantity ?? 1) + 1;
//   if(newQty <= product.stock) {
//       this.cartService.updateQuantity(product.id, newQty);

//   }
// }
 

//   decreaseQuantity(product: ProductsData) {
//     const currentQty = product.quantity ?? 1;
//     const newQty = currentQty - 1;

//     if (newQty <= 0) {
//       this.cartService.removeFromCart(product.id);
//       this.showToastMessage(`🗑️ "${product.title}" eliminado del carrito`);
//     } else {
//       this.cartService.updateQuantity(product.id, newQty);
//     }
//   }
  
  //  toastMessage = '';
  // showToast = false;
  // private showToastMessage(message: string) {
  //   this.toastMessage = message;
  //   this.showToast = true;
  //   this.cd.detectChanges(); // 🔥 fuerza render inmediato

  //   setTimeout(() => {
  //     this.ngZone.run(() => {
  //       this.showToast = false;
  //       this.cd.detectChanges(); // 🔥 actualiza vista para ocultar
  //     });
  //   }, 3000);
  // }
}