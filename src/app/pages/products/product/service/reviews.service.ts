import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, map, take } from 'rxjs';
import { ProductsData, Review } from '../../interface/products.interface';
import { ProfileInterface } from '../../../profile/interface/profile.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  reviews$ = this.reviewsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  private saveToStorage(key: string, data: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  private loadFromStorage(key: string): Review[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  loadReviews(product: ProductsData) {
    const key = `reviews_product_${product.id}`;
    const saved = this.loadFromStorage(key);
    const combined = [...product.reviews, ...saved];
    this.reviewsSubject.next(combined);
  }

  submitReview(user: ProfileInterface, product: ProductsData, form: { comment: string; rating: number }) {
    if (!user || !product) return;

    const newReview: Review = {
      reviewerName: `${user.firstName} ${user.lastName ?? ''}`.trim(),
      reviewerEmail: user.email,
      comment: form.comment,
      rating: form.rating,
      date: new Date().toISOString().split('T')[0],
    };

    const key = `reviews_product_${product.id}`;

    this.reviews$.pipe(take(1)).subscribe(current => {
      const updated = [...current, newReview];
      const savedOnly = updated.filter(r => !product.reviews.includes(r));

      this.saveToStorage(key, savedOnly);
      this.reviewsSubject.next(updated);
    });
  }

  deleteReview(product: ProductsData, reviewToDelete: Review): void {
    if (!product) return;

    const key = `reviews_product_${product.id}`;

    this.reviews$.pipe(take(1)).subscribe(current => {
      const updated = current.filter(r => r !== reviewToDelete);
      const savedOnly = updated.filter(r => !product.reviews.includes(r));

      this.saveToStorage(key, savedOnly);
      this.reviewsSubject.next(updated);
    });
  }

  get totalReviews$() {
    return this.reviews$.pipe(map(reviews => reviews.length));
  }  
}
