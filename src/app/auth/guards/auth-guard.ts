import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

//? Los Guards (Auth, Role, CanDesactivate, CanLoad) se usan para controlar el acceso a ciertas rutas según la condición
export const authGuard: CanActivateFn = (route, state) => {
  
  //? Inject() obtiene instancias de los service sin usar el constructor(), usuado comunmente en los Guards
  const authService = inject(AuthService)
  const router = inject(Router)

  /* Verifica si el usuario ha iniciado sesión o no */
  if (authService.isUserLogged()) {
    return true
  } else {
    /* Se guarda la ruta actual, o a la que se quería accesar, redirige a /login y posteriormente a dicha ruta una vez inicie sesión */
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
    return false
  }  
};