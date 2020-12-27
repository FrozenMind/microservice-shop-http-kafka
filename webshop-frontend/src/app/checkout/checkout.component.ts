import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  totalPrice: number = 0;
  address: any;
  changeAddressMode = false;

  constructor() { }

  ngOnInit(): void {
  }

  saveAddress() {
    this.changeAddressMode = false;
  }
}
