import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ActivatedRoute, RouterModule} from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FinderService, SearchResult, RandomAccount } from '../../data-access/finder.service';
import { interval, Subscription } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlay, faUnlock, faSpinner, faCheck, faTimes,
  faCrown, faUser, faExclamationTriangle, faArrowRight,
  faSearch, faHome, faCogs
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-finder',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, FontAwesomeModule, RouterModule],
  templateUrl: './finder.component.html',
  styleUrl: './finder.component.css'
})
export default class FinderComponent implements OnInit, OnDestroy {
  // Iconos
  faPlay = faPlay;
  faUnlock = faUnlock;
  faSpinner = faSpinner;
  faCheck = faCheck;
  faTimes = faTimes;
  faCrown = faCrown;
  faUser = faUser;
  faExclamationTriangle = faExclamationTriangle;
  faArrowRight = faArrowRight;
  faSearch = faSearch;
  faHome = faHome;
  faCogs = faCogs;

  // Estado del componente
  query: string = '';
  results: SearchResult[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  resultsCount: string = 'Ingresa un término para buscar';
  username: string = 'Usuario';
  userAvatar: string = 'https://mc-heads.net/avatar/Steve';
  isPremium: boolean = false;

  // Bases de datos y versiones
  databases = this.finderService.databases;
  versions = this.finderService.versions;
  selectedDatabase: string = "Nexora_1";
  selectedVersion: string = "1.20.4";

  // Cuenta aleatoria
  randomAccount: RandomAccount | null = null;
  randomAccountSubscription?: Subscription;

  constructor(
      private route: ActivatedRoute,
      private finderService: FinderService
  ) {}

  ngOnInit(): void {
    // Cargar parámetros de URL
    this.route.queryParams.subscribe(params => {
      const nickFromUrl = params['nick'];
      if (nickFromUrl) {
        this.query = nickFromUrl;
        this.performSearch();
      }
    });

    // Cargar cuenta aleatoria y configurar intervalo
    this.loadRandomAccount();
    this.randomAccountSubscription = interval(20000).subscribe(() => {
      this.loadRandomAccount();
    });

    // Solicitar permisos para notificaciones
    this.requestNotificationPermission();
  }

  ngOnDestroy(): void {
    if (this.randomAccountSubscription) {
      this.randomAccountSubscription.unsubscribe();
    }
  }

  performSearch(): void {
    if (this.query.trim().length < 3) {
      this.showError("Por favor, introduce al menos 3 caracteres");
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.results = [];

    // Actualizar información del usuario antes de realizar la búsqueda
    this.updateUserProfile(this.query);

    // Primero verificamos si es premium con la API de Mojang
    this.finderService.checkPremiumStatus(this.query).subscribe({
      next: (mojangData) => {
        if (mojangData) {
          this.isPremium = true;
          this.updateUserProfile(mojangData.name, true);
        } else {
          this.isPremium = false;
        }

        // Buscar en la base de datos
        this.searchInDatabase();
      },
      error: () => {
        this.isPremium = false;
        this.searchInDatabase();
      }
    });
  }

  searchInDatabase(): void {
    this.finderService.searchAccount(this.query).subscribe({
      next: (data) => {
        this.results = data;
        this.isLoading = false;
        this.resultsCount = `${data.length} resultados encontrados para "${this.query}"`;
        this.finderService.addToRecentSearches(this.query);
        this.showNotification("✅ Búsqueda exitosa", `Se encontraron ${data.length} resultados para: ${this.query}`);
      },
      error: () => {
        this.isLoading = false;
        this.showError("No se encontraron resultados");
        this.showNotification("❌ Sin resultados", `No se encontraron datos para: ${this.query}`);
      }
    });
  }

  updateUserProfile(username: string, isPremium: boolean = false): void {
    this.username = username;
    this.userAvatar = `https://mc-heads.net/avatar/${encodeURIComponent(username || "Steve")}`;
    this.isPremium = isPremium;
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.resultsCount = "Error en la búsqueda";
  }

dehashPassword(username: string, hash: string, event: Event): void {
  const buttonElement = event.currentTarget as HTMLButtonElement;
  const wordlist = this.selectedDatabase;

  if (!hash || !wordlist) {
    this.showNotification("⚠️ Error", "Datos insuficientes para dehashear");
    return;
  }

  const originalContent = buttonElement.innerHTML;
  buttonElement.innerHTML = '<fa-icon [icon]="faSpinner" class="fa-spin"></fa-icon> Dehasheando...';
  buttonElement.disabled = true;

  this.showNotification("⏳ Dehasheando...", "En proceso, por favor espera...");

  this.finderService.dehashPassword(username, wordlist, hash).subscribe({
    next: (result) => {
      const passwordElement = buttonElement.closest(".password-container")?.querySelector(".detail-value");
      if (passwordElement && result.password) {
        passwordElement.textContent = result.password;
        passwordElement.classList.add('plaintext');
        this.showNotification("✅ Dehasheo Exitoso", result.message || "Hash descifrado correctamente");

        // Eliminar el botón solo si se descifro
        buttonElement.remove();
      } else {
        this.showNotification("❌ Dehasheo Fallido", "No se pudo descifrar el hash");
        buttonElement.innerHTML = originalContent;
        buttonElement.disabled = false;
      }
    },
    error: () => {
      this.showNotification("❌ Dehasheo Fallido", "No se pudo descifrar el hash");

      buttonElement.innerHTML = originalContent;
      buttonElement.disabled = false;
    }
  });
}

  startBot(username: string, serverip: string, password: string, event: Event): void {
    const buttonElement = event.currentTarget as HTMLButtonElement;

    // Mostrar estado de carga en el botón
    const originalContent = buttonElement.innerHTML;
    buttonElement.innerHTML = '<fa-icon [icon]="faSpinner" class="fa-spin"></fa-icon> Iniciando...';
    buttonElement.disabled = true;

    this.showNotification("🤖 Iniciando AutoCheck...", "Conectando al servidor...");

    this.finderService.startBot({
      host: serverip,
      port: "25565",
      version: this.selectedVersion,
      username: username,
      password: password === "NULL" || password === "N/A" ? "" : password
    }).subscribe({
      next: () => {
        this.showNotification("✅ AutoCheck iniciado exitosamente", `Bot conectado a ${serverip} con ${username}`);
        buttonElement.classList.add("bot-active");
        buttonElement.innerHTML = '<fa-icon [icon]="faCheck"></fa-icon> AutoCheck Exitoso';
        buttonElement.disabled = true;
      },
      error: (error) => {
        this.showNotification("❌ AutoCheck Fallido", error.message || "No se pudo iniciar el AutoCheck");
        buttonElement.classList.add("bot-inactive");
        buttonElement.innerHTML = '<fa-icon [icon]="faTimes"></fa-icon> AutoCheck Fallido';
        buttonElement.disabled = true;
      }
    });
  }

  loadRandomAccount(): void {
    this.finderService.getRandomAccount().subscribe({
      next: (data) => {
        if (data && data.purchases && data.purchases.length > 0) {
          this.randomAccount = data.purchases[0];
        } else {
          this.randomAccount = null;
        }
      },
      error: () => {
        this.randomAccount = null;
      }
    });
  }

getServerIcon(serverip: string): string {
  const config = this.finderService.getServerConfig(serverip);
  const fallbackIcon = "https://i.ibb.co/vKt7BCY/raw-Photoroom.png";

  return config?.icon || `https://eu.mc-api.net/v3/server/favicon/${serverip}` || fallbackIcon;
}

getServerBanner(serverip: string): string {
  const config = this.finderService.getServerConfig(serverip);
  const fallbackBanner = `http://status.mclive.eu/Nexora/nexora.net/25565/banner.png`;

  return config?.banner || `http://status.mclive.eu/Nexora/${serverip}/25565/banner.png` || fallbackBanner;
}

  searchFromRecent(query: string): void {
    this.query = query;
    this.performSearch();
  }

  getRecentSearches(): string[] {
    return this.finderService.getRecentSearches();
  }

  showNotification(title: string, body: string): void {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "../../../assets/Logo.png",
      });
    }
  }

  requestNotificationPermission(): void {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}
