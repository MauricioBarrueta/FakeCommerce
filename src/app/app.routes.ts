import { Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { Products } from './pages/products/products';
import { ProductDetail } from './pages/products/product/product';
import { Cart } from './pages/cart/cart';
import { authGuard } from './auth/guards/auth-guard';
import { Profile } from './pages/profile/profile';
import { Favorites } from './pages/favorites/favorites';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: Products },
    { path: 'product-detail', component: ProductDetail },
    { path: 'login', component: Auth },
    { path: 'cart', component: Cart, canActivate: [authGuard] },
    { path: 'favorites', component: Favorites, canActivate: [authGuard] },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: '**', redirectTo: 'products' },  
];