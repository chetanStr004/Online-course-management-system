import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentCourseService {

  private baseUrl = `${environment.apiUrl}/student-course`;

  constructor(private http: HttpClient) { }

  /* ===================== GET ===================== */

  // Get all mappings OR by studentId
  getAll(studentId?: number): Observable<any[]> {
    let params = new HttpParams();

    if (studentId !== undefined) {
      params = params.set('studentId', studentId.toString());
    }

    return this.http.get<any[]>(`${this.baseUrl}/getSC`, { params });
  }

  /* ===================== SAVE / UPDATE ===================== */

  /**
   * Assign / Update student-course mapping
   * Backend deletes old mappings & inserts new ones
   */
  save(payload: {
    studentIds: number[];
    courseIds: number[];
    flag: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/saveSC`, payload);
  }

  /* ===================== DELETE ===================== */

  /**
   * Delete mapping for given students
   */
  deleteByStudents(studentIds: number[]): Observable<any> {
    const payload = {
      studentIds,
      courseIds: [],
      flag: 'delete'
    };

    return this.http.post<any>(`${this.baseUrl}/saveSC`, payload);
  }

  /* ===================== DROPDOWNS ===================== */

  // Get students list
  getStudents(): Observable<any[]> {
    // backend exposes a getUsers endpoint which accepts a 'type' param
    return this.http.get<any[]>(`${environment.apiUrl}/users/getUsers`, { params: { type: 'STUDENT' } as any });
  }

  // Get courses list
  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/courses/getCourses`);
  }
}
