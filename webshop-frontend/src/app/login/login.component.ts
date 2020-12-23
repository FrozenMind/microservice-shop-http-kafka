import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string = '';
  public password: string = '';

  constructor(private httpService: HttpService,
   private router: Router) { }

  ngOnInit() {
  }

  login() {
    console.log('Try to login email', this.email, 'password', this.password);
    this.httpService.login(this.email, this.password).subscribe(res => {
      console.log('Login successful. Got user', res);
      this.router.navigate([`/article/${res.userid}`]);
    }, err => {
      console.error('Failed to login', err);
    })
  }

}
