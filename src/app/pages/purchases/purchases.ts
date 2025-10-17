import { Component, OnInit } from '@angular/core';
import { ProductsData } from '../products/interface/products.interface';
import { PurchaseInterface } from './interface/purchase.interface';
import { Observable } from 'rxjs';
import { PurchaseService } from './service/purchase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchases',
  imports: [CommonModule],
  templateUrl: './purchases.html',
  styleUrl: './purchases.scss'
})
export class Purchases implements OnInit {
  
  purchases$!: Observable<PurchaseInterface[]>;
  purchase: PurchaseInterface[] = []

  constructor(private purchasesService: PurchaseService) {}

  ngOnInit(): void {
    this.purchases$ = this.purchasesService.purchases$
      this.purchasesService.purchases$.subscribe(p => this.purchase = p);
  }

  deletePurchase(id: number) {
    this.purchasesService.deletePurchase(id);
  }

  clearAllPurchases() {
    this.purchasesService.clearPurchases();
  }

}
