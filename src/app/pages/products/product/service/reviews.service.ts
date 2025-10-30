import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, map, take } from 'rxjs';
import { ProductsData, Review } from '../../interface/products.interface';
import { ProfileInterface } from '../../../profile/interface/profile.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  /* Almacena el estado de las Reviews */
  private reviewsSubject = new BehaviorSubject<Review[]>([])
  reviews$ = this.reviewsSubject.asObservable()

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  /* Guarda en localStorage los cambios que reciba */
  private saveToStorage(key: string, data: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(data))
    }
  }

  /* Recupera los datos guardados en localStorage, devuelve un array vacío si no existen */
  private loadFromStorage(key: string): Review[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    }
    return []
  }

  /* Carga las reseñas por defecto y agrega las que están guardadas en localStorage, devolviéndolas combinadas */
  loadReviews(product: ProductsData) {
    const key = `reviews_product_${product.id}`
    const saved = this.loadFromStorage(key)
    const combined = [...product.reviews, ...saved]
    this.reviewsSubject.next(combined)
  }

  /* Recibe los datos necesarios y envía la reseña para guardarla en localStorage */
  submitReview(user: ProfileInterface, product: ProductsData, form: { comment: string; rating: number }) {
    if (!user || !product) return

    const newReview: Review = {
      reviewerName: `${user.firstName} ${user.lastName ?? ''}`.trim(),
      reviewerEmail: user.email,
      comment: form.comment,
      rating: form.rating,
      date: new Date().toISOString().split('T')[0], //* YYYY-MM-DD
    };

    const key = `reviews_product_${product.id}` //* Clave única por producto

    this.reviews$.pipe(take(1)).subscribe(current => {
      /* Se combinan las reseñas anteriores y la nueva */
      const updated = [...current, newReview]
      /* Se filtran las reseñas que no existen originalmente en el producto */
      const savedOnly = updated.filter(r => !product.reviews.includes(r))

      this.saveToStorage(key, savedOnly)
      this.reviewsSubject.next(updated)
    });
  }

  /* Elimina la reseña de localStorage */
  deleteReview(product: ProductsData, reviewToDelete: Review): void {
    if (!product) return

    const key = `reviews_product_${product.id}`

    this.reviews$.pipe(take(1)).subscribe(current => {
      /* Filtra las reseñas originales y las restantes de localStorage, si las hay, excluyendo la que se quiere borrar */
      const updated = current.filter(r => r !== reviewToDelete)
      /* Filtra solamente todas las reseñas guardadas en localStorage */
      const savedOnly = updated.filter(r => !product.reviews.includes(r))

      this.saveToStorage(key, savedOnly)
      this.reviewsSubject.next(updated)
    });
  }

  /* Devuelve un Observable con el total de reseñas, inluyendo las de localStorage */
  get totalReviews$() {
    return this.reviews$.pipe(map(reviews => reviews.length))
  }  
}