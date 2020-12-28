import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  userId: string;
  orders: Array<any>;

  constructor(private state: StateService,
    private httpService: HttpService) { }

  ngOnInit(): void {
    this.state.useridSub.subscribe(id => {
      this.userId = id;
      this.httpService.getOrders(this.userId).subscribe(orders => {
        console.log('Received orders', orders);
        this.orders = orders;
      }, err => {
        console.error('Failed to get orders');
      })
    })
  }

}
