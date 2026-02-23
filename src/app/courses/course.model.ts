export interface Course {
  id?: number;
  name: string;
  description: string;
  student_limit: number;
  instructor_id: number;
  type: 'MANDATORY' | 'OPTIONAL';
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
}
