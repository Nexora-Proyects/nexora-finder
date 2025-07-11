import { type ComponentFixture, TestBed } from "@angular/core/testing"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"
import SettingsComponent from "./settings.component"
import { SettingsService } from "../../data-access/settings.service"

// Mock del SettingsService
class MockSettingsService {
  async updateTime(token: string) {
    return Promise.resolve({
      name: "TestUser",
      role: "User",
      time: "2024-01-01",
    })
  }

  async changePassword(token: string, username: string, currentPassword: string, newPassword: string) {
    return Promise.resolve({
      message: "Password changed successfully",
    })
  }
}

describe("SettingsComponent", () => {
  let component: SettingsComponent
  let fixture: ComponentFixture<SettingsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent, ReactiveFormsModule, FormsModule],
      providers: [{ provide: SettingsService, useClass: MockSettingsService }],
    }).compileComponents()

    fixture = TestBed.createComponent(SettingsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })

  it("should initialize with account section active", () => {
    expect(component.activeSection).toBe("account")
  })

  it("should change active section", () => {
    component.setActiveSection("security")
    expect(component.activeSection).toBe("security")
  })

  it("should toggle password visibility", () => {
    expect(component.showCurrentPassword).toBeFalsy()
    component.togglePasswordVisibility("current")
    expect(component.showCurrentPassword).toBeTruthy()
  })

  it("should validate password form", () => {
    expect(component.passwordForm.valid).toBeFalsy()

    component.passwordForm.patchValue({
      currentPassword: "oldpass123",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    })

    expect(component.passwordForm.valid).toBeTruthy()
  })
})
