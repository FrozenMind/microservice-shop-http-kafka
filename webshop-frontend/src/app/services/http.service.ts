import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , of, Subscriber} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private socket: WebSocketSubject<any> = webSocket('ws://localhost:61779');
  private observables: Array<{key: string, obs: Subscriber<any>}> = [];

  constructor(private http: HttpClient) {
    this.socket.asObservable().subscribe(res => {
      switch(res.command) {
        case 'login':
          let obs = this.observables.find(o => o.key == 'login').obs;
          if (res.body.error) {
            obs.error(res.body.error);
          } else {
            obs.next(res.body);
          }
          break;
        default:
        console.log('Received unknown command', res.command);
      }
    });
  }

  ping(port: number): Observable<any> {
    return this.http.get(`http://localhost:${port}/ping`);
  }

  login(email: string, password: string): Observable<any> {
    this.socket.next({ command: 'login', body: { email: email, password: password }})
    let logObs = new Observable(obs => {
      this.observables.push({key: 'login', obs: obs})
    })
    return logObs;
  }

  articles(pricemin: number, pricemax: number): Observable<any> {
    let param = '';
    if (pricemin) {
      param += `pricemin=${pricemin}&`;
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

  getAddress(userId: string): Observable<any> {
    return this.http.get(`http://localhost:61780/address/${userId}`);
  }

  saveAddress(userId: string, address: any): Observable<any> {
    return this.http.put(`http://localhost:61780/address/${userId}`, { address: address });
  }

  getTotalCartPrice(userId: string): Observable<any> {
    return this.http.get(`http://localhost:61780/cart/total-price/${userId}`);
  }

  pay(userId: string): Observable<any> {
    return this.http.put(`http://localhost:61780/pay/${userId}`, {});
  }

  getOrders(userId: string): Observable<any> {
    return this.http.get(`http://localhost:61780/orders/${userId}`);
  }

}
