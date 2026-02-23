import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private renderer: Renderer2;
    private currentTheme: 'light' | 'dark' = 'light';
    private isBrowser: boolean;

    constructor(
        rendererFactory: RendererFactory2,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        this.renderer = rendererFactory.createRenderer(null, null);
        this.loadTheme();
    }

    toggleTheme(): void {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        if (this.isBrowser) {
            localStorage.setItem('theme', this.currentTheme);
        }
    }

    isDarkMode(): boolean {
        return this.currentTheme === 'dark';
    }

    private loadTheme(): void {
        let savedTheme: 'light' | 'dark' | null = null;
        if (this.isBrowser) {
            savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        }

        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else if (this.isBrowser && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.currentTheme = 'dark';
        }
        this.applyTheme();
    }

    private applyTheme(): void {
        if (this.isBrowser) {
            if (this.currentTheme === 'dark') {
                this.renderer.addClass(document.body, 'dark-mode');
                this.renderer.removeClass(document.body, 'light-mode');
            } else {
                this.renderer.addClass(document.body, 'light-mode');
                this.renderer.removeClass(document.body, 'dark-mode');
            }
        }
    }
}
