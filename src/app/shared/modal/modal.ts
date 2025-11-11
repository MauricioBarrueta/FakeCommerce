import { Component, OnInit } from '@angular/core';
import { ModalService } from './service/modal.service';
import { ModalInterface } from './interface/modal.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [ CommonModule ],
  templateUrl: './modal.html',
})
export class Modal implements OnInit {

  isVisible = false
  // mouseEnter = false

  /* Para prevenir errores por 'undefined' al inicializar */
  modalData: ModalInterface = {
    icon: '',
    title: '',
    text: '',
    isAlert: false,
    type: 'info',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: () => {}
  };

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    /* Se suscribe al Observable del service */
    this.modalService.modalData$.subscribe((data) => {
      if (data) {
        /* Combina los valores recibidos con los existentes para conservar propiedades por defecto */
        this.modalData = { ...this.modalData, ...data }
        this.isVisible = true
      } else {
        this.isVisible = false
      }
    });
  }

  /* Acción del botón de confirmación */
  confirm() {
    this.modalData.onConfirm?.()
    this.isVisible = false
  }

  /* Acción del botón de cancelación */
  cancel() {
    this.modalData.onCancel?.()
    this.isVisible = false
  }
}