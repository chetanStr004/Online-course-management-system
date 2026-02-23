import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-backdrop" *ngIf="(loader.loading$ | async)">
      <div class="loader-wrap">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [
    `:host { position: relative; z-index: 1300; }
    .loader-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loader-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      border-radius: 8px;
      background: rgba(255,255,255,0.95);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    .spinner {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 4px solid rgba(0,0,0,0.08);
      border-top-color: #1976d2;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ],
})
export class LoaderComponent {
  constructor(public loader: LoaderService) {}
}
