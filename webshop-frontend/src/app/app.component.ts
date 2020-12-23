import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from './services/http.service';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  webshopBackendServiceStatus: any = { status: 'unknown' };
  articleServiceStatus: any = { status: 'unknown' };
  cartServiceStatus: any = { status: 'unknown' };
  loginServiceStatus: any = { status: 'unknown' };
  paymentServiceStatus: any = { status: 'unknown' };
  profileServiceStatus: any = { status: 'unknown' };
  username: string;
  cartAmount: number;

  constructor(private httpService: HttpService,
    private state: StateService,
    private router: Router) { }

  ngOnInit() {
    this.getServiceState();
    this.state.usernameSub.subscribe(name => {
      this.username = name;
      if (name == '') {
        this.username = 'Not logged in';
        this.router.navigate([`/login`]);
      }
    })
    this.state.cartAmountSub.subscribe(amount => {
      this.cartAmount = amount;
    })
  }

  getServiceState() {
    this.httpService.ping(61780).subscribe(res => {
      this.webshopBackendServiceStatus = res;
    }, err => {
      this.webshopBackendServiceStatus = { status: 'not-running' };
    });
    this.httpService.ping(61781).subscribe(res => {
      this.articleServiceStatus = res;
    }, err => {
      this.articleServiceStatus = { status: 'not-running' };
    });
    this.httpService.ping(61782).subscribe(res => {
      this.cartServiceStatus = res;
    }, err => {
      this.cartServiceStatus = { status: 'not-running' };
    });
    this.httpService.ping(61783).subscribe(res => {
      this.loginServiceStatus = res;
    }, err => {
      this.loginServiceStatus = { status: 'not-running' };
    });
    this.httpService.ping(61784).subscribe(res => {
      this.paymentServiceStatus = res;
    }, err => {
      this.paymentServiceStatus = { status: 'not-running' };
    });
    this.httpService.ping(61785).subscribe(res => {
      this.profileServiceStatus = res;
    }, err => {
      this.profileServiceStatus = { status: 'not-running' };
    });
  }

  goToCart() {
    this.router.navigate([`/cart`]);
  }

  logout() {
    this.state.setUsername('');
    this.state.setUserid('');
    this.state.setCartAmount(0);
    this.router.navigate([`/login`]);
  }
}
