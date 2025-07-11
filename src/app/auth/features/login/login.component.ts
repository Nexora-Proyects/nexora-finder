import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../data-access/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  passwordVisible = false;
  notificationPermissionGranted = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]{1,24}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]{1,24}$/)]]
    });
  }

  async ngOnInit() {
    document.body.classList.add('fade-in');
    await this.checkNotificationPermission();
    this.attemptAutoLogin();
  }

  ngOnDestroy() {
    document.body.classList.remove('fade-in');
  }

  async checkNotificationPermission() {
    if ("Notification" in window) {
      let granted = Notification.permission === "granted";
      if (!granted) {
        const permission = await Notification.requestPermission();
        granted = permission === "granted";
      }
      this.notificationPermissionGranted = granted;
    } else {
      this.notificationPermissionGranted = false;
    }
  }

  async attemptAutoLogin() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return;
    try {
      const data = await this.authService.refreshToken(refreshToken);
      if (data) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        this.showMessage('✅ Autologin exitoso', 'success');
        setTimeout(() => this.router.navigate(['index']), 1500);
      }
    } catch {}
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.showMessage('❌ Usuario o contraseña inválidos', 'error');
      return;
    }
    this.setLoadingState(true);
    const { username, password } = this.loginForm.value;
    try {
      const data = await this.authService.login(username, password);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      this.showMessage('✅ Login exitoso', 'success');
      setTimeout(() => this.router.navigate(['index']), 1500);
    } catch (error: any) {
      this.showMessage(`❌ ${error.message}`, 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  showMessage(message: string, type: 'success' | 'error') {
    const messageBox = document.getElementById('messageBox') as HTMLDivElement;
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = "block";

    if (this.notificationPermissionGranted && "Notification" in window) {
      new Notification('Login', { body: message });
    }

    setTimeout(() => {
      messageBox.style.display = "none";
    }, 3000);
  }

  setLoadingState(loading: boolean) {
    this.loading = loading;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}