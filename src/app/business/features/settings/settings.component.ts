import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SettingsService } from "../../data-access/settings.service";
import { MainService } from "../../data-access/main.service";
interface UserProfile {
  username: string
  role: string
  time: string
  avatarUrl: string
}

interface Preferences {
  browserNotifications: boolean
  notificationSounds: boolean
  animations: boolean
}

interface PasswordStrength {
  class: string
  message: string
  show: boolean
}

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"],
})
export default class SettingsComponent implements OnInit {
  activeSection = "account"
  passwordForm: FormGroup
  showCurrentPassword = false
  showNewPassword = false
  showConfirmPassword = false
  isChangingPassword = false
  showModal = false
  modalTitle = ""
  modalMessage = ""

  userProfile: UserProfile = {
    username: "Cargando...",
    role: "-",
    time: "-",
    avatarUrl: "https://mc-heads.net/avatar/Steve",
  }

  preferences: Preferences = {
    browserNotifications: true,
    notificationSounds: false,
    animations: true,
  }

  passwordStrength: PasswordStrength = {
    class: "",
    message: "",
    show: false,
  }

  constructor(
    private settingsService: SettingsService,
    private mainService: MainService,
    private fb: FormBuilder,
  ) {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required, Validators.minLength(6)]],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  ngOnInit(): void {
    this.loadUserProfile()
    this.loadPreferences()
    this.fetchAndUpdateTime()
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get("newPassword")
    const confirmPassword = form.get("confirmPassword")

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true })
      return { mismatch: true }
    }

    return null
  }

  setActiveSection(section: string): void {
    this.activeSection = section
  }

  togglePasswordVisibility(field: "current" | "new" | "confirm"): void {
    switch (field) {
      case "current":
        this.showCurrentPassword = !this.showCurrentPassword
        break
      case "new":
        this.showNewPassword = !this.showNewPassword
        break
      case "confirm":
        this.showConfirmPassword = !this.showConfirmPassword
        break
    }
  }

  checkPasswordStrength(): void {
    const password = this.passwordForm.get("newPassword")?.value || ""

    if (password.length === 0) {
      this.passwordStrength.show = false
      return
    }

    let strength = 0
    let feedback = ""

    // Criterios de fortaleza
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength < 3) {
      this.passwordStrength.class = "weak"
      feedback = "⚠️ Contraseña débil - Usa al menos 8 caracteres con mayúsculas, minúsculas y números"
    } else if (strength < 5) {
      this.passwordStrength.class = "medium"
      feedback = "🔶 Contraseña media - Considera agregar caracteres especiales"
    } else {
      this.passwordStrength.class = "strong"
      feedback = "✅ Contraseña fuerte"
    }

    this.passwordStrength.message = feedback
    this.passwordStrength.show = true
  }

  async handlePasswordChange(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.showModalMessage("Error", "❌ Por favor completa todos los campos correctamente")
      return
    }

    const formValue = this.passwordForm.value
    const username = localStorage.getItem("name")
    const token = localStorage.getItem("access_token")

    // Validación de regex
    const passwordRegex = /^[a-zA-Z0-9_-]{1,24}$/
    if (!passwordRegex.test(formValue.currentPassword) || !passwordRegex.test(formValue.newPassword)) {
      this.showModalMessage("Error", "❌ Las contraseñas contienen caracteres inválidos")
      return
    }

    if (formValue.newPassword !== formValue.confirmPassword) {
      this.showModalMessage("Error", "❌ Las contraseñas no coinciden")
      return
    }

    if (!username || !token) {
      this.showModalMessage("Error", "❌ Token inválido")
      return
    }

    this.isChangingPassword = true

    try {
      const response = await this.settingsService.changePassword(
        token,
        username,
        formValue.currentPassword,
        formValue.newPassword,
      )

      if (response) {
        this.showModalMessage("Éxito", `✅ ${response.message || "Contraseña cambiada exitosamente"}`)
        this.passwordForm.reset()
        this.passwordStrength.show = false
      } else {
        this.showModalMessage("Error", "❌ Error al cambiar la contraseña")
      }
    } catch (error) {
      this.showModalMessage("Error", "⚠️ Api Off/Maintenance")
    } finally {
      this.isChangingPassword = false
    }
  }

  async fetchAndUpdateTime(): Promise<void> {
    const token = localStorage.getItem("access_token")
    if (!token) {
      console.error("Token no disponible")
      return
    }

    try {
      const response = await this.settingsService.updateTime(token)
      if (response) {
      this.userProfile = {
        username: response.name,
        role: response.role,
        time: response.time,
        avatarUrl: this.mainService.getAvatarUrl(response.name),
}

        // Guardar en localStorage
        localStorage.setItem("name", response.name)
        localStorage.setItem("role", response.role)
        localStorage.setItem("time", response.time)
      } else {
        console.error("Error al obtener datos del servidor")
      }
    } catch (error) {
      console.error("Error de conexión:", error)
    }
  }

  loadUserProfile(): void {
    const name = localStorage.getItem("name")
    const role = localStorage.getItem("role")
    const time = localStorage.getItem("time")

    if (name) {
    this.userProfile = {
      username: name,
      role: role || "-",
      time: time || "-",
      avatarUrl: this.mainService.getAvatarUrl(name),
      }
    }
  }

  loadPreferences(): void {
    this.preferences = {
      browserNotifications: localStorage.getItem("browserNotifications") !== "false",
      notificationSounds: localStorage.getItem("notificationSounds") === "true",
      animations: localStorage.getItem("animations") !== "false",
    }
  }

  updatePreference(key: keyof Preferences, event: Event): void {
    const target = event.target as HTMLInputElement
    const value = target.checked

    this.preferences[key] = value
    localStorage.setItem(key, value.toString())

    if (key === "animations") {
      document.body.style.setProperty("--animation-duration", value ? "0.3s" : "0s")
    }

    this.showModalMessage(
      "Preferencia actualizada",
      `${this.getPreferenceName(key)} ${value ? "activado" : "desactivado"}`,
    )
  }

  getPreferenceName(key: keyof Preferences): string {
    const names: Record<keyof Preferences, string> = {
      browserNotifications: "Notificaciones del navegador",
      notificationSounds: "Sonidos de notificación",
      animations: "Animaciones",
    }
    return names[key]
  }

  changeAvatar(): void {
    // Implementar lógica para cambiar avatar si es necesario
    this.showModalMessage("Información", "Función de cambio de avatar no implementada")
  }

  showModalMessage(title: string, message: string): void {
    this.modalTitle = title
    this.modalMessage = message
    this.showModal = true

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
      this.closeModal()
    }, 5000)
  }

  closeModal(): void {
    this.showModal = false
  }
}
