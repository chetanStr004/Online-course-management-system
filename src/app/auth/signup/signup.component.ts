import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupData = {
    name: '',
    email: '',
    password: '',
    role: '',
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastrService
  ) {}

  signup(form: NgForm) {
    if (form.invalid) return;

    this.auth.signup(this.signupData).subscribe({
      next: (res) => {
        console.log('Signup response:', res);
        
        // Backend returns plain text response
        const message = typeof res === 'string' ? res : (res?.message || 'Signup successful');
        this.toast.success(message);
        
        // Delay redirect to ensure toast is shown
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (err) => {
        console.log('Signup error:', err);
        
        // Extract error message from response
        let errorMessage = 'Signup failed';
        
        if (err.error) {
          errorMessage = typeof err.error === 'string' ? err.error : (err.error?.message || err.error);
        }
        
        this.toast.error(errorMessage);
      },
    });
  }
}
