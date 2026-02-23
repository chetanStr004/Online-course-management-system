import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from './course.model';
import { ApiResponse } from '../shared/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CourseService {

  private baseUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/getCourses`);
  }

  save(course: Course): Observable<ApiResponse<Course>> {
    return this.http.post<ApiResponse<Course>>(
      `${this.baseUrl}/saveCourses`,
      course
    );
  }
}
