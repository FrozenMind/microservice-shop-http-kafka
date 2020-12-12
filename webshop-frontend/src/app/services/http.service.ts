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
}
