import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../shared/service/products.service';
import { ProductsData } from './interface/products.interface';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavService } from '../../shared/service/navigation.service';
import { AuthService } from '../../auth/service/auth.service';
import { CategoriesInterface } from './interface/categories.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsForm } from './form/form';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterModule, FormsModule, ProductsForm, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {

  
  constructor(private productService: ProductsService, public navService: NavService) {}  
  
  products$!: Observable<ProductsData[]>
  categories$!: Observable<CategoriesInterface[]>

  type: string = ''
  sortBy: string = 'asc'; isSortAsc: boolean = true
  limit: number = 10
  stock!: number  
  // quantity: number = 1

  MathRef = Math
  readonly stars = [0, 1, 2, 3, 4]   /* Rating Star Icon */

  ngOnInit(): void {
    this.getCategories()
    this.getFeaturedProducts(10)
  }  

  /* Se obtiene la lista de categorías */
  getCategories() {
    this.categories$ = this.productService.getCategories()
  }

  /* Se Obtienen 10 productos para mostrarlos como destacados */
  getFeaturedProducts(limit: number) {
    this.products$ = this.productService.getFeaturedProducts(limit)
      .pipe(
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      )
  }

  /* Se filtra la lista por el tipo de producto */
  filterProductsByType(type: string) {
    this.products$ = this.productService.getProductByType(type)
      .pipe(
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      )
  }

  /* Se filtra la lista por la categoría del producto */
  filterProductsByCategory(category: string) {
    this.products$ = this.productService.getProductsByCategory(category)
      .pipe(
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      )
  }

  /* Se ordenan la lista de productos de manera ascendente o descendente de acuerdo a su título */
  sortListByTitle() {
    this.isSortAsc = !this.isSortAsc
    this.sortBy = this.isSortAsc ? 'asc' : 'desc'
    this.products$ = this.productService.sortProducts(this.sortBy, this.limit)
      .pipe(
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      )
  }  

  /* Calcula el precio original de un producto antes de aplicar el descuento (originalPrice = precioConDescuento / (1 - (descuento / 100)) */
  getOriginalPrice(product: ProductsData): number {
    return +(product.price / (1 - product.discountPercentage / 100)).toFixed(2)
  }

  /* Convierte el valor de la calificación (rating) del producto a íconos */
  rateIcon(rate: number, index: number): string {
    //* Se asegura que el rango siempre sea 0 - 5
    const range = Math.max(0, Math.min(5, rate))
    //* Calcula la cantidad de enteros y decimales */
    const full = Math.floor(range)
    const half = range - full >= 0.5 && full < 5

    /* Convierte el valor a ícono de la estrella (llena, media o vacía) */
    return index < full ? 'fa-solid fa-star text-[#FFD700]' : index === full && half ? 'fa-solid fa-star-half-stroke text-[#FFD700]' 
      : 'fa-regular fa-star text-[var(--chinese-silver)]'
  }

  // redirectToDetails(param: number) {
  //   this.navService.getProductDetails(param)
  // }
}
