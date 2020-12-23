import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  userid: string;
  articles: any;

  constructor(private route: ActivatedRoute,
    private httpService: HttpService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userid = params['userid'];
      console.log('Load cart for userid', this.userid);
    })
    this.httpService.cart(this.userid).subscribe(res => {
      console.log('Received cart', res);
      this.articles = res;
    }, err => {
      console.error('Did not receive cart', err);
    })
  }

}
