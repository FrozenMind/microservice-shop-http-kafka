import { Component, OnInit } from '@angular/core';
import { HttpService } from './services/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  webshopBackendServiceStatus: any;
  articleServiceStatus: any;
  cartServiceStatus: any;
  loginServiceStatus: any;
  paymentServiceStatus: any;
  profileServiceStatus: any;

constructor(private httpService: HttpService) { }

  ngOnInit() {
    this.httpService.ping(61780).subscribe(res => {
      this.webshopBackendServiceStatus = res;
    }, err => {
      this.webshopBackendServiceStatus = err;
    });
    this.httpService.ping(61781).subscribe(res => {
      this.articleServiceStatus = res;
    }, err => {
      this.articleServiceStatus = err;
    });
    this.httpService.ping(61782).subscribe(res => {
      this.cartServiceStatus = res;
    }, err => {
      this.cartServiceStatus = err;
    });
    this.httpService.ping(61783).subscribe(res => {
      this.loginServiceStatus = res;
    }, err => {
      this.loginServiceStatus = err;
    });
    this.httpService.ping(61784).subscribe(res => {
      this.paymentServiceStatus = res;
    }, err => {
      this.paymentServiceStatus = err;
    });
    this.httpService.ping(61785).subscribe(res => {
      this.profileServiceStatus = res;
    }, err => {
      this.profileServiceStatus = err;
    });
  }

}
