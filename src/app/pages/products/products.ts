import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../shared/service/products.service';
import { ProductsData } from './interface/products.interface';
import { map, Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavService } from '../../shared/service/navigation.service';
import { CategoriesInterface } from './interface/categories.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsForm } from './form/form';
import { CartService } from '../../shared/service/cart.service';
import { ModalHandler } from '../../shared/service/modal-handler';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterModule, FormsModule, ProductsForm, ReactiveFormsModule],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  
  constructor(private productService: ProductsService, private navService: NavService, private cartService: CartService, private router: Router, private modalHandler: ModalHandler) {}  
  
  products$!: Observable<ProductsData[]>
  categories$!: Observable<CategoriesInterface[]>
  type: string = ''
  sortBy: string = 'asc'
  isSortAsc: boolean = true
  limit: number = 10

  /* Para controlar los filtros */
  currCategory: string = ''
  currType: string = ''
  currOrder: 'asc' | 'desc' | 'random' | null = null
  productCountTxt: string = ''

  readonly stars = [0, 1, 2, 3, 4]

  ngOnInit(): void {
    this.resetFilters()
    this.getCategories()
    this.filterProductsByType('laptop')
  }

  /* Se obtiene la lista de categorías */
  getCategories() {
    this.categories$ = this.productService.getCategories()
  }

  /* Lista los productos destacados o aplica el límite según el contexto actual */
  getFeaturedProducts(limit: number, isRandom: boolean = false) {
    this.limit = limit

    /* Limpia todos los filtros si se seleccionó listar de forma aleatoria */
    if (isRandom) {
      this.resetFilters()
      this.sortBy = ''
      this.isSortAsc = false
    }

    /* Verifica si se seleccionó una categoría o si se ingresó un tipo, si se cumple, detiene la ejecución y filtra de acuerdo a la condición */
    if (this.currCategory) {
      this.filterProductsByCategory(this.currCategory)
      return
    }
    if (this.currType) {
      this.filterProductsByType(this.currType)
      return
    }

    /* Verifica si se seleccionó un orden (asc o desc), si se cumple, ordena la lista respetando el límite */
    if (this.sortBy && !isRandom) {
      this.products$ = this.productService.sortProducts(this.sortBy, this.limit)
        .pipe(
          tap(res => {
            this.productCountTxt = `Mostrando ${res.products.length} de ${res.total} productos en orden:`
          }),
          map(res => res.products.map(p => ({ ...p, quantity: 1 })))
        );
        return
    }

    /* Si no hay ningún filtro se muestran los productos destacados de acuerdo al límite */
    this.products$ = this.productService.getFeaturedProducts(limit)
      .pipe(
        map(res => {
          this.productCountTxt = `Mostrando ${res.products.length} productos destacados`
          return res.products.map(p => ({ ...p, quantity: 1 }))
        })
      );

    if (limit > 50) {
      this.modalHandler.alertModal('\u{f05a}', 'Mostrando +50 productos', 'La carga podría tardar unos segundos')
    }
  }
  
  /* Ordena la lista de forma ascendente o descendente, tomando como referencia el nombre del producto */
  sortListByTitle() {
    this.isSortAsc = !this.isSortAsc
    this.sortBy = this.isSortAsc ? 'asc' : 'desc'

    /* Se limpian solamente los filtros */
    this.currCategory = ''
    this.currType = ''

    this.products$ = this.productService.sortProducts(this.sortBy, this.limit)
      .pipe(
        tap(res => {
          this.productCountTxt = `Mostrando ${res.products.length} productos de ${res.total} en orden:`
        }),
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      );
  }

  /* Filtra la lista de acuerdo a la categoría */
  filterProductsByCategory(category: string) {
    this.currCategory = category
    this.currType = ''
    this.sortBy = ''
    this.isSortAsc = false;

    this.products$ = this.productService.getProductsByCategory(category.split(' ').join('-'), this.limit, this.sortBy)
      .pipe(
        tap(res => {
          this.productCountTxt = `Mostrando ${res.products.length} de ${res.total} productos de la categoría:`
        }),
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      );
  }
  
  /* Filtra la lista de acuerdo al tipo de producto */
  filterProductsByType(type: string) {
    this.currType = type
    this.currCategory = ''
    this.sortBy = ''
    this.isSortAsc = false
    
    this.products$ = this.productService.getProductByType(type, this.limit, this.sortBy)
      .pipe(
        tap(res => {
          this.productCountTxt = `Mostrando ${res.products.length} de ${res.total} productos del tipo:`
        }),
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      );
  }

  /* Se resetean los valores que filtran los resultados */
  resetFilters() {
    this.currCategory = ''
    this.currType = ''
    this.productCountTxt = ''
    this.sortBy = ''
  }

  /* Calcula el precio original del producto antes de aplicar el descuento (originalPrice = precioConDescuento / (1 - (descuento / 100)) */
  getOriginalPrice(product: ProductsData): number {
    return +(product.price / (1 - product.discountPercentage / 100)).toFixed(2)
  }

  /* Convierte la calificación numérica (rating) y la retorna como íconos */
  rateIcon(rate: number, index: number): string {
    const range = Math.max(0, Math.min(5, rate)) //* Se asegura que el rango siempre sea de 0 - 5
    const full = Math.floor(range)
    const half = range - full >= 0.5 && full < 5

    return index < full ? 'fa-solid fa-star text-yellow-500' : index === full && half ? 'fa-solid fa-star-half-stroke text-yellow-500' 
      : 'fa-regular fa-star text-gray-500'
  }

  /* Omite las palabras 'Ships' y 'Ships In' de la propiedad shippingInformation */
  getShippingText(text?: string): string {
    if (!text) return ''
    return text.replace(/\b(?:Ships in|Ships|In)\b\s*/gi, '').trim()
  }

  /* Se incrementa o disminuye el valor de la propiedad local 'quantity' en Cart, siempre respetando los rangos ( 1 - stock ) */
  increaseQuantity(product: ProductsData) {
    if ((product.quantity ?? 1) < product.stock) {
      this.cartService.increaseQuantity(product.id)
      product.quantity = (product.quantity ?? 1) + 1
    }
  }  
  decreaseQuantity(product: ProductsData) {
    if ((product.quantity ?? 1) > 1) {
      this.cartService.decreaseQuantity(product.id)
      product.quantity = (product.quantity ?? 1) - 1
    }
  }

  /* Redirige a los detalles del producto seleccionado */
  getProductDetails(id: number) {
    this.navService.getProductDetails(id)
  }

  /* Agrega el producto al carrito, agregando el valor de 'quantity' o '1' por defecto */
  onAddToCart(product: ProductsData) {
    const productToAdd = { ...product, quantity: product.quantity ?? 1 }
    this.navService.onAddToCart(productToAdd)
    this.modalHandler.alertModal(`\u{f218}`, 'Agregado al carrito', 'El producto se ha añadido correctamente a tu carrito')
  }  

  /* Redirige a /cart para realizar la compra directamente */
  onPurchase(product: ProductsData) {
    const productToAdd = { ...product, quantity: product.quantity ?? 1 }
    this.navService.onAddToCart(productToAdd)
    this.router.navigate(['/cart'])
  }
}