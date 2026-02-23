/** REQUEST DTO – MATCHES StudentCourseDTO */
export interface StudentCourseSaveRequest {
  studentIds: number[];
  courseIds: number[];
  flag: 'save' | 'delete';
}

/** FLAT RESPONSE FROM getSC API */
export interface StudentCourseFlatResponse {
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
}

/** FRONTEND GROUPED VIEW (TABLE ONLY) */
export interface StudentCourseGroupedView {
  studentId: number;
  studentName: string;
  courseNames: string;
}
