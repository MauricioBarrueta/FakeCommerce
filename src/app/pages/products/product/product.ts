import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../shared/service/products.service';
import { ProductsData, Review } from '../interface/products.interface';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavService } from '../../../shared/service/navigation.service';
import { AuthService } from '../../../auth/service/auth.service';
import { ProfileInterface } from '../../profile/interface/profile.interface';
import { FavoritesService } from '../../favorites/service/favorites.service';

@Component({
  selector: 'app-product',
  imports: [ CommonModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class ProductDetail implements OnInit {
  
  constructor(private productsService: ProductsService, public navService: NavService, private authService: AuthService, private favsService: FavoritesService, private route: ActivatedRoute, private fb: FormBuilder) {}
    
  product$!: Observable<ProductsData>
  product!: ProductsData
  quantity: number = 1

  selectedImg: string | null = null
  readonly stars = [0, 1, 2, 3, 4]

  reviewForm!: FormGroup
  selectedRating: number = 0 /* Calificación seleccionada */
  currDate = new Date() 

  showingReviews = false

  /* Datos del usuario logueado */
  user!: ProfileInterface

  /* Favorites */
  isFav: boolean = false;

  combinedReviews$!: Observable<Review[]> //* Opiniones por defecto + opiniones agregadas (usuario)

  
  //! ESTO CREO YA NO SIRVE, CHECAR Y BORRAR
  // reviews que el usuario agrega durante la sesión
  private newReviewsSubject = new BehaviorSubject<Review[]>([]);
  newReviews$ = this.newReviewsSubject.asObservable();


toggleReviews() {
  this.showingReviews = !this.showingReviews;
}
  

//   ngOnInit(): void {
//     this.product$ = this.route.queryParams
//       .pipe(
//         map(params => + params['id']),
//         switchMap(id => this.productsService.getProductDetails(id))
//       );

//     /* Se subscribe al Observable que contiene los datos del producto para usarlo de manera local */
//     this.product$.subscribe(p => {
//       this.product = p
//       this.selectedImg = this.selectedImg ?? p.images[0]

//       // Cargar reviews desde localStorage
//       const stored = localStorage.getItem(`reviews_product_${p.id}`);
//       const savedReviews: Review[] = stored ? JSON.parse(stored) : [];

//       // Combinar reviews del producto original + las guardadas localmente
//       const combined = [...p.reviews, ...savedReviews];

//       // Convertir a Observable
//       this.combinedReviews$ = of(combined);


//       // Inicializar estado de favorito
//       this.isFav = this.navService.isFavorite(p.id);



//     });

//     /* Se inicializa el formulario */
//     this.reviewForm = this.fb.group({
//       comment: [''], rating: [1]
//     });

//   // Obtener datos del usuario logueado
//   this.authService.user$
//     .pipe(filter((u): u is ProfileInterface => u !== null))
//     .subscribe(u => { this.user = u });


//     this.navService.favorites$.subscribe(favs => {
//     this.isFav = favs.some(p => p.id === this.product.id);
//   });

// }
   ngOnInit(): void {
    this.product$ = this.route.queryParams.pipe(
      map(params => +params['id']),
      switchMap(id => this.productsService.getProductDetails(id))
    );

    // Suscribirse a los datos del producto para usar localmente
    this.product$.subscribe(p => {
      this.product = p;
      this.selectedImg = this.selectedImg ?? p.images[0];

      // Cargar reviews desde localStorage
      const stored = localStorage.getItem(`reviews_product_${p.id}`);
      const savedReviews: Review[] = stored ? JSON.parse(stored) : [];

      // Combinar reviews del producto original + guardadas
      this.combinedReviews$ = of([...p.reviews, ...savedReviews]);

      // Inicializar estado de favorito
      this.isFav = this.favsService.isFavorite(p.id);
    });

    // Inicializar formulario de opinión
    this.reviewForm = this.fb.group({
      comment: [''],
      rating: [1]  // default rating = 1
    });

    // Obtener datos del usuario logueado
    this.authService.user$
      .pipe(filter((u): u is ProfileInterface => u !== null))
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
    //* Se asegura que el rango siempre sea 0 - 5
    const range = Math.max(0, Math.min(5, rate))
    //* Calcula la cantidad de enteros y decimales */
    const full = Math.floor(range)
    const half = range - full >= 0.5 && full < 5

    /* Convierte el valor a ícono de la estrella (llena, media o vacía) */
    return index < full ? 'fa-solid fa-star text-[#FFD700]' : index === full && half ? 'fa-solid fa-star-half-stroke text-[#FFD700]' 
      : 'fa-regular fa-star text-[var(--chinese-silver)]'
  } 

  scrollToReviews(event: Event) {
    event.preventDefault();
    this.showingReviews = true; // asegúrate de que se abra
    setTimeout(() => {
      const el = document.getElementById('reviews-section');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); // delay pequeño para que se renderice
  }


  selectRating(rating: number) {
    this.selectedRating = rating
    /* Se actualiza el valor en el FormControl */
    this.reviewForm.get('rating')?.setValue(rating + 1)
  } 

  // Método para enviar nueva review
  submitReview(): void {
    if (!this.user || !this.product) return;

    const newReview: Review = {
      reviewerName: `${this.user.firstName} ${this.user.lastName ?? ''}`.trim(),
      reviewerEmail: this.user.email,
      comment: this.reviewForm.value.comment,
      rating: this.reviewForm.value.rating,
      date: new Date().toISOString().split('T')[0], /* yyyy-MM-dd */
    };

    // Combinar con las reviews existentes
    this.combinedReviews$.pipe(take(1)).subscribe(reviews => {
      const updatedReviews = [...reviews, newReview];

      // Guardar únicamente las reviews nuevas en localStorage
      // (las originales del producto no se sobreescriben)
      const savedOnly = updatedReviews.filter(r => !this.product!.reviews.includes(r));
      localStorage.setItem(`reviews_product_${this.product.id}`, JSON.stringify(savedOnly));

      // Actualizar Observable
      this.combinedReviews$ = of(updatedReviews);

      // Reset form
      this.reviewForm.reset({ comment: '', rating: 0 });
      this.selectedRating = 0;
    });
  }

  deleteReview(reviewToDelete: Review) {
    if (!this.product) return

    this.combinedReviews$.pipe(take(1)).subscribe(reviews => {
      const updated = reviews.filter(r => r !== reviewToDelete);

      // Guardar solo las reviews locales en storage
      const savedOnly = updated.filter(r => !this.product!.reviews.includes(r));
      localStorage.setItem(`reviews_product_${this.product.id}`, JSON.stringify(savedOnly));

      // Actualizar Observable
      this.combinedReviews$ = of(updated);
    });
  }

  /* Verifica cuáles comentarios son del usuario logueado */
  isOwnReview(review: Review): boolean {
    const fullName = `${this.user?.firstName} ${this.user?.lastName ?? ''}`.trim();
    return review.reviewerName === fullName;
  }


  
// toggleFavorite() {
//   this.navService.toggleFavorite(this.product);
// }
  addToFavs(): void {
    if (!this.product) return;
    this.favsService.toggleFavorite(this.product);
    this.isFav = this.favsService.isFavorite(this.product.id);
  }


}
