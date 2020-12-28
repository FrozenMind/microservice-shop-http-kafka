import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  totalPrice: number = 0;
  address: any;
  changeAddressMode = false;
  userId: number;

  constructor(private state: StateService,
    private httpService: HttpService) { }

  ngOnInit(): void {
    this.state.useridSub.subscribe(id => {
      this.userId = id;
      this.httpService.getAddress(this.userId).subscribe(res => {
        this.address = res.address;
      }, err => {
        console.error('Get Address failed', err);
        if (err.status == 404) {
          this.address = {};
          this.changeAddressMode = true;
        }
      });
      this.httpService.getTotalCartPrice(this.userId).subscribe(res => {
        console.log('Got total price', res.totalPrice);
        this.totalPrice = res.totalPrice;
      }, err => {
        console.error('Error while getting total price', err);
      });
    });
  }

  saveAddress() {
    this.httpService.saveAddress(this.userId, this.address).subscribe(res => {
      this.address = res.address;
      this.changeAddressMode = false;
    }, err => {
      console.error('Failed to save Address', err);
    });
  }

  pay() {
    console.log('Pay');

  }
}
