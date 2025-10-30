import { Component, OnInit } from '@angular/core';
import { CartService } from '../../shared/service/cart.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsData } from '../products/interface/products.interface';
import { map, Observable, take } from 'rxjs';
import { NavService } from '../../shared/service/navigation.service';
import { PurchaseService } from '../purchases/service/purchase.service';
import { ModalService } from '../../shared/modal/service/modal.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
})
export class Cart implements OnInit {

  cartProducts$!: Observable<ProductsData[]>
  origTotal$!: Observable<number>
  totalSaved$!: Observable<number>
  totalDisc$!: Observable<number>

  isCartEmpty: boolean = true

  constructor(private cartService: CartService, public navService: NavService, private purchaseService: PurchaseService, private modalService: ModalService) {}

  ngOnInit(): void {
    /* Se inicializan los Observables que listan los productos agregados y calculan precios, descuentos y total */
    this.cartProducts$ = this.cartService.cartItems$
    this.origTotal$ = this.calcOrigTotal()
    this.totalSaved$ = this.calcTotalDisc()
    this.totalDisc$ = this.calcTotalWithDisc()

    /* Controla el estado del botón 'Comprar' dependiendo si Cart esta vacío o no */
    this.cartProducts$.subscribe(items => {
      this.isCartEmpty = items.length === 0  
    });
  }

  //? 'acc' es el valor que se va acumulando mientras 'reduce' recorre un array

  /* Se simula la compra del Cart y se guarda en localStorage para mostrarse en Purchases */
  buyCart() {
    this.cartProducts$
      .pipe(take(1))
      .subscribe(items => { 
      /* Calcula el total del carrito sumando (precio * cantidad) de cada producto */
      const total = items.reduce((acc, p) => acc + (p.price * (p.quantity ?? 1)), 0)

      /* Se guarda la compra en localStorage */
      this.purchaseService.addPurchaseFromCart(items, total)

      /* Se limpia todo el Cart después de realizar la compra */
      this.cartService.clearCart()

      /* Se muestra la ventana emergente con el resumen de la compra */
      this.alertModal(`\u{f290}`, 'Compra finalizada', 
        `Productos: ${items.length}\u00A0\u00A0\u00A0\u00A0 Ahorraste: $${items.reduce((acc, p) => acc + ((this.getOriginalPrice(p) - p.price) * (p.quantity ?? 1)), 0).toFixed(2)}\u00A0\u00A0\u00A0\u00A0 Pagaste: $${total}` )
    });
  }

  /* Se calcula el total sin el descuento % */
  calcOrigTotal(): Observable<number> {
    return this.cartProducts$.pipe(
      map(items => + items
          .reduce((acc, p) => acc + this.getOriginalPrice(p) * (p.quantity ?? 1), 0)
          .toFixed(2)
      )
    );
  }

  /* Se calcula el total ahorrado (descuento) % */
  calcTotalDisc(): Observable<number> {
    return this.totalSaved$ = this.cartProducts$
      .pipe(
        map(items => + items
          .reduce((acc, p) => acc + (this.getOriginalPrice(p) - p.price) * (p.quantity ?? 1), 0 )
          .toFixed(2)
        )
      );
  }

  /* Se calcula el precio total ya con el descuento % aplicado */
  calcTotalWithDisc(): Observable<number>{
    return  this.totalDisc$ = this.cartProducts$
    .pipe(
      map(items => + items
        .reduce((acc, p) => acc + (p.price * (p.quantity ?? 1)), 0)
        .toFixed(2)
      )
    );
  }

  /* Calcula el precio original de cada producto sin aplicar el descuento (totalOriginal = totalConDescuento / (1 - (descuento (%) / 100)) */
  getOriginalPrice(product: ProductsData): number {
    return +(product.price / (1 - product.discountPercentage / 100)).toFixed(2)
  }

  /* Para eliminar el producto seleccionado de la lista */
  removeFromCart(id: number) {
    this.cartService.removeFromCart(id)
  }

  /* Incrementa o disminuye la cantidad del producto seleccionado, actualizando también las cantidades $ */
  increaseQuantity(product: ProductsData) {
    this.cartService.increaseQuantity(product.id)
  }

  decreaseQuantity(product: ProductsData) {
    this.cartService.decreaseQuantity(product.id)

    /* Se suscribe al Observable para obtener la versión actualizada del producto, si la cantidad es menor a 1 muestra el modal */
    this.cartService.cartItems$
      .pipe(take(1))
      .subscribe(items => {
        const updatedProduct = items.find(p => p.id === product.id)
        const quantity = updatedProduct?.quantity ?? 0
        if (quantity < 1) {
          this.alertModal(`\u{f829}`, 'Eliminado del carrito', 'El producto se borró correctamente')
        }
      });
  }

  /* Muestra una ventana emergente como alert, el texto cambia de acuerdo a dónde se requiera el alert */
  alertModal(icon: string, title: string, text: string) {
    this.modalService.showModal({
      icon: icon,
      title: title,
      text: text,
      isAlert: true, 
      type: 'info', 
      confirmText: 'Entendido',  
      onConfirm: () => console.log('Close')
    });
  }

  /* Muestra una ventana de confirmación previo a eliminar un producto del carrito */
  confirmDelete(id: number) {
    this.modalService.showModal({
      icon: `\u{2753}`,
      title: 'Quitar producto',
      text: '¿Estás seguro que deseas eliminar este producto de tu carrito?',
      isAlert: false,
      type: 'confirm',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: () => this.removeFromCart(id),
    });
  }
}