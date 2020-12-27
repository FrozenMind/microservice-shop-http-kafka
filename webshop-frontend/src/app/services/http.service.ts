import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  ping(port: number): Observable<any> {
    return this.http.get(`http://localhost:${port}/ping`);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.put('http://localhost:61780/login', { email: email, password: password });
  }

  articles(pricemin: number, pricemax: number): Observable<any> {
    let param = '';
    if (pricemin) {
      param += `pricemin=${pricemin}`;
    }
    if (pricemax) {
      param += `pricemax=${pricemax}`;
    }
    return this.http.get(`http://localhost:61780/article?${param}`);
  }

  addToCart(userid: string, articleId: number): Observable<any> {
    return this.http.post(`http://localhost:61780/cart/${userid}`, { articleId: articleId });
  }

  cart(userid: string): Observable<any> {
    return this.http.get(`http://localhost:61780/cart/${userid}`);
  }

  removeFromCart(userid: string, articleId: number): Observable<any> {
    return this.http.delete(`http://localhost:61780/cart/${userid}/${articleId}`);
  }

  changeAmount(userid: string, articleId: number, amount: number): Observable<any> {
    return this.http.put(`http://localhost:61780/cart/${userid}/${articleId}`, { amount: amount });
  }

}
