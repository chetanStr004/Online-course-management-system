import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(form: NgForm) {
    if (form.invalid) return;

    this.auth.login(this.loginData).subscribe({
      next: (res) => {
        if (res.success) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('User', res.data.name);
            localStorage.setItem('token', res.data.token);
          }
          this.toast.success('Login successful');
          this.router.navigate(['/dashboard']);
        } else {
          this.toast.error(res.message);
        }
      },
      error: () => this.toast.error('Login failed'),
    });
  }
}
