export class ImageMagnifier {
  magnifier: HTMLElement | null = null;
  zoom: number;

  constructor(zoom = 2) {
    this.zoom = zoom;
  }

  activate(img: HTMLImageElement, container: HTMLElement) {
    if (this.magnifier) return;

    this.magnifier = document.createElement('div');
    this.magnifier.classList.add('img-magnifier-glass');
    container.appendChild(this.magnifier);

    // Ajuste: backgroundImage debe actualizarse si cambia la img
    this.magnifier.style.backgroundImage = `url('${img.src}')`;
    this.magnifier.style.backgroundSize = `${img.width * this.zoom}px ${img.height * this.zoom}px`;
  }

  deactivate() {
    if (this.magnifier) {
      this.magnifier.remove();
      this.magnifier = null;
    }
  }

  move(e: MouseEvent) {
  if (!this.magnifier) return;

  const img = e.target as HTMLImageElement; // se obtiene la imagen desde el evento
  if (!img) return;

  const rect = img.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const glass = this.magnifier!;
  const glassSize = glass.offsetWidth / 2;

  glass.style.left = `${x - glassSize}px`;
  glass.style.top = `${y - glassSize}px`;
  glass.style.backgroundPosition = `-${x * this.zoom - glassSize}px -${y * this.zoom - glassSize}px`;
}

}
