import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ProductsData, ProductsResponse } from '../../pages/products/interface/products.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CategoriesInterface } from '../../pages/products/interface/categories.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) {}

  /* Se listan x cantidad de productos */
  getFeaturedProducts(limit: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.url}/products?limit=${limit}`)         
  }  

  /* Se obtienen los productos por su tipo */
  getProductByType(type: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.url}/products/search?q=${type}`)
  }

  /* Se ordena la lista (ascendente o descendente) */
  sortProducts(sortBy: string, limit: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.url}/products?sortBy=title&order=${sortBy}&limit=${limit}`)
  }

  /* Se obtienen todos los detalles del producto */
  getProductDetails(id: number): Observable<ProductsData> {
    return this.http.get<ProductsData>(`${environment.url}/products/${id}`)      
  } 

  /* Se listan las categorías de los productos */
  getCategories(): Observable<CategoriesInterface[]> {
    return this.http.get<CategoriesInterface[]>(`${environment.url}/products/categories`)
  }

  /* Se listan todos los productos correspondientes a la categoría */
  getProductsByCategory(category: string, limit?: number): Observable<ProductsResponse> {
    let url = `${environment.url}/products/category/${category}`
    if(limit) {
      url += `?limit=${limit}`
    }
    return this.http.get<ProductsResponse>(url)
  } 
}