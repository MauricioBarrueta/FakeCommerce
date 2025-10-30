import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProfileInterface } from '../interface/profile.interface';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) {}
  
  getUserByUsername(username: string): Observable<ProfileInterface | null> {
    return this.http.get<{ users: ProfileInterface[] }>(`${environment.url}/users/search?q=${username}`)
      .pipe(
        map(response => response.users.length > 0 ? response.users[0] : null)
      );
  }
}