import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsData } from '../products/interface/products.interface';
import { NavService } from '../../shared/service/navigation.service';
import { CommonModule } from '@angular/common';
import { FavoritesService } from './service/favorites.service';
import { CartService } from '../../shared/service/cart.service';
import { RouterModule } from '@angular/router';
import { ModalHandler } from '../../shared/service/modal-handler';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.html',
})
export class Favorites implements OnInit {

  favsList$!: Observable<ProductsData[]>
  isFavsEmpty: boolean = true

  hideItemsInCart: boolean = false

  constructor(private favsService: FavoritesService, private navService: NavService, private cartService: CartService, private modalHandler: ModalHandler) {}

  ngOnInit(): void {
    this.favsList$ = this.favsService.favorites$

    /* Controla el estado del botón 'Comprar' dependiendo si Cart esta vacío o no */
    this.favsList$.subscribe(items => {
      this.isFavsEmpty = items.length === 0  
    });
  }

  /* Se elimina el producto de la lista de Favoritos */
  removeFavorite(product: ProductsData): void {
    this.modalHandler.confirmModal(`\u{2753}`, 'Quitar producto', '¿Estás seguro que deseas eliminar este producto de tu lista de favoritos?', () => this.favsService.toggleFavorite(product))
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
    this.modalHandler.alertModal(`\u{f218}`, 'Agregado al carrito', 'El producto se ha añadido correctamente a tu carrito')
  }

  toggleHideItems() {
    this.hideItemsInCart = !this.hideItemsInCart
  }
}