import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CategoriesInterface } from '../interface/categories.interface';
import { debounceTime, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './form.html',
})
export class ProductsForm implements OnInit {
  
  type: string = ''
  isSortAsc: boolean = true
  limit: number = 10
  stock!: number  

  @Input() categories$!: Observable<CategoriesInterface[]>
  @Output() filterByCategory = new EventEmitter<string>()
  @Output() filterByType = new EventEmitter<string>()
  @Output() listProducts = new EventEmitter<number>()
  @Output() sortList = new EventEmitter<boolean>()

  byTypeControl = new FormControl('')

  ngOnInit() {
    /* Delay de 5seg entre pulsaciones de teclas al filtrar lista por 'Tipo' */
    this.byTypeControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(value => this.filterByType.emit(value ?? '')); //* Se asegura que si el valor es nulo se envíe un valor vacío
  }

  /* Métodos que filtran los resultados de acuerdo a su categoría, límite, tipo, orden */
  byCategory(category: string) { 
    this.filterByCategory.emit(category) 
  }

  byLimit(limit: number) { 
    this.listProducts.emit(limit) 
  }

  byType(type: string) { 
    this.filterByType.emit(type) 
  }

  sortBy() {
    this.isSortAsc = !this.isSortAsc
    this.sortList.emit(this.isSortAsc)
  }
}