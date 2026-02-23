import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    userName: string = 'User';

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    cards = [
        {
            title: 'User Management',
            description: 'Create, update, and manage system users and their roles.',
            icon: 'users',
            route: '/users',
            color: '#3b82f6'
        },
        {
            title: 'Course Management',
            description: 'Design and manage educational courses and instructor assignments.',
            icon: 'book',
            route: '/courses',
            color: '#10b981'
        },
        {
            title: 'Student Mapping',
            description: 'Map students to their respective courses and tracking progress.',
            icon: 'mapping',
            route: '/student_course_mappings',
            color: '#f59e0b'
        }
    ];

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.userName = localStorage.getItem('User') || 'User';
        }
    }
}
