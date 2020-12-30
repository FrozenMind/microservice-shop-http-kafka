import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  userid: string;
  articles: any;

  constructor(private state: StateService,
    private httpService: HttpService,
    private router: Router) { }

  ngOnInit(): void {
    this.state.useridSub.subscribe(id => {
      this.userid = id;
      console.log('Load cart page for userid', this.userid);
      this.httpService.cart(this.userid).subscribe(res => {
        console.log('Received cart', res);
        this.articles = res;
      }, err => {
        console.error('Did not receive cart', err);
      })
    })
  }

  removeFromCart(articleId: number) {
    this.httpService.removeFromCart(this.userid, articleId).subscribe(res => {
      console.log('Removed articleid', articleId, 'from cart');
      let index = this.articles.findIndex(a => a.articleId == articleId)
      if (index != -1) {
        this.articles.splice(index, 1);
      }
      this.state.addCartAmount(-1)
    }, err => {
      console.error('Failed to remove article from server', err);
    });
  }

  changeAmount(articleId: number, amount: number) {
    this.httpService.changeAmount(this.userid, articleId, amount).subscribe(res => {
      console.log('Amount changed succesful for articleid', articleId);
      let index = this.articles.findIndex(a => a.articleId == articleId)
      if (index != -1) {
        let newAmount = parseInt(res.newAmount);
        this.state.addCartAmount(newAmount- this.articles[index].amount)
        this.articles[index].amount = newAmount;
      }
    }, err => {
      console.error('Failed to remove article from server', err);
    });
  }

  totalPrice() {
    let sum = 0;
    if (this.articles) {
      this.articles.forEach(a => sum += a.price * a.amount);
    }
    return sum;
  }

  checkout() {
    console.log('Checkout from cart');
    this.router.navigate(['/checkout']);
  }
}
