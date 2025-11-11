import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-img-magnifier',
  imports: [],
  templateUrl: './img-magnifier.html',
})
export class ImgMagnifier implements AfterViewInit, OnChanges {

  @Input() src!: string
  @Input() alt = ''
  @Input() zoom = 2
  @Input() enableOnMobile = false

  @ViewChild('image') imageRef!: ElementRef<HTMLImageElement>
  @ViewChild('glass') glassRef!: ElementRef<HTMLDivElement>

  private initialized = false

  ngAfterViewInit() {
    /* Para evitar que se inicialice en móviles si no tiene los permisos requeridos */
    if (!this.enableOnMobile && window.innerWidth < 768) return

    /* Inicializa la función y actualiza su estado */
    this.initializeMagnifier()
    this.initialized = true
  }

  ngOnChanges(changes: SimpleChanges) {
    /* Mantiene la imagen de fondo de la lupa actualizada de acuerdo a la que se seleccione, siempre y cuando ya se haya inicializado */
    if (changes['src'] && !changes['src'].firstChange && this.initialized) {
      this.updateMagnifierImage()
    }
  }

  /* Crea el efecto de la lupa, asignando la imagen seleccionada como imagen de fondo */
  private initializeMagnifier() {
    const img = this.imageRef.nativeElement
    const glass = this.glassRef.nativeElement

    glass.style.backgroundImage = `url('${img.src}')`

    img.addEventListener('mousemove', e => this.moveMagnifier(e))
    glass.addEventListener('mousemove', e => this.moveMagnifier(e))
    img.addEventListener('mouseenter', () => glass.classList.remove('hidden'))
    img.addEventListener('mouseleave', () => glass.classList.add('hidden'))
  }

  /* Recibe los cambios cada que se selecciona una imagen */
  private updateMagnifierImage() {
    const img = this.imageRef.nativeElement
    const glass = this.glassRef.nativeElement

    /* Actualiza el src tanto del fondo de la lupa como el de la imágen */
    glass.style.backgroundImage = `url('${this.src}')`
    img.src = this.src
  }

  /* Controla el movimiento de la lupa en la imagen */
  private moveMagnifier(e: MouseEvent) {
    const img = this.imageRef.nativeElement
    const glass = this.glassRef.nativeElement
    const rect = img.getBoundingClientRect()

    /* Calcula la posición del cursor relativa a la imagen y limita las coordenadas dentro de su área */
    let x = e.pageX - rect.left - window.scrollX
    let y = e.pageY - rect.top - window.scrollY
    x = Math.max(0, Math.min(x, img.width))
    y = Math.max(0, Math.min(y, img.height))

    const w = glass.offsetWidth / 2
    const h = glass.offsetHeight / 2

    /* Posiciona el lente centrado en el cursor */
    glass.style.left = `${x - w}px`
    glass.style.top = `${y - h}px`
    glass.style.backgroundPosition = `-${(x * this.zoom) - w}px -${(y * this.zoom) - h}px`
    glass.style.backgroundSize = `${img.width * this.zoom}px ${img.height * this.zoom}px`
  }
}