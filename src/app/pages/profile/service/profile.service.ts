import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileInterface } from '../interface/profile.interface';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) {}

  /* Se listan x cantidad de productos */
    getFeaturedProducts(id: number): Observable<ProfileInterface> {
      return this.http.get<ProfileInterface>(`${environment.url}/users/${id}`)         
    }  
  
}
