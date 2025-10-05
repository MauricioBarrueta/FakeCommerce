import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsData } from '../products/interface/products.interface';
import { NavService } from '../../shared/service/navigation.service';
import { CommonModule } from '@angular/common';
import { FavoritesService } from './service/favorites.service';
import { CartService } from '../../shared/service/cart.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss'
})
export class Favorites implements OnInit {

  favsList$!: Observable<ProductsData[]>

  constructor(private favsService: FavoritesService, private navService: NavService, private cartService: CartService) {}

  ngOnInit(): void {
    this.favsList$ = this.favsService.favorites$
  }

  /* Se elimina el producto de la lista de Favoritos */
  removeFavorite(product: ProductsData): void {
    this.favsService.toggleFavorite(product)
  }

  /* Redirecciona a los detalles del producto seleccionado */
  getProductDetails(id: number) {
    this.navService.getProductDetails(id)
  }



  // message = ''; // ← almacena el texto del mensaje
  // showMsg = false; // ← controla la visibilidad

  //! este es el bueno
  // addToCart(product: ProductsData) {
  //   this.favsService.addToCartFromFavorites(product)
  // }

  isInCart(productId: number): boolean {
    return this.cartService.isInCart(productId)
  }
  
  // Método exclusivo para agregar desde Favoritos
  addToCartFromFav(product: ProductsData) {
    // Usar tu método del CartService o uno dedicado
    this.cartService.addToCart(product);
    // No redirige, solo cambia estado
  }
}
