import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  username: BehaviorSubject<string> = new BehaviorSubject<string>('');
  usernameSub = this.username.asObservable();

  userid: BehaviorSubject<string> = new BehaviorSubject<string>('');
  useridSub = this.userid.asObservable();

  cartAmount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  cartAmountSub = this.cartAmount.asObservable();

  setUsername(name: string) {
    this.username.next(name);
  }

  setUserid(id: string) {
    this.userid.next(id);
  }

  addCartAmount(amount: number) {
    this.cartAmount.next(amount);
  }
}
