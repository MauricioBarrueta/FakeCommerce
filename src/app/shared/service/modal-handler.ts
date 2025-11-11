import { Injectable } from '@angular/core';
import { ModalService } from '../modal/service/modal.service';

@Injectable({
  providedIn: 'root'
})
export class ModalHandler {

  constructor(private modalService: ModalService) {}

  /* Muestra el modal de tipo Alert Info */
  alertModal(icon: string, title: string, text: string) {
    this.modalService.showModal({
      icon: icon,
      title: title,
      text: text,
      isAlert: true, 
      type: 'info', 
      confirmText: 'Aceptar' 
    });
  }

  /* Muestra el modal de tipo Alert Warning */
   warningModal(icon: string, title: string, text: string) {
    this.modalService.showModal({
      icon: icon,
      title: title,
      text: text,
      isAlert: true, 
      type: 'warning', 
      confirmText: 'Entendido' 
    });
  }  

  /* Muestra el modal de tipo Confirmación */
  confirmModal(icon: string, title: string, text: string, onConfirm: () => void) {
    this.modalService.showModal({
      icon: icon,
      title: title,
      text: text,
      isAlert: false,
      type: 'confirm',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm
    });
  }  
}