import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../shared/service/products.service';
import { ProductsData } from './interface/products.interface';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavService } from '../../shared/service/navigation.service';
import { CategoriesInterface } from './interface/categories.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsForm } from './form/form';
import { CartService } from '../../shared/service/cart.service';
import { ModalService } from '../../shared/modal/service/modal.service';
@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterModule, FormsModule, ProductsForm, ReactiveFormsModule],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  
  constructor(private productService: ProductsService, private navService: NavService, private cartService: CartService, private router: Router, private modalService: ModalService) {}  
  
  products$!: Observable<ProductsData[]>
  categories$!: Observable<CategoriesInterface[]>
  type: string = ''
  sortBy: string = 'asc'
  isSortAsc: boolean = true
  // limit: number = 10
  readonly stars = [0, 1, 2, 3, 4]

  ngOnInit(): void {
    this.getCategories()
    // this.getFeaturedProducts(10)
    this.filterProductsByType('laptop')
  }  

  /* Se obtiene la lista de categorías */
  getCategories() {
    this.categories$ = this.productService.getCategories()
  }

  /* Se lista la cantidad de productos de acuerdo al parámetro limit */
  getFeaturedProducts(limit: number) {
    if(limit > 0) {
      this.products$ = this.productService.getFeaturedProducts(limit)
      .pipe(
        //* Se agrega la propiedad quantity a cada producto usando 'spread operator'
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      )
    } 
    if(limit > 25) {
      this.showAlert(`\u{f05a}`, `Mostrando +25 productos`, 'Recuerda que mientras más productos se muestren, la carga podría tardar algunos segundos')
    }    
  }

  /* Se filtra la lista de productos de acuerdo al tipo de producto */
  filterProductsByType(type: string) {
    this.products$ = this.productService.getProductByType(type)
      .pipe(
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      )
  }

  /* Se filtra la lista de productos de acuerdo a su categoría */
  filterProductsByCategory(category: string) {
    this.products$ = this.productService.getProductsByCategory(category.split(' ').join('-'))
      .pipe(
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      )
  }

  /* Ordena la lista de forma ascendente o descendente, tomando como referencia el nombre del producto */
  sortListByTitle() {
    this.isSortAsc = !this.isSortAsc
    this.sortBy = this.isSortAsc ? 'asc' : 'desc'
    this.products$ = this.productService.sortProducts(this.sortBy)
      .pipe(
        map(res => res.products.map(p => ({ ...p, quantity: 1 })))
      )
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
    this.showAlert(`\u{f218}`, 'Agregado al carrito', 'El producto se ha añadido correctamente a tu carrito')
  }  

  /* Redirige a /cart para realizar la compra directamente */
  onPurchase(product: ProductsData) {
    const productToAdd = { ...product, quantity: product.quantity ?? 1 }
    this.navService.onAddToCart(productToAdd)
    this.router.navigate(['/cart'])
  }
  
  /* Muestra una ventana emergente como alert después de agregar un producto a Cart */
  showAlert(icon: string, title: string, text: string) {
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
}