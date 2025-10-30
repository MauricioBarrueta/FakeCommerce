import { Component, NgZone } from '@angular/core';
import { AuthService } from './service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../shared/service/cart.service';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.html',
})
export class Auth {

  username: string = 'michaelw'
  password: string = 'michaelwpass'
  error: string | null = null
  showingPass: boolean = false

  constructor(private authService: AuthService, private cartService: CartService, private router: Router, private route: ActivatedRoute, private ngZone: NgZone) {}
  
  /* Para iniciar sesión, almacena el producto que se quiere guardar en el carrito temporalmente si es que se redirecciono de /product-detail -> /login */
  logIn() {
    this.authService.logIn(this.username, this.password)
      .subscribe({
        next: () => {
          /* Se verifica si existe un producto pendiente guardado en memoria */
          const pending = this.authService.getPendingProduct()
          if (pending) {
            this.cartService.addToCart(pending)
            this.authService.clearPendingProduct()
          }
          /* Redirecciona a la url anterior o a /products por defecto */
          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') || '/products'
            this.router.navigateByUrl(returnUrl)
        },
        error: () => {
          this.ngZone.run(() => {
            this.error = 'Usuario y/o contraseña incorrectos'
          });
        }
      });
  }

  /* Cambia el estado de la variable para mostrar u ocultar la contraseña */
  togglePass() {
    this.showingPass = !this.showingPass
  }
}