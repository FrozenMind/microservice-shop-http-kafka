import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { StateService } from '../services/state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string = 'tu@gmail.com';
  public password: string = 'pass';

  constructor(private httpService: HttpService,
    private router: Router,
    private state: StateService) { }

  ngOnInit() {
  }

  login() {
    console.log('Try to login email', this.email, 'password', this.password);
    this.httpService.login(this.email, this.password).subscribe(res => {
      console.log('Login successful. Got user', res);
      this.router.navigate([`/article`]);
      this.state.setUsername(res.name);
      this.state.setUserid(res.userid);
      this.state.addCartAmount(res.cartAmount);
    }, err => {
      console.error('Failed to login', err);
    })
  }

}
