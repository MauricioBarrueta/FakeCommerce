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

  constructor(private route: ActivatedRoute, private router: Router, private profileService: ProfileService, private authService: AuthService) {}

  
  ngOnInit(): void {
    this.user$ = this.route.queryParams
      .pipe(
        map(params => + params['id']),
        switchMap(id => this.profileService.getFeaturedProducts(id))
      )
  }

  logOut() {
    this.authService.logOut()
    this.router.navigate(['/products'])
  }


}
