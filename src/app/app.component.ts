import { Component } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ ADD THIS

import { LoaderComponent } from './shared/loader.component';
import { LoaderService } from './shared/loader.service';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,        // ✅ REQUIRED FOR *ngIf
    RouterOutlet,
    LoaderComponent,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showNavbar = false;

  constructor(router: Router, loader: LoaderService) {

    // Loader (unchanged)
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) loader.show();

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) loader.hide();
    });

    // Navbar visibility
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar = !['/login', '/signup'].includes(event.urlAfterRedirects);
      });
  }
}
