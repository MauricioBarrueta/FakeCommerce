import { Component } from '@angular/core';
import { AuthService } from '../auth/service/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../shared/service/cart.service';
import { NavService } from '../shared/service/navigation.service';
import { ProfileInterface } from '../pages/profile/interface/profile.interface';
import { FavoritesService } from '../pages/favorites/service/favorites.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
})
export class Header {

  user: ProfileInterface | null = null
  cartCounter: number = 0
  favsCounter: number = 0

  constructor(private authService: AuthService, private cartService: CartService, private favService: FavoritesService, public navService: NavService, private router: Router) {

    /* Se suscribe a los Observables de Profile, Cart y Favorites para obtener los cambios en tiempo real */
    this.authService.user$.subscribe((u) => (this.user = u))

    /* Se obtiene la cantidad de productos agregados en Cart y Favorites, actializando la cantidad en tiempo real */
    this.cartService.cartItems$.subscribe(products => {
      const total = products.reduce((acc, p) => acc + (p.quantity ?? 1), 0)
      this.cartCounter = total > 9 ? 9 : total
    });

    this.favService.favorites$.subscribe(favs => {
      const total = favs.reduce((acc, f) => acc + (f.quantity ?? 1), 0)
      this.favsCounter = total > 9 ? 9 : total
    });
  }
  
  /* Se cierra la sesión, redirige a /products si la ruta actual está protegida por AuthGuard */
  logOut() {
    this.authService.logOut()
    const currPath = this.router.url
    if (currPath.startsWith('/profile') || currPath.startsWith('/cart') || currPath.startsWith('/favorites') || currPath.startsWith('/purchases')) {
      this.router.navigate(['/products'])
    }
  }

  /* Se muestra la cantidad de productos agregados en Cart y Favorites, si es > 9 mostrará '+9' */
  get cartDisplay() {
    return this.cartCounter >= 9 ? '+9' : this.cartCounter
  }

  get favsDisplay() {
    return this.favsCounter >= 9 ? '+9' : this.favsCounter
  }
}