// src/app/business/index/index.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export default class IndexComponent implements OnInit, OnDestroy {
  private keydownListener: any;

  constructor(private router: Router) {
  }

  ngOnInit() {
    document.body.classList.add('fade-in');
    this.loadUserData();
    this.setupAnimations();
    this.addInteractivity();

    // Permiso de notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Atajos de teclado
    this.keydownListener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        window.location.href = '../finder/finder.html';
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        window.location.href = '../tools/tools.html';
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        window.location.href = '../settings/settings.html';
      }
    };
    document.addEventListener('keydown', this.keydownListener);
  }

  ngOnDestroy() {
    document.body.classList.remove('fade-in');
    document.removeEventListener('keydown', this.keydownListener);
  }

  loadUserData() {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userTime = document.getElementById('userTime');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = localStorage.getItem('userName') || 'Usuario';
    if (userRole) userRole.textContent = localStorage.getItem('userRole') || 'Invitado';
    if (userTime) userTime.textContent = new Date().toLocaleTimeString();
    if (userAvatar) (userAvatar as HTMLImageElement).src = localStorage.getItem('userAvatar') || 'assets/default-avatar.png';
  }

  logout() {
    localStorage.clear();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sesión cerrada', {
        body: 'Has cerrado sesión exitosamente',
        icon: 'assets/Logo.png',
      });
    }
    setTimeout(() =>
      this.router.navigate(['login'])
    , 500);
  }

  setupAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).style.opacity = '1';
              (entry.target as HTMLElement).style.transform = 'translateY(0)';
            }
          });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll('.slide-up').forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(30px)';
      (el as HTMLElement).style.transition = 'all 0.6s ease-out';
      observer.observe(el);
    });
  }

  addInteractivity() {
    // Feature cards hover
    document.querySelectorAll('.feature-card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        (card as HTMLElement).style.transform = 'translateY(-8px) scale(1.02)';
      });
      card.addEventListener('mouseleave', () => {
        (card as HTMLElement).style.transform = 'translateY(0) scale(1)';
      });
    });

    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        (btn as HTMLElement).style.transform = 'scale(0.95)';
        setTimeout(() => {
          (btn as HTMLElement).style.transform = 'scale(1)';
        }, 150);
      });
    });

    // Stats cards animation
    document.querySelectorAll('.stat-card').forEach((card, index) => {
      (card as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      card.classList.add('slide-up');
    });
  }
}
