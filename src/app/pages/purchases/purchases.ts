import { Component, OnInit } from '@angular/core';
import { PurchaseInterface } from './interface/purchase.interface';
import { Observable } from 'rxjs';
import { PurchaseService } from './service/purchase.service';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../shared/modal/service/modal.service';
import { NavService } from '../../shared/service/navigation.service';

@Component({
  selector: 'app-purchases',
  imports: [CommonModule],
  templateUrl: './purchases.html',
})
export class Purchases implements OnInit {
  
  purchases$!: Observable<PurchaseInterface[]>
  purchase: PurchaseInterface[] = []

  constructor(private purchasesService: PurchaseService, private modalService: ModalService, private navService: NavService) {}

  ngOnInit(): void {
    /* Se subscribe al Observable para mantener a la variable local actualizada */
    this.purchases$ = this.purchasesService.purchases$
    this.purchasesService.purchases$.subscribe(p => this.purchase = p)
  }

  /* Redirige a los detalles del producto seleccionado */
  getProductData(id: number) {
    this.navService.getProductDetails(id)
  }

  /* Para eliminar de manera individual una compra */
  deletePurchase(id: number) {
    this.confirmDelete(`\u{2753}`, 'Borrar compra', '¿Estás seguro de que quieres eliminar esta compra de tu historial? La acción será irreversible', () => { this.purchasesService.deletePurchase(id) })
  }

  /* Para eliminar de manera general todas las compras */
  clearPurchasesList() {
    this.confirmDelete(`\u{2753}`, 'Vaciar lista de compras', 
      '¿Estás seguro de que quieres eliminar todo tu historial de compras? La acción será irreversible', () => { this.purchasesService.clearPurchases() })
  }

  /* Muestra una ventana de confirmación previo a eliminar, ya sea de manera individual o toda la lista */
  confirmDelete(icon: string, title: string, text: string, onConfirm: () => void) {
    this.modalService.showModal({
      icon: icon,
      title: title,
      text: text,
      isAlert: false,
      type: 'confirm',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm,
    });
  }
}