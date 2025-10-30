import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../shared/service/products.service';
import { ProductsData, Review } from '../interface/products.interface';
import { filter, map, Observable, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavService } from '../../../shared/service/navigation.service';
import { AuthService } from '../../../auth/service/auth.service';
import { ProfileInterface } from '../../profile/interface/profile.interface';
import { FavoritesService } from '../../favorites/service/favorites.service';
import { ReviewsService } from './service/reviews.service';
import { ModalService } from '../../../shared/modal/service/modal.service';

@Component({
  selector: 'app-product',
  imports: [ CommonModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './product.html',
})
export class ProductDetail implements OnInit {
  
  constructor(private productsService: ProductsService, private navService: NavService, private authService: AuthService, public reviewsService: ReviewsService, private favsService: FavoritesService, 
    private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private modalService: ModalService) {}
    
  product$!: Observable<ProductsData>
  product!: ProductsData
  quantity: number = 1
  selectedImg: string | null = null
  prevImg: string | null = null
  readonly stars = [0, 1, 2, 3, 4]

  /* Reviews */
  reviewForm!: FormGroup
  selectedRating: number = 0
  currDate = new Date() 
  showingReviews = false

  user: ProfileInterface | null = null

  isFav: boolean = false

  ngOnInit(): void {
    /* Se obtiene el parámetro correspondiente al id del producto */
    this.product$ = this.route.queryParams
      .pipe(
        map(params => +params['id']),
        switchMap(id => this.productsService.getProductDetails(id)),
        tap(p => {
          this.product = p
          this.selectedImg = this.selectedImg ?? p.images[0]

          /* Verifica si el producto existe en Favoritos */
          this.isFav = this.favsService.isFavorite(p.id)

          /* Se cargan las Reviews por defecto y las almacenadas en localStorage */
          this.reviewsService.loadReviews(p)
        })
      );     
    
    /* Se crea e inicializa el formulario reactivo para la parte de Reviews */
    this.reviewForm = this.fb.group({
      comment: ['', Validators.required], rating: [1, Validators.required]
    });
    /* Para sincronizar el valor inicial del rating con el array 'stars' */
    this.selectedRating = (this.reviewForm.get('rating')?.value ?? 1) - 1;

    /* Se obtienen los datos del usuario que inició sesión */   
    this.authService.user$
      .pipe(
        tap(u => { 
          /* Si el usuario no ha iniciado sesión, o cierra sesión, se deshabilita el formulario */
          if (!u) { this.user = null
            this.reviewForm.disable()
          } 
        }),
        /* Asegura que 'u' sea un usuario válido */
        filter((u): u is ProfileInterface => u !== null)
      )
      .subscribe(u => { 
        /* Si el usuario ya inició sesión, se guardan sus datos y se habilita el formulario */
        this.user = u
        this.reviewForm.enable()
      });

    /* Verifica si el id del producto existe o no en Favoritos y controla el estado del botón */
    this.favsService.favorites$.subscribe(favs => {
      if (this.product) {
        this.isFav = favs.some(p => p.id === this.product.id)
      }
    });
  }

  /* Controla cuál de las imágenes del producto se está mostrando */
  onSelectImage(thumb: string) {
    if (thumb === this.selectedImg) return
    /* Agrega un pequeño efecto 'fade' previo a cambiar la imagen */
    this.prevImg = this.selectedImg
    this.selectedImg = thumb
    setTimeout(() => this.prevImg = null, 500)
  }

  /* Convierte el valor de la calificación (rating) del producto a íconos */
  rateIcon(rate: number, index: number): string {
    const range = Math.max(0, Math.min(5, rate))
    const full = Math.floor(range)
    const half = range - full >= 0.5 && full < 5

    return index < full ? 'fa-solid fa-star text-yellow-500' : index === full && half ? 'fa-solid fa-star-half-stroke text-yellow-500' 
      : 'fa-regular fa-star text-gray-500'
  } 

  /* Se modifica el texto de la propiedad 'shippingInformation' */
  getShippingText(text?: string): string {
    if (!text) return ''
    return text.replace(/\b(?:Ships in|Ships|In)\b\s*/gi, '').trim()
  }

  /* Agrega o quita el producto de Favoritos cambiando su estado en su service y de manera local con isFav */
  addToFavs(): void {
    if (!this.product) return
    this.favsService.toggleFavorite(this.product)
    this.isFav = this.favsService.isFavorite(this.product.id)

    if(this.isFav) {
      this.showAlert(`\u{e4fd}`, 'Agregado a favoritos', 'El producto se ha añadido correctamente')
    }
  }

  /* Muestra u oculta la lista de opiniones */
  toggleReviews() {
    this.showingReviews = !this.showingReviews
  }

  /* Despliega la lista de opiniones cuando se da clic en el botón 'x Reviews' */
  scrollToReviews(event: Event) {
    event.preventDefault()
    this.showingReviews = true
    setTimeout(() => {
      const list = document.getElementById('reviews-section')
      list?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100);
  }

  /* Controla y actualiza la calificación seleccionada al hacer clic en una estrella */
  selectRating(rating: number) {
    this.selectedRating = rating;
    this.reviewForm.get('rating')?.setValue(rating + 1); //* + 1 ya que stars[] = [0 - 4]
  }

  /* Para guardar la opinión del usuario, verifica si el usuario, producto y formulario son validos y resetea los valores al finalizar */
  submitReview(): void {
    if (!this.user || !this.product || this.reviewForm.invalid) return
    
    this.reviewsService.submitReview(this.user, this.product, this.reviewForm.value)
    this.reviewForm.reset({ comment: '', rating: 0 })
    this.selectedRating = 0
  }

  /* Verifica cuáles opiniones pertenecen al usuario que inició sesión */
  isOwnReview(review: Review): boolean {
    const fullName = `${this.user?.firstName} ${this.user?.lastName ?? ''}`.trim() //* Se concatena nombre y apellido del usuario
    return review.reviewerName === fullName
  }

  /* Para borrar de la memoria una opinión, únicamente aplica a las que guardó el usuario */
  deleteReview(review: Review) {
    if (!this.product) return
    this.reviewsService.deleteReview(this.product, review)
  }

  /* Agrega el producto al carrito, tomando en cuenta la propiedad 'quantity' (creada localmente, no viene de DummyJSON) y respetando el stock disponible del producto */
  onAddToCart(product: ProductsData) {
    const validQ = Math.min(this.quantity, product.stock)
    //* Se crea un nuevo objeto copiando todas las propiedades de 'product' y agrega/sobrescribe 'quantity'
    const productToAdd = { ...product, quantity: validQ }    
    this.navService.onAddToCart(productToAdd)
    this.showAlert(`\u{f218}`, 'Agregado al carrito', 'El producto se ha añadido correctamente a tu carrito')
  }

  /* Redirige a /cart para realizar la compra directamente */
  onPurchase(product: ProductsData) {
    const validQ = Math.min(this.quantity, product.stock)
    const productToAdd = { ...product, quantity: validQ }    
    this.navService.onAddToCart(productToAdd)
    this.router.navigate(['/cart'])
  }

  /* Muestra la ventana emergene, el texto cambia dependiendo si se agregó a Cart o Favorites */
  showAlert(icon: string, title: string, text: string) {
    this.modalService.showModal({
      icon: icon,
      title: title,
      text: text,
      isAlert: true, 
      type: 'info', 
      confirmText: 'Entendido',  
      onConfirm: () => console.log('Close')
    });
  }
}