import { Component } from '@angular/core';
import { AuthService } from './service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../shared/service/cart.service';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class Auth {
  
  // username: string = 'emilys'
  // password: string = 'emilyspass'
  // error: string | null = null

  // showPass: boolean = false  

  // constructor( private authService: AuthService, private cartService: CartService, private router: Router, private route: ActivatedRoute ) {}

  // logIn() {
  //   this.authService.logIn(this.username, this.password)
  //     .subscribe({
  //       next: () => {
  //         // Revisar producto pendiente
  //         const pending = this.authService['pendingProductSubject'].getValue()
  //         if (pending) {
  //           this.cartService.addToCart(pending)
  //           this.authService.clearPendingProduct()
  //         }
  //         const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/products'
  //         this.router.navigateByUrl(returnUrl)
  //       },
  //       error: () => this.error = 'Usuario y/o contraseña incorrectos'
  //     });
  // }

  username: string = 'michaelw';
  password: string = 'michaelwpass';
  error: string | null = null;
  showPass: boolean = false

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  logIn() {
    this.authService.logIn(this.username, this.password).subscribe({
      next: () => {
        // Revisar si había producto pendiente
        const pending = this.authService.getPendingProduct();
        if (pending) {
          this.cartService.addToCart(pending);
          this.authService.clearPendingProduct();
        }

        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') || '/products';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.error = 'Credenciales inválidas';
      }
    });
  }

  showHidePass() {
    this.showPass = !this.showPass;
  }
}
