import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../user/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  // 🔹 Get users by type (ALL / INSTRUCTOR / STUDENT)
  getUsersByType(type: string): Observable<User[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<User[]>(`${this.baseUrl}/getUsers`, { params });
  }

  save(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/saveUsers`, user);
  }
}
