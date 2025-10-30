import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';
import { ProductsData } from '../../pages/products/interface/products.interface';
import { CartService } from './cart.service';
@Injectable({
  providedIn: 'root'
})
export class NavService {

  constructor(private authService: AuthService, private cartService: CartService, private router: Router) {}
  
  /* Recibe el id del producto y redirige a sus detalles mandándolo como parámetro */
  getProductDetails(id: number) {
    this.router.navigate([`product-detail`], { queryParams: { id: `${id}` } })
  }

  /* Recibe el username de quien inició sesión y redirige a su perfil mandándolo como parámetro */
  getProfileDetails(user: string) {
    this.router.navigate(['profile'], { queryParams: { username: user } });
  }
  
  /* Agrega el producto al carrito y redirige a la ruta correspondiente dependiendo el estado del usuario */
  onAddToCart(product: ProductsData) {
    const productToAdd = { ...product, quantity: product.quantity ?? 1 }; //* Se clona el producto y evita que se modifique el original    
    /* Verifica el estado del usuario, si no ha iniciado sesión, guarda temporalmente en memoria el producto que se quiere agregar */
    if (this.authService.isUserLogged()) {
      this.cartService.addToCart(productToAdd)
    } else {
      this.authService.setPendingProduct(productToAdd)
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } })
    }
  }
}