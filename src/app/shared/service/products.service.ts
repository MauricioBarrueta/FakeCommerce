import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsData, ProductsResponse } from '../../pages/products/interface/products.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CategoriesInterface } from '../../pages/products/interface/categories.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) {}

  /* Se obtiene x cantidad de productos */
  getFeaturedProducts(limit: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.url}/products?limit=${limit}`)         
  }  

  /* Se obtienen los productos de acuerdo a su tipo */
  getProductByType(type: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.url}/products/search?q=${type}`)
  }

  /* Ordena los resultados de manera ascendente o descendente de acuerdo al nombre del producto */
  sortProducts(sortBy: string, limit?: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.url}/products?sortBy=title&order=${sortBy}`)
  }

  /* Se obtienen los detalles del producto mediante su id */
  getProductDetails(id: number): Observable<ProductsData> {
    return this.http.get<ProductsData>(`${environment.url}/products/${id}`)      
  } 

  /* Se Obtienen todas las categorías de productos */
  getCategories(): Observable<CategoriesInterface[]> {
    return this.http.get<CategoriesInterface[]>(`${environment.url}/products/categories`)
  }

  /* Se filtran los resultados de acuerdo a su categoría */
  getProductsByCategory(category: string, limit?: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.url}/products/category/${category}`)
    // let url = `${environment.url}/products/category/${category}`
    // if(limit) {
    //   url += `?limit=${limit}`
    // }
    // return this.http.get<ProductsResponse>(url)
  } 
}