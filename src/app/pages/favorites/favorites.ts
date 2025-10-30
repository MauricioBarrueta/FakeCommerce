import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsData } from '../products/interface/products.interface';
import { NavService } from '../../shared/service/navigation.service';
import { CommonModule } from '@angular/common';
import { FavoritesService } from './service/favorites.service';
import { CartService } from '../../shared/service/cart.service';
import { RouterModule } from '@angular/router';
import { ModalService } from '../../shared/modal/service/modal.service';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.html',
})
export class Favorites implements OnInit {

  favsList$!: Observable<ProductsData[]>
  isFavsEmpty: boolean = true

  constructor(private favsService: FavoritesService, private navService: NavService, private cartService: CartService, private modalService: ModalService) {}

  ngOnInit(): void {
    this.favsList$ = this.favsService.favorites$

    /* Controla el estado del botón 'Comprar' dependiendo si Cart esta vacío o no */
    this.favsList$.subscribe(items => {
      this.isFavsEmpty = items.length === 0  
    });
  }

  /* Se elimina el producto de la lista de Favoritos */
  removeFavorite(product: ProductsData): void {
    this.favsService.toggleFavorite(product)
  }

  /* Redirecciona a los detalles del producto seleccionado */
  getProductDetails(id: number) {
    this.navService.getProductDetails(id)
  }

  /* Verifica si el producto ya existe en el Carrito o no */
  isInCart(productId: number): boolean {
    return this.cartService.isInCart(productId)
  }
  
  /* Agrega el producto al carrito, cambiando el estado de isInCart automáticamente */
  addToCartFromFav(product: ProductsData) {
    this.cartService.addToCart(product)
    this.showAlert()
  }

  /* Muestra un alert al agregar un producto al carrito */
  showAlert() {
    this.modalService.showModal({
      icon: `\u{f218}`,
      title: 'Agregado al carrito',
      text: 'El producto se ha añadido correctamente a tu carrito',
      isAlert: true, 
      type: 'info', 
      confirmText: 'Entendido',  
      onConfirm: () => console.log('Close')
    });
  }

  /* Muestra una ventana de confirmación previo a eliminar un producto de la lista */
  confirmDelete(p: ProductsData) {
    this.modalService.showModal({
      icon: `\u{2753}`,
      title: 'Quitar producto',
      text: '¿Estás seguro que deseas eliminar este producto de tu lista de favoritos?',
      isAlert: false,
      type: 'confirm',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: () => this.removeFavorite(p),
    });
  }
}