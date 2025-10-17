import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ProfileInterface } from '../interface/profile.interface';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) {}

  //! REGRESAR A COMO ANTES
  /* Se listan x cantidad de productos */
    getLoggedUserInfo(id: number): Observable<ProfileInterface> {
      return this.http.get<ProfileInterface>(`${environment.url}/users/${id}`)
      // return this.http.get<ProfileInterface>(`${environment.url}/auth/me`)         
    }  




  
}
