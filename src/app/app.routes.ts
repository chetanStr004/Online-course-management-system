import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // 🔹 Default route → Dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // 🔹 Auth routes
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./auth/signup/signup.component').then(m => m.SignupComponent)
  },

  // 🔹 Protected routes
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./user/user.component').then(m => m.UserComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./courses/course.component').then(m => m.CourseComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'student_course_mappings',
    loadComponent: () =>
      import('./student-course-mapping/student-course-mapping.component')
        .then(m => m.StudentCourseMappingComponent),
    canActivate: [AuthGuard]
  },

  // 🔹 Fallback
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
