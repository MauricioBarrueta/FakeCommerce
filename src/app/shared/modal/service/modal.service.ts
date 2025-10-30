import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalInterface } from '../interface/modal.interface';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  //? Se define como Subject para que se pueda subscribir desde cualquiér componente y para emitir valores con .next()
  private modalDataSubject = new Subject<ModalInterface>()
  modalData$ = this.modalDataSubject.asObservable()

  /* Se cambia el estado del Modal */
  showModal(data: ModalInterface) {
    this.modalDataSubject.next(data)
  }  
}