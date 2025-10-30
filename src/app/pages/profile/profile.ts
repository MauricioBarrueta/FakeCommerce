import { Component, OnInit } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { ProfileInterface } from './interface/profile.interface';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from './service/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {

  id: number = 0
  username: string = ''
  user$!: Observable<ProfileInterface | null>;

  showingBankData: boolean = false

  constructor(private route: ActivatedRoute, private profileService: ProfileService) {}
  
  ngOnInit(): void {
    /* Se obtiene el username que viene como parámetro en la URL */
    this.user$ = this.route.queryParams
      .pipe(
        switchMap(params => {
          const username = params['username']
          /* Verifica si existe el parámetro, si no existe, devuelve null, si sí, llama al servicio */
          if (!username) return of(null)
          return this.profileService.getUserByUsername(username)
        }),
      );
  }

  /* Reformatean el número telefónico y el número de tarjeta para mostrar solo algunos dígitos visibles */
  maskPhoneNumber(phone: string): string {
    if (!phone) return ''
    const clean = phone.replace(/\s+/g, '') //* Se borran los espacios
    /* Se toman los 3 primeros y 3 últimos caracteres para retornar la cadena ya censurada */
    const first = clean.slice(0, 3)
    const last = clean.slice(-3)
    return `${first} ***-*** ${last}`
  }

  maskCardNumber(num: string): string {
    if(!num) return ''
      const clean = num.replace(/\s+/g, '')
      /* Se toman los últimos 4 caracteres para retornar la cadena ya censurada */
      const last = clean.slice(-4)
      return `**** **** **** ${last}`
  }

  /* Muestra u oculta la sección de los datos bancarios */
  toggleBankData() {
    this.showingBankData = !this.showingBankData;
  } 
}