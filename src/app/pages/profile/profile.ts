import { Component, OnInit } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { ProfileInterface } from './interface/profile.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from './service/profile.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/service/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {

  id: number = 0
  user$!: Observable<ProfileInterface>
  showingBankData: boolean = false

  constructor(private route: ActivatedRoute, private router: Router, private profileService: ProfileService, private authService: AuthService) {}

  
  ngOnInit(): void {
    this.user$ = this.route.queryParams
      .pipe(
        map(params => + params['id']),
        switchMap(id => this.profileService.getLoggedUserInfo(id))
      )
  }

  // logOut() {
  //   this.authService.logOut()
  //   this.router.navigate(['/products'])
  // }


  maskPhone(phone: string): string {
  if (!phone) return '';

  // Elimina espacios
  const clean = phone.replace(/\s+/g, '');
  // Toma los primeros 3 y los últimos 3 caracteres visibles
  const first = clean.slice(0, 3);
  const last = clean.slice(-3);

  return `${first} ***-*** ${last}`;
}

  maskCard(num: string): string {
    if(!num) return ''
      const clean = num.replace(/\s+/g, '')
      const last = clean.slice(-4)

      return `**** **** **** ${last}`
  }

  toggleBankData() {
    this.showingBankData = !this.showingBankData;
  } 

  


}
