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
  
  getProductDetails(id: number) {
    this.router.navigate([`product-detail`], { queryParams: { id: `${id}` } })
  }

  /* Manda el id del usuario para mostrar su información */
  getProfileDetails(id: number) {
    this.router.navigate(['profile'], { queryParams: {id: `${id}`} })
  }

  /* Agrega el producto al carrito, controla si se ha iniciado sesión o no, almacena el producto cuando no hay una sesión activa */
  onAddToCart(product: ProductsData) {
    if (this.authService.isUserLogged()) {
      this.cartService.addToCart(product)
      this.router.navigate(['/cart'])
    } else {
      /* Guarda el producto en localStorage y lo agrega una vez iniciada la sesión */
      this.authService.setPendingProduct(product)
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } })
    }
  }

}
