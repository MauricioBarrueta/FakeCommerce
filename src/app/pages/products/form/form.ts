import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductsData } from '../interface/products.interface';
import { CategoriesInterface } from '../interface/categories.interface';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './form.html',
  styleUrl: './form.scss'
})
export class ProductsForm {
  
  type: string = ''
  isSortAsc: boolean = true
  limit: number = 10
  stock!: number  

  @Input() categories$!: Observable<CategoriesInterface[]>
  @Output() filterByCategory = new EventEmitter<string>()
  @Output() filterByType = new EventEmitter<string>()
  @Output() listProducts = new EventEmitter<number>()
  @Output() sortList = new EventEmitter<void>() 

  byCategory(category: string) { this.filterByCategory.emit(category) }
  byLimit(limit: number) { this.listProducts.emit(limit) }
  byType(type: string) { this.filterByType.emit(type) }
  sortBy() { this.sortList.emit() }  
}