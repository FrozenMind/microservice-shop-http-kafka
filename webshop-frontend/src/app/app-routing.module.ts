import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ArticleComponent } from './article/article.component';
import { CartComponent } from './cart/cart.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'article', component: ArticleComponent },
  { path: 'cart', component: CartComponent },
  { path: '**', redirectTo: '/login' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
