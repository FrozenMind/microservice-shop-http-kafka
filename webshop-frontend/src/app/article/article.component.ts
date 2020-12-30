import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../services/http.service';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  userid: string;
  articles: any[];
  pricemin: number;
  pricemax: number;

  constructor(private httpService: HttpService,
    private state: StateService) { }

  ngOnInit(): void {
    this.state.useridSub.subscribe(id => {
      this.userid = id;
      console.log('Load article page for userid', this.userid);
    })
    this.httpService.articles(this.pricemin, this.pricemax).subscribe(res => {
      console.log('Received articles', res);
      this.articles = res;
    }, err => {
      console.error('Did not receive articles', err);
    })
  }

  addToCart(articleId: number) {
    this.httpService.addToCart(this.userid, articleId).subscribe(res => {
      console.log('Added article to cart');
      this.state.addCartAmount(1);
    }, err => {
      console.error('Failed to add article to cart');
    })
  }

  applyFilter() {
    this.httpService.articles(this.pricemin, this.pricemax).subscribe(res => {
      console.log('Received articles', res);
      this.articles = res;
    }, err => {
      this.articles = [];
      console.error('Did not receive articles', err);
    })
  }

}
