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

  /* Se obtienen los detalles del producto mediante su id */
  getProductDetails(id: number): Observable<ProductsData> {
    return this.http.get<ProductsData>(`${environment.url}/products/${id}`)      
  } 

  /* Se Obtienen todas las categorías de productos */
  getCategories(): Observable<CategoriesInterface[]> {
    return this.http.get<CategoriesInterface[]>(`${environment.url}/products/categories`)
  }

  /* Se obtiene x cantidad de productos */
  getFeaturedProducts(limit: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.url}/products?limit=${limit}`)
  }

  /* Se obtienen los productos de acuerdo a su tipo */
  getProductByType(type: string, limit?: number, sortBy?: string): Observable<ProductsResponse> {
    let url = `${environment.url}/products/search?q=${type}`
    
    /* Verifica si los parámetros limit o sortBy traen valor, si alguno trae, se agrega a la url */
    if (limit) url += `&limit=${limit}`
    if (sortBy) url += `&sortBy=title&order=${sortBy}`

    return this.http.get<ProductsResponse>(url)
  }

  /* Ordena los resultados de manera ascendente o descendente de acuerdo al nombre del producto */
  sortProducts(sortBy: string, limit?: number): Observable<ProductsResponse> {
    let url = `${environment.url}/products?sortBy=title&order=${sortBy}`
    if (limit) url += `&limit=${limit}`
    return this.http.get<ProductsResponse>(url)
  }

  /* Se filtran los resultados de acuerdo a su categoría */
  getProductsByCategory(category: string, limit?: number, sortBy?: string): Observable<ProductsResponse> {
    let url = `${environment.url}/products/category/${category}`

    /* Verifica si los parámetros limit o sortBy traen valor, si se cumple sortBy, se agrega primero a la url usando '?' */
    if (sortBy) url += `?sortBy=title&order=${sortBy}`
    if (limit) url += sortBy ? `&limit=${limit}` : `?limit=${limit}`
    
    return this.http.get<ProductsResponse>(url)
  }
}