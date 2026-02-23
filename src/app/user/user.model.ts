export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'INSTRUCTOR' | 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
}
