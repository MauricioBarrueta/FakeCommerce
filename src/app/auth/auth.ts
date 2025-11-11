import { Component } from '@angular/core';
import { AuthService } from './service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../shared/service/cart.service';
import { ModalHandler } from '../shared/service/modal-handler';
import { FavoritesService } from '../pages/favorites/service/favorites.service';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.html',
})
export class Auth {

  username: string = 'michaelw'
  password: string = 'michaelwpass'
  showingPass: boolean = false

  constructor(private authService: AuthService, private cartService: CartService, private favsService: FavoritesService, private router: Router, private route: ActivatedRoute, private modalHandler: ModalHandler) {}
  
  /* Para iniciar sesión, almacena el producto que se quizo agregar al carrito temporalmente si es que no se había iniciado sesión */
  logIn(event: Event) {
    event.preventDefault()

    this.authService.logIn(this.username, this.password)
      .subscribe({
        next: () => {
          /* Se verifica si existe un producto pendiente guardado en memoria */
          const pendingToCart = this.authService.getPendingProduct()
          if (pendingToCart) {
            this.cartService.addToCart(pendingToCart)
            this.authService.clearPendingProduct()            
            this.modalHandler.alertModal(`\u{f218}`, 'Agregado al carrito', 'El producto se ha añadido correctamente a tu carrito')
          }   
          
          /* Redirecciona a la url anterior o a /products por defecto */
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/products'
          this.router.navigateByUrl(returnUrl)
        },
        error: () => {
          this.modalHandler.warningModal('\u{f057}', 'Credenciales inválidas', 'El usuario o la contraseña son incorrectos o no fueron ingresados')
        }
      });
  }

  /* Cambia el estado de la variable para mostrar u ocultar la contraseña */
  togglePass() {
    this.showingPass = !this.showingPass
  }
}