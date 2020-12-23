import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  userid: string;
  articles: any[];

  constructor(private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userid = params['userid'];
      console.log('Load article page for userid', this.userid);
    })
    this.httpService.articles(undefined, undefined).subscribe(res => {
      console.log('Received articles', res);
      this.articles = res;
    }, err => {
      console.error('Did not receive articles', err);
    })
  }

  addToCart(articleId: number) {
    // TODO: get size somehow
    this.httpService.addToCart(this.userid, articleId, 'M').subscribe(res => {
      console.log('Added article to cart');
    }, err => {
      console.error('Failed to add article to cart');
    })
  }

  goToCart() {
    this.router.navigate([`/cart/${this.userid}`]);
  }
}
