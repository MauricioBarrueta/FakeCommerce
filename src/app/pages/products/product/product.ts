import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../shared/service/products.service';
import { ProductsData, Review } from '../interface/products.interface';
import { filter, map, Observable, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavService } from '../../../shared/service/navigation.service';
import { AuthService } from '../../../auth/service/auth.service';
import { ProfileInterface } from '../../profile/interface/profile.interface';
import { FavoritesService } from '../../favorites/service/favorites.service';
import { ReviewsService } from './service/reviews.service';

@Component({
  selector: 'app-product',
  imports: [ CommonModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class ProductDetail implements OnInit {
  
  constructor(private productsService: ProductsService, public navService: NavService, private authService: AuthService, public reviewsService: ReviewsService, private favsService: FavoritesService, private route: ActivatedRoute, private fb: FormBuilder) {}
    
  product$!: Observable<ProductsData>
  product!: ProductsData
  quantity: number = 1
  selectedImg: string | null = null
  readonly stars = [0, 1, 2, 3, 4]

  /* Reviews */
  reviewForm!: FormGroup
  selectedRating: number = 0 /* Calificación seleccionada */
  currDate = new Date() 
  showingReviews = false
  /* Datos del usuario logueado */
  user!: ProfileInterface
  /* Favorites */
  isFav: boolean = false;

toggleReviews() {
  this.showingReviews = !this.showingReviews;
}  

  ngOnInit(): void {
    // Obtener ID del query param y traer el producto
    this.product$ = this.route.queryParams
      .pipe(
        map(params => +params['id']),
        switchMap(id => this.productsService.getProductDetails(id)),
        tap(p => {
          this.product = p;
          this.selectedImg = this.selectedImg ?? p.images[0];

          // Inicializar estado de favorito
          this.isFav = this.favsService.isFavorite(p.id);

          // Cargar reviews usando ReviewsService
          this.reviewsService.loadReviews(p);
        })
      );
     
    
    /* Se inicializa el formulario y el método para publicar la Review */
    this.reviewForm = this.fb.group({
      comment: ['', Validators.required], rating: [1, Validators.required]  // rating default = 1
    });
    this.selectedRating = (this.reviewForm.get('rating')?.value ?? 1) - 1;

    // Obtener datos del usuario logueado
    this.authService.user$
      .pipe(
        filter((u): u is ProfileInterface => u !== null)
      )
      .subscribe(u => this.user = u);

      // Reactivo: actualizar estado del botón de favorito cuando cambie la lista
    this.favsService.favorites$.subscribe(favs => {
      if (this.product) {
        this.isFav = favs.some(p => p.id === this.product.id);
      }
    });
  }


  /* Controla cuál de las imágenes se está mostrando */
  onSelectImage(img: string) { this.selectedImg = img }  

  /* Convierte el valor de la calificación (rating) del producto a íconos */
  rateIcon(rate: number, index: number): string {
    const range = Math.max(0, Math.min(5, rate)) //* Asegura que el rango siempre sea 0 - 5
    const full = Math.floor(range)
    const half = range - full >= 0.5 && full < 5
    /* Convierte el valor a ícono de la estrella (llena, media o vacía) */
    return index < full ? 'fa-solid fa-star text-yellow-500' : index === full && half ? 'fa-solid fa-star-half-stroke text-yellow-500' 
      : 'fa-regular fa-star text-[var(--gunmetal)]'
  } 

  /* Se modifica el texto de la propiedad 'shippingInformation' */
  getShippingText(text?: string): string {
    if (!text) return ''
    return text.replace(/\b(?:Ships in|Ships|In)\b\s*/gi, '').trim()
  }


  /* Despliega la lista de opiniones */
  scrollToReviews(event: Event) {
    event.preventDefault()
    this.showingReviews = true
    setTimeout(() => {
      const list = document.getElementById('reviews-section')
      list?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100);
  }

  /* Formulario de Review */
  selectRating(rating: number) {
    this.selectedRating = rating;
    this.reviewForm.get('rating')?.setValue(rating + 1); // rating visual +1 = valor real
  }


  // Método para enviar nueva review
  submitReview(): void {
    if (!this.user || !this.product || this.reviewForm.invalid) return
    
    this.reviewsService.submitReview(this.user, this.product, this.reviewForm.value);
    this.reviewForm.reset({ comment: '', rating: 0 });
    this.selectedRating = 0;
  }

  deleteReview(review: Review) {
    if (!this.product) return;
    this.reviewsService.deleteReview(this.product, review);
  }

  /* Verifica cuáles comentarios son del usuario logueado */
  isOwnReview(review: Review): boolean {
    const fullName = `${this.user?.firstName} ${this.user?.lastName ?? ''}`.trim();
    return review.reviewerName === fullName;
  }

  addToFavs(): void {
    if (!this.product) return;
    this.favsService.toggleFavorite(this.product);
    this.isFav = this.favsService.isFavorite(this.product.id);
  }


}
