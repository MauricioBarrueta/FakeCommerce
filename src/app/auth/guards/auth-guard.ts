import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService)
  const router = inject(Router)

  if (authService.isUserLogged()) {
    return true
  } else {
    /* Se guarda la ruta previo a redirigir a /login */
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
    return false
  }  
};